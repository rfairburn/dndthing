import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { parseSpellHtml } from './scrape-dnd2024';

/**
 * Debug CLI that exercises the production spell parser for a single spell.
 *
 * Usage: npx tsx scripts/test-scrape.ts [spell-name]
 *        npx tsx scripts/test-scrape.ts --help
 *
 * Fetches the spell page once (saving a copy to the cache for inspection),
 * runs it through the exact same extraction logic used by the production
 * scraper, and exits nonzero on failure.
 *
 * Importing this module has no side effects: the CLI only runs when this
 * file is the direct entry point, and --help/-h prints usage before any
 * fetch, cache write, or browser launch.
 */

/** Print CLI usage. Pure output; safe to call before any I/O. */
function printUsage(): void {
  console.log('Usage: npx tsx scripts/test-scrape.ts [spell-name]');
  console.log('');
  console.log('Debug CLI that exercises the production spell parser for a single spell.');
  console.log('Fetches the spell page once (saving a copy to cache/wikidot/spells/),');
  console.log('runs it through the exact same extraction logic used by the production');
  console.log('scraper, and exits nonzero on failure.');
  console.log('');
  console.log('Arguments:');
  console.log('  spell-name    Wikidot spell slug to test (default: cure-wounds)');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help    Show this help message and exit');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle help before any fetch, cache write, or browser launch.
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const spellName = args[0] || 'cure-wounds';
  const url = `http://dnd2024.wikidot.com/spell:${spellName}`;

  console.log(`🔍 Testing scrape of ${spellName}\n`);
  console.log(`URL: ${url}\n`);

  // Fetch HTML once and save a copy for offline debugging
  let html: string;
  try {
    const response = await axios.get(url, { timeout: 10000 });
    html = response.data;

    const cacheDir = path.join(process.cwd(), 'cache', 'wikidot', 'spells');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    fs.writeFileSync(path.join(cacheDir, `test-${safeName}.html`), html);
    console.log(`✓ Saved HTML to cache/test-${safeName}.html\n`);
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch ${url}: ${(error as Error).message}`);
    process.exit(1);
  }

  // Run the page through the production spell parser
  // --no-sandbox: required on hosts where AppArmor blocks unprivileged user
  // namespaces (kernel.apparmor_restrict_unprivileged_userns=1), e.g. Ubuntu 24.04+
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  try {
    console.log('🎯 Running production spell parser...\n');

    const spellData = await parseSpellHtml(browser, html, spellName);

    if (!spellData || !spellData.name) {
      console.error('❌ Production spell parser returned no data');
      process.exitCode = 1;
      return;
    }

    console.log('Extracted data:', JSON.stringify(spellData, null, 2));
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed.');
  }
}

/**
 * Only execute the CLI when this module is the direct entry point.
 * Importing this file (e.g. from tests or other scripts) must not fetch,
 * write cache files, or launch a browser.
 */
function isDirectEntry(): boolean {
  if (!process.argv[1]) return false;
  const stripExtension = (href: string) => href.replace(/\.(ts|mts|cts|tsx|jsx|js|mjs|cjs)$/, '');
  try {
    return stripExtension(pathToFileURL(process.argv[1]).href) === stripExtension(import.meta.url);
  } catch {
    return false;
  }
}

if (isDirectEntry()) {
  main().catch((error: unknown) => {
    console.error('❌ Unexpected failure:', error);
    process.exitCode = 1;
  });
}