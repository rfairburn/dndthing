import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import axios from 'axios';

const CACHE_DIR = path.join(process.cwd(), 'cache', 'wikidot', 'spells');
const FAILED_CACHE_DIR = path.join(process.cwd(), 'cache', 'wikidot', 'failed');
const MANIFEST_FILE = path.join(CACHE_DIR, '..', 'manifest.json');

interface CacheEntry {
  url: string;
  cachedAt: string;
  checksum: string;
  status: 'success' | 'warning' | 'error';
  errorMessage?: string;
}

interface Manifest {
  lastUpdated: string;
  totalPagesScraped: number;
  pages: Record<string, CacheEntry>;
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  
  const manifestPath = path.join(CACHE_DIR, '..', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    const initialManifest: Manifest = {
      lastUpdated: new Date().toISOString(),
      totalPagesScraped: 0,
      pages: {}
    };
    fs.writeFileSync(manifestPath, JSON.stringify(initialManifest, null, 2));
  }
}

/**
 * Ensure failed cache directory exists
 */
export function ensureFailedCacheDir(): void {
  if (!fs.existsSync(FAILED_CACHE_DIR)) {
    fs.mkdirSync(FAILED_CACHE_DIR, { recursive: true });
  }
}

/**
 * Save HTML to failed cache for debugging
 */
export function saveFailedHtml(spellName: string, html: string): void {
  ensureFailedCacheDir();
  
  const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const failedPath = path.join(FAILED_CACHE_DIR, `spell-${safeName}-${timestamp}.html`);
  
  fs.writeFileSync(failedPath, html, 'utf-8');
}

/**
 * Delete failed HTML file if it exists
 */
export function deleteFailedHtml(spellName: string): void {
  const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Find and delete all matching failed files
  if (fs.existsSync(FAILED_CACHE_DIR)) {
    const files = fs.readdirSync(FAILED_CACHE_DIR);
    for (const file of files) {
      if (file.startsWith(`spell-${safeName}-`) && file.endsWith('.html')) {
        const filePath = path.join(FAILED_CACHE_DIR, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`  ⚠️  Could not delete failed cache file: ${filePath}`);
        }
      }
    }
  }
}

/**
 * Calculate MD5 checksum of content
 */
function calculateChecksum(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Get cache file path for a spell
 */
export function getCachePath(spellName: string): string {
  const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return path.join(CACHE_DIR, `spell-${safeName}.html`);
}

/**
 * Get checksum file path for a spell
 */
export function getChecksumPath(spellName: string): string {
  const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return path.join(CACHE_DIR, `spell-${safeName}.checksum`);
}

/**
 * Load manifest from disk
 */
function loadManifest(): Manifest {
  const manifestPath = path.join(CACHE_DIR, '..', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }
  
  return {
    lastUpdated: new Date().toISOString(),
    totalPagesScraped: 0,
    pages: {}
  };
}

/**
 * Save manifest to disk
 */
function saveManifest(manifest: Manifest): void {
  const manifestPath = path.join(CACHE_DIR, '..', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Check if cached version is still valid (checksum matches)
 */
export function isCacheValid(spellName: string): boolean {
  const checksumPath = getChecksumPath(spellName);
  
  if (!fs.existsSync(checksumPath)) {
    return false;
  }
  
  // We'll compare checksums when we fetch the page
  return true;
}

/**
 * Save HTML content to cache with checksum
 */
export function saveToCache(
  spellName: string, 
  html: string, 
  url: string
): { cached: boolean; isNew: boolean } {
  ensureCacheDir();
  
  const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cachePath = path.join(CACHE_DIR, `spell-${safeName}.html`);
  const checksumPath = path.join(CACHE_DIR, `spell-${safeName}.checksum`);
  
  const newChecksum = calculateChecksum(html);
  let isNew = false;
  
  // Check if we already have this cached with same content
  if (fs.existsSync(checksumPath)) {
    const oldChecksum = fs.readFileSync(checksumPath, 'utf-8').trim();
    if (oldChecksum === newChecksum) {
      return { cached: true, isNew: false };
    }
  }
  
  // Save new content
  fs.writeFileSync(cachePath, html, 'utf-8');
  fs.writeFileSync(checksumPath, newChecksum, 'utf-8');
  isNew = true;
  
  // Update manifest
  const manifest = loadManifest();
  manifest.pages[safeName] = {
    url,
    cachedAt: new Date().toISOString(),
    checksum: newChecksum,
    status: 'success'
  };
  manifest.totalPagesScraped = Object.keys(manifest.pages).length;
  manifest.lastUpdated = new Date().toISOString();
  saveManifest(manifest);
  
  return { cached: true, isNew };
}

/**
 * Load cached HTML if available
 */
export function loadFromCache(spellName: string): string | null {
  const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cachePath = path.join(CACHE_DIR, `spell-${safeName}.html`);
  
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'utf-8');
  }
  
  return null;
}

/**
 * Fetch HTML from URL with caching
 */
export async function fetchWithCache(
  spellName: string, 
  url: string
): Promise<{ html: string; cached: boolean; isNew: boolean }> {
  ensureCacheDir();
  
  // Check if we have a valid cache
  const cachedHtml = loadFromCache(spellName);
  if (cachedHtml) {
    const checksumPath = getChecksumPath(spellName);
    if (fs.existsSync(checksumPath)) {
      const savedChecksum = fs.readFileSync(checksumPath, 'utf-8').trim();
      const currentChecksum = calculateChecksum(cachedHtml);
      
      if (savedChecksum === currentChecksum) {
        console.log(`  ⚡ Using cached version of ${spellName}`);
        return { html: cachedHtml, cached: true, isNew: false };
      }
    }
  }
  
  // Fetch fresh content
  console.log(`  🌐 Fetching ${url}...`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'D&D Character Generator Scraper (Mozilla/5.0)'
      },
      timeout: 10000,
      maxRedirects: 5
    });
    
    const html = response.data;
    const { isNew } = saveToCache(spellName, html, url);
    
    if (isNew) {
      console.log(`  ✓ Scraped ${spellName}`);
    } else {
      console.log(`  ⚡ Updated cache for ${spellName}`);
    }
    
    return { html, cached: true, isNew };
  } catch (error: any) {
    // If fetch fails but we have cache, use it with warning
    if (cachedHtml) {
      console.warn(`  ⚠️  Failed to fetch ${spellName}, using cached version`);
      
      // Update manifest with warning status
      const manifest = loadManifest();
      const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (manifest.pages[safeName]) {
        manifest.pages[safeName].status = 'warning';
        manifest.pages[safeName].errorMessage = error.message;
        saveManifest(manifest);
      }
      
      return { html: cachedHtml, cached: true, isNew: false };
    }
    
    // No cache and fetch failed
    console.error(`  ❌ Failed to fetch ${spellName}: ${error.message}`);
    
    const manifest = loadManifest();
    const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    manifest.pages[safeName] = {
      url,
      cachedAt: new Date().toISOString(),
      checksum: '',
      status: 'error',
      errorMessage: error.message
    };
    saveManifest(manifest);
    
    throw error;
  }
}

/**
 * Get manifest statistics
 */
export function getStats(): { total: number; success: number; warnings: number; errors: number } {
  const manifest = loadManifest();
  
  let success = 0, warnings = 0, errors = 0;
  for (const entry of Object.values(manifest.pages)) {
    if (entry.status === 'success') success++;
    else if (entry.status === 'warning') warnings++;
    else if (entry.status === 'error') errors++;
  }
  
  return {
    total: manifest.totalPagesScraped,
    success,
    warnings,
    errors
  };
}

/**
 * Clear all cache (useful for testing)
 */
export function clearCache(): void {
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
  }
  
  if (fs.existsSync(FAILED_CACHE_DIR)) {
    fs.rmSync(FAILED_CACHE_DIR, { recursive: true, force: true });
  }
  
  const manifestPath = path.join(CACHE_DIR, '..', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
  }
  
  console.log('✓ Cache cleared');
}
