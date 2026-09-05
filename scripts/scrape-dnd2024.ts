import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import axios from 'axios';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runBatchScrape, printSummary } from './scrape-runner';
import type { BatchScrapeConfig, CliScrapeOptions, ScrapeRecord } from './scrape-runner';
import type {
  BackgroundRecord,
  ClassRecord,
  FeatRecord,
  NameShimWindow,
  SpeciesRecord,
  SpeciesTrait,
  SpellComponents,
  SpellRecord,
  SubclassRecord
} from './scrape-types';

/** Parsed CLI options for the scraper. */
interface CliConfig {
  types: string;
  maxItems: number | null;
  items: string;
  continueOnError: boolean;
  delay: number;
  retries: number;
}

/** Parse CLI options. Only invoked when this script is the direct entry point. */
function parseCliConfig(): CliConfig {
  const argv = yargs(hideBin(process.argv))
    .option('types', {
      alias: 't',
      type: 'string',
      default: 'all',
      description: 'Type of content to scrape (comma-separated, e.g., spells,subclasses)'
    })
    .option('max-items', {
      alias: 'm',
      type: 'number',
      default: null,
      description: 'Limit scrape to first N items (for testing)'
    })
    .option('items', {
      alias: 'i',
      type: 'string',
      default: '',
      description: 'Specific item names to scrape (comma-separated)'
    })
    .option('continue-on-error', {
      alias: 'c',
      type: 'boolean',
      default: false,
      description: 'Continue scraping after errors instead of stopping'
    })
    .option('delay', {
      alias: 'd',
      type: 'number',
      default: 200,
      description: 'Delay between requests in milliseconds'
    })
    .option('retries', {
      alias: 'r',
      type: 'number',
      default: 3,
      description: 'Max retry attempts per item'
    })
    .help()
    .alias('help', 'h')
    .parseSync();

  return {
    types: argv.types,
    maxItems: argv.maxItems ?? null,
    items: argv.items,
    continueOnError: argv.continueOnError,
    delay: argv.delay,
    retries: argv.retries
  };
}

type ScrapeType = 'spells' | 'subclasses' | 'feats' | 'backgrounds' | 'species' | 'classes';

async function getAllSpellNames(browser: Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all spells from http://dnd2024.wikidot.com/spell:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/spell:all', { timeout: 10000 });
    html = response.data;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch spell index page: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  await page.setContent(html);
  
  const spellLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    const allLinks = document.querySelectorAll('a[href^="/spell:"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.includes('-school')) {
        const match = href.match(/\/spell:([a-zA-Z0-9-]+)/);
        if (match) {
          links.push(match[1]);
        }
      }
    });
    
    return [...new Set(links)];
  });
  
  console.log(`  ✓ Found ${spellLinks.length} total spells`);
  return spellLinks;
}

async function getAllSubclassNames(browser: Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all subclasses...`);
  
  const classPages = [
    'artificer', 'barbarian', 'bard', 'cleric', 'druid', 
    'fighter', 'monk', 'paladin', 'ranger', 'rogue', 
    'sorcerer', 'warlock', 'wizard'
  ];
  
  const allSubclasses: string[] = [];
  
  for (const className of classPages) {
    try {
      const page = await browser.newPage();
      
      let html: string;
      try {
        const response = await axios.get(`http://dnd2024.wikidot.com/${className}:main`, { timeout: 10000 });
        html = response.data;
      } catch {
        console.warn(`  ⚠️  Failed to fetch ${className} page`);
        continue;
      }
      
      await page.setContent(html);
      
      const subclasses = await page.evaluate(() => {
        const links: string[] = [];
        
        // Look for subclass tables with class "wiki-content-table"
        const tables = document.querySelectorAll('.list-pages-box table.wiki-content-table');
        
        tables.forEach(table => {
          const rows = table.querySelectorAll('tr td a[href]');
          
          rows.forEach(row => {
            const href = row.getAttribute('href');
            if (href && !href.includes(':main') && !href.includes(':spell-list')) {
              // Match pattern like /artificer:alchemist or /wizard:bladesinger
              const match = href.match(/\/[a-z]+:([a-zA-Z0-9-]+)/);
              if (match) {
                links.push(match[1]);
              }
            }
          });
        });
        
        return [...new Set(links)];
      });
      
      allSubclasses.push(...subclasses);
      
    } catch (error: unknown) {
      console.warn(`  ⚠️  Error fetching subclasses for ${className}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  const uniqueSubclasses = [...new Set(allSubclasses)];
  console.log(`  ✓ Found ${uniqueSubclasses.length} total subclasses`);
  return uniqueSubclasses;
}

async function getAllFeatNames(browser: Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all feats from http://dnd2024.wikidot.com/feat:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/feat:all', { timeout: 10000 });
    html = response.data;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch feat index page: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  await page.setContent(html);
  
  const featLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    const allLinks = document.querySelectorAll('a[href^="/feat:"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.includes('#toc')) {
        const match = href.match(/\/feat:([a-zA-Z0-9-]+)/);
        if (match) {
          links.push(match[1]);
        }
      }
    });
    
    return [...new Set(links)];
  });
  
  console.log(`  ✓ Found ${featLinks.length} total feats`);
  return featLinks;
}

async function getAllBackgroundNames(browser: Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all backgrounds from http://dnd2024.wikidot.com/background:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/background:all', { timeout: 10000 });
    html = response.data;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch background index page: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  await page.setContent(html);
  
  const backgroundLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    const allLinks = document.querySelectorAll('a[href^="/background:"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.includes('#toc')) {
        const match = href.match(/\/background:([a-zA-Z0-9-]+)/);
        if (match) {
          links.push(match[1]);
        }
      }
    });
    
    return [...new Set(links)];
  });
  
  console.log(`  ✓ Found ${backgroundLinks.length} total backgrounds`);
  return backgroundLinks;
}

async function getAllSpeciesNames(browser: Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all species from http://dnd2024.wikidot.com/species:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/species:all', { timeout: 10000 });
    html = response.data;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch species index page: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  await page.setContent(html);
  
  const speciesLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    // Look for all links starting with /species: (excluding :all)
    const allLinks = document.querySelectorAll('a[href^="/species:"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.includes(':all') && !href.includes('#toc')) {
        const match = href.match(/\/species:([a-zA-Z0-9-]+)/);
        if (match) {
          links.push(match[1]);
        }
      }
    });
    
    return [...new Set(links)];
  });
  
  console.log(`  ✓ Found ${speciesLinks.length} total species`);
  return speciesLinks;
}

async function fetchPageHtml(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    return response.data;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function scrapeSpellPage(browser: Browser, spellName: string): Promise<SpellRecord | null> {
  const url = `http://dnd2024.wikidot.com/spell:${spellName}`;
  const html = await fetchPageHtml(url);
  
  return parseSpellHtml(browser, html, spellName);
}

/**
 * Extract spell data from raw page HTML using the browser (production parser).
 * Exported so the debug CLI can exercise the exact same extraction logic.
 */
export async function parseSpellHtml(browser: Browser, html: string, spellName: string): Promise<SpellRecord | null> {
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as NameShimWindow).__name = (fn) => fn;
    });
    
    await page.setJavaScriptEnabled(false);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    const spellData = await page.evaluate((spellParam: string) => {
      function parseLevelSchoolClasses(text: string): { level: number; school: string; classes: string[] } {
        let level = 0;
        let school = '';
        let classes: string[] = [];
        
        const cantripMatch = text.match(/^([a-z]+)\s+Cantrip\s+\(([^)]+)\)/i);
        if (cantripMatch) {
          school = cantripMatch[1].toLowerCase();
          classes = cantripMatch[2].split(',').map(c => c.trim().toLowerCase());
          return { level, school, classes };
        }
        
        const levelMatch = text.match(/Level\s+(\d+)/);
        if (levelMatch) {
          level = parseInt(levelMatch[1], 10);
        }
        
        const schoolMatch = text.match(/Level\s+\d+\s+([a-z]+)/i);
        if (schoolMatch) {
          school = schoolMatch[1].toLowerCase();
        }
        
        const classesMatch = text.match(/\(([^)]+)\)/);
        if (classesMatch) {
          const classText = classesMatch[1];
          classes = classText.split(',').map(c => c.trim().toLowerCase());
        }
        
        return { level, school, classes };
      }
      
      function parseStatsLine(text: string): { castingTime: string; range: string; components: SpellComponents; duration: string } {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        
        let castingTime = '';
        let range = '';
        let verbal = false, somatic = false, material = false;
        let duration = '';
        
        for (const line of lines) {
          if (line.startsWith('Casting Time:')) {
            castingTime = line.replace('Casting Time:', '').trim();
          } else if (line.startsWith('Range:')) {
            range = line.replace('Range:', '').trim();
          } else if (line.startsWith('Components:') || line.startsWith('Component:')) {
            const comps = line.replace(/^(Components?:)/, '').trim();
            verbal = /V|verbal/i.test(comps);
            somatic = /S|somatic/i.test(comps);
            material = /M|material/i.test(comps);
          } else if (line.startsWith('Duration:')) {
            duration = line.replace('Duration:', '').trim();
          }
        }
        
        return { castingTime, range, components: { verbal, somatic, material }, duration };
      }
      
      const titleSpan = document.querySelector('.page-title.page-header span');
      const friendlyName = titleSpan?.textContent?.trim() || spellParam;
      
      const paragraphTexts = Array.from(document.querySelectorAll('.main-content p')).map(p => p.textContent?.trim() || '');
      const listItems = Array.from(document.querySelectorAll('.main-content ul li')).map(li => {
        const text = li.textContent?.trim() || '';
        return text.replace(/^<strong>([^.]+)\.<\/strong>\s*/, '$1.');
      });

      const allTextElements = [...paragraphTexts, ...listItems];

      if (allTextElements.length < 3) {
        return null;
      }

      let levelSchoolLine = '';
      let statsLine = '';
      let descriptionStartIndex = 2;

      if (paragraphTexts[0].includes('Source:') && paragraphTexts[0].match(/Level\s+\d+/)) {
        let combinedText = paragraphTexts[0];
        
        const sourceMatch = combinedText.match(/^Source:[^\n]+/);
        if (sourceMatch) {
          combinedText = combinedText.replace(sourceMatch[0], '').trim();
        }
        
        levelSchoolLine = combinedText;
        statsLine = combinedText;
        descriptionStartIndex = 1;
      } else {
        levelSchoolLine = paragraphTexts[1];
        statsLine = paragraphTexts[2];
      }

      if (!levelSchoolLine) {
        return null;
      }

      const { level, school, classes } = parseLevelSchoolClasses(levelSchoolLine);

      const fullStatsText = paragraphTexts[descriptionStartIndex - 1] + '\n' + (statsLine || '');
      const { castingTime, range, components, duration } = parseStatsLine(fullStatsText);

      let descStartIdx = descriptionStartIndex;
      for (let i = descriptionStartIndex; i < allTextElements.length; i++) {
        const elem = allTextElements[i];
        if (/^(Casting Time|Range|Components|Duration):/.test(elem)) {
          descStartIdx = i + 1;
        } else {
          break;
        }
      }

      const atHigherLevelsElements = allTextElements.slice(descStartIdx).filter(p => p && !p.startsWith('Using a Higher-Level'));
      let description = atHigherLevelsElements.join('\n\n');

      const higherLevelPara = allTextElements.find(p => p.startsWith('Using a Higher-Level'));
      if (higherLevelPara) {
        description += '\n\n' + higherLevelPara;
      }
      
      return {
        name: friendlyName,
        level,
        school: school || undefined,
        castingTime: castingTime || undefined,
        range: range || undefined,
        components,
        duration: duration || undefined,
        description: description || undefined,
        classes,
        atHigherLevels: higherLevelPara ? higherLevelPara.replace('Using a Higher-Level Spell Slot.', '').trim() : undefined
      };
    }, spellName);
    
    return spellData;
    
  } finally {
    await page.close();
  }
}

async function scrapeSubclassPage(browser: Browser, subclassName: string): Promise<SubclassRecord | null> {
  // Subclasses use pattern /classname:name (e.g., /artificer:alchemist)
  // Try each class prefix until we find a valid URL
  const classPrefixes = ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 
    'fighter', 'monk', 'paladin', 'ranger', 'rogue', 
    'sorcerer', 'warlock', 'wizard'];
  
  let html: string | null = null;
  
  for (const prefix of classPrefixes) {
    const testUrl = `http://dnd2024.wikidot.com/${prefix}:${subclassName}`;
    try {
      const response = await axios.get(testUrl, { timeout: 5000 });
      if (response.status === 200) {
        html = response.data;
        break;
      }
    } catch {
      continue;
    }
  }
  
  if (!html) {
    throw new Error(`Could not find URL for subclass: ${subclassName}`);
  }
  
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as NameShimWindow).__name = (fn) => fn;
    });
    
    await page.setJavaScriptEnabled(false);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    const subclassData = await page.evaluate((subclassNameParam: string) => {
      const titleSpan = document.querySelector('.page-title.page-header span');
      const friendlyName = titleSpan?.textContent?.trim() || subclassNameParam;
      
      const paragraphTexts = Array.from(document.querySelectorAll('.main-content p')).map(p => p.textContent?.trim() || '');
      
      if (paragraphTexts.length < 2) {
        return null;
      }
      
      let descriptionStartIndex = 0;
      for (let i = 0; i < paragraphTexts.length; i++) {
        const para = paragraphTexts[i];
        if (!para.startsWith('Source:') && !para.includes('[Home]') && !para.includes('»')) {
          descriptionStartIndex = i;
          break;
        }
      }
      
      let description = '';
      for (let i = descriptionStartIndex; i < paragraphTexts.length; i++) {
        const para = paragraphTexts[i];
        if (para && !para.startsWith('Source:') && !para.includes('[Home]') && !para.includes('»')) {
          description += para + '\n\n';
        }
      }
      
      description = description.trim();
      
      const sourceMatch = paragraphTexts.find(p => p.startsWith('Source:'));
      const source = sourceMatch ? sourceMatch.replace('Source:', '').trim() : undefined;
      
      return {
        name: friendlyName,
        description: description || undefined,
        source: source || undefined
      };
    }, subclassName);
    
    return subclassData;
    
  } finally {
    await page.close();
  }
}

async function scrapeFeatPage(browser: Browser, featName: string): Promise<FeatRecord | null> {
  const url = `http://dnd2024.wikidot.com/feat:${featName}`;
  const html = await fetchPageHtml(url);
  
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as NameShimWindow).__name = (fn) => fn;
    });
    
    await page.setJavaScriptEnabled(false);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    const featData = await page.evaluate((featParam: string) => {
      const titleSpan = document.querySelector('.page-title.page-header span');
      const friendlyName = titleSpan?.textContent?.trim() || featParam;
      
      const paragraphTexts = Array.from(document.querySelectorAll('.main-content p')).map(p => p.textContent?.trim() || '');
      const listItems = Array.from(document.querySelectorAll('.main-content ul li')).map(li => {
        const text = li.textContent?.trim() || '';
        return text.replace(/^<strong>([^.]+)\.<\/strong>\s*/, '$1.');
      });

      const allTextElements = [...paragraphTexts, ...listItems];
      
      if (allTextElements.length < 2) {
        return null;
      }
      
      let descriptionStartIndex = 0;
      for (let i = 0; i < allTextElements.length; i++) {
        const elem = allTextElements[i];
        if (!elem.startsWith('Source:') && !elem.includes('[Home]') && !elem.includes('»')) {
          descriptionStartIndex = i;
          break;
        }
      }
      
      let description = '';
      for (let i = descriptionStartIndex; i < allTextElements.length; i++) {
        const elem = allTextElements[i];
        if (elem && !elem.startsWith('Source:') && !elem.includes('[Home]') && !elem.includes('»')) {
          description += elem + '\n\n';
        }
      }
      
      description = description.trim();
      
      const sourceMatch = paragraphTexts.find(p => p.startsWith('Source:'));
      const source = sourceMatch ? sourceMatch.replace('Source:', '').trim() : undefined;
      
      return {
        name: friendlyName,
        description: description || undefined,
        source: source || undefined
      };
    }, featName);
    
    return featData;
    
  } finally {
    await page.close();
  }
}

async function scrapeBackgroundPage(browser: Browser, backgroundName: string): Promise<BackgroundRecord | null> {
  const url = `http://dnd2024.wikidot.com/background:${backgroundName}`;
  const html = await fetchPageHtml(url);
  
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as NameShimWindow).__name = (fn) => fn;
    });
    
    await page.setJavaScriptEnabled(false);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
 const backgroundData = await page.evaluate((backgroundParam: string) => {
      const titleSpan = document.querySelector('.page-title.page-header span');
      const friendlyName = titleSpan?.textContent?.trim() || backgroundParam;
      
      // Get all paragraphs, splitting by <br> tags to separate fields on same line
      const rawParagraphs = Array.from(document.querySelectorAll('.main-content p'));
      const textLines: string[] = [];
      
      for (const para of rawParagraphs) {
        // Split paragraph by <br> tags into separate lines
        const htmlContent = para.innerHTML;
        const lines = htmlContent.split(/<br\s*\/?>/i);
        
        for (const line of lines) {
          // Convert HTML entities and extract text content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = line;
          const text = tempDiv.textContent?.trim() || '';
          if (text) {
            textLines.push(text);
          }
        }
      }
      
      if (textLines.length === 0) {
        return null;
      }
      
      let source: string | undefined;
      let abilityScores: string[] = [];
      let feat: string | undefined;
      const skillProficiencies: string[] = [];
      const toolProficiencies: string[] = [];
      let equipmentText: string | undefined;
      const descriptionParts: string[] = [];
      
      for (const text of textLines) {
        // Skip source line
        if (text.startsWith('Source:')) {
          source = text.replace('Source:', '').trim();
          continue;
        }
        
        // Skip navigation links
        if (text.includes('[Home]') || text.includes('»')) {
          continue;
        }
        
        // Split on first colon to get key/value
        const colonIndex = text.indexOf(':');
        if (colonIndex !== -1) {
          const label = text.substring(0, colonIndex).trim().toLowerCase();
          
          // Only treat as field if label matches known field names
          const knownLabels = ['ability scores', 'feat', 'skill proficiencies', 'tool proficiency', 
                               'tool proficiencies', 'equipment'];
          
          if (knownLabels.includes(label)) {
            const value = text.substring(colonIndex + 1).trim();
            
            if (label === 'ability scores') {
              abilityScores = value.split(/,\s*/).filter(s => s.trim());
            } else if (label === 'feat') {
              feat = value;
            } else if (label === 'skill proficiencies') {
              skillProficiencies.push(...value.split(/ and |,/).map(s => s.trim()).filter(Boolean));
            } else if (label === 'tool proficiency' || label === 'tool proficiencies') {
              if (value !== 'Choose one kind of') {
                toolProficiencies.push(value);
              }
            } else if (label === 'equipment') {
              equipmentText = value;
            }
          } else {
            // Not a known field label, treat as description
            descriptionParts.push(text);
          }
        } else if (text) {
          // No colon means it's part of the main description
          descriptionParts.push(text);
        }
      }
      
      const description = descriptionParts.join('\n\n').trim();
      
      return {
        name: friendlyName,
        source: source || undefined,
        abilityScores: abilityScores.length > 0 ? abilityScores : undefined,
        feat: feat || undefined,
        skillProficiencies: skillProficiencies.length > 0 ? skillProficiencies : undefined,
        toolProficiency: toolProficiencies.length > 0 ? toolProficiencies : undefined,
        equipment: equipmentText || undefined,
        description: description || undefined
      };
    }, backgroundName);
    
    if (!backgroundData) {
      throw new Error('Failed to extract background data from page');
    }
    
    return backgroundData;
    
  } finally {
    await page.close();
  }
}

async function scrapeSpeciesPage(browser: Browser, speciesName: string): Promise<SpeciesRecord | null> {
  const url = `http://dnd2024.wikidot.com/species:${speciesName}`;
  const html = await fetchPageHtml(url);
  
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as NameShimWindow).__name = (fn) => fn;
    });
    
    await page.setJavaScriptEnabled(false);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    const speciesData = await page.evaluate((speciesParam: string) => {
      const titleSpan = document.querySelector('.page-title.page-header span');
      const friendlyName = titleSpan?.textContent?.trim() || speciesParam;
      
      // Get all paragraphs from main content, splitting by <br> tags
      const rawParagraphs = Array.from(document.querySelectorAll('.main-content p'));
      const textLines: string[] = [];
      
      for (const para of rawParagraphs) {
        const htmlContent = para.innerHTML;
        const lines = htmlContent.split(/<br\s*\/?>/i);
        
        for (const line of lines) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = line;
          const text = tempDiv.textContent?.trim() || '';
          if (text) {
            textLines.push(text);
          }
        }
      }
      
      if (textLines.length === 0) {
        return null;
      }
      
      let source: string | undefined;
      let creatureType: string | undefined;
      let size: string | undefined;
      let speed: number | undefined;
      const traits: SpeciesTrait[] = [];
      const descriptionParts: string[] = [];
      
      for (const text of textLines) {
        // Skip source line
        if (text.startsWith('Source:')) {
          source = text.replace('Source:', '').trim();
          continue;
        }
        
        // Skip navigation links
        if (text.includes('[Home]') || text.includes('»')) {
          continue;
        }
        
        // Parse species traits section - each field is on its own line
        if (text.startsWith('Creature Type:')) {
          creatureType = text.replace('Creature Type:', '').trim();
          continue;
        }
        
        if (text.startsWith('Size:')) {
          size = text.replace('Size:', '').trim();
          continue;
        }
        
        if (text.startsWith('Speed:')) {
          const speedText = text.replace('Speed:', '').trim();
          // Extract number from "30 feet" format
          const match = speedText.match(/(\d+)/);
          if (match) {
            speed = parseInt(match[1], 10);
          }
          continue;
        }
        
        // Check for trait headers (bold text followed by description)
        // Traits typically start with a capitalized name and period, like "Darkvision." or "Dwarven Resilience."
        const traitMatch = text.match(/^([A-Z][^.]+)\.\s*(.+)$/);
        if (traitMatch && !text.startsWith('As a ') && !text.includes('You can use this')) {
          traits.push({
            name: traitMatch[1].trim(),
            description: traitMatch[2].trim()
          });
        } else if (text) {
          // Otherwise it's part of the main description
          descriptionParts.push(text);
        }
      }
      
      const description = descriptionParts.join('\n\n').trim();
      
      const speciesData: SpeciesRecord = {
        name: friendlyName,
        source: source || undefined,
        creatureType: creatureType || undefined,
        speed: speed || undefined,
        traits: traits.length > 0 ? traits : undefined,
        description: description || undefined
      };
      
      // Add size fields if size was found
      if (size) {
        speciesData.sizeDescription = size;
        
        // Extract available sizes from description in UI order: Small first, then Medium
        const sizes: string[] = [];
        if (size.includes('Small')) {
          sizes.push('Small');
        }
        if (size.includes('Medium')) {
          sizes.push('Medium');
        }
        
        speciesData.sizes = sizes;
      }
      
      return speciesData;
    }, speciesName);
    
    if (!speciesData) {
      throw new Error('Failed to extract species data from page');
    }
    
    return speciesData;
    
  } finally {
    await page.close();
  }
}

/** Map CLI options to the shared batch runner's config shape. */
function cliOptions(config: CliConfig): CliScrapeOptions {
  return {
    items: config.items,
    maxItems: config.maxItems,
    delay: config.delay,
    retries: config.retries,
    continueOnError: config.continueOnError
  };
}

function spellsBatchConfig(config: CliConfig): BatchScrapeConfig<ScrapeRecord> {
  return {
    pluralLabel: 'spells',
    pageLabel: 'spell pages',
    outputFilename: 'src/data/spells.json',
    getIndex: getAllSpellNames,
    scrapePage: scrapeSpellPage,
    cli: cliOptions(config)
  };
}

function subclassesBatchConfig(config: CliConfig): BatchScrapeConfig<ScrapeRecord> {
  return {
    pluralLabel: 'subclasses',
    pageLabel: 'subclass pages',
    outputFilename: 'src/data/subclasses.json',
    getIndex: getAllSubclassNames,
    scrapePage: scrapeSubclassPage,
    cli: cliOptions(config)
  };
}

function featsBatchConfig(config: CliConfig): BatchScrapeConfig<ScrapeRecord> {
  return {
    pluralLabel: 'feats',
    pageLabel: 'feat pages',
    outputFilename: 'src/data/feats.json',
    getIndex: getAllFeatNames,
    scrapePage: scrapeFeatPage,
    cli: cliOptions(config)
  };
}

function backgroundsBatchConfig(config: CliConfig): BatchScrapeConfig<ScrapeRecord> {
  return {
    pluralLabel: 'backgrounds',
    pageLabel: 'background pages',
    outputFilename: 'src/data/backgrounds.json',
    getIndex: getAllBackgroundNames,
    scrapePage: scrapeBackgroundPage,
    cli: cliOptions(config)
  };
}

function speciesBatchConfig(config: CliConfig): BatchScrapeConfig<ScrapeRecord> {
  return {
    pluralLabel: 'species',
    pageLabel: 'species pages',
    outputFilename: 'src/data/species.json',
    getIndex: getAllSpeciesNames,
    scrapePage: scrapeSpeciesPage,
    cli: cliOptions(config)
  };
}

async function getAllClassNames(browser: Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all classes from http://dnd2024.wikidot.com/class:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/class:all', { timeout: 10000 });
    html = response.data;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch class index page: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  await page.setContent(html);
  
  const classLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    // Find all links in the table that point to class pages
    const allLinks = document.querySelectorAll('a[href^="/artificer:main"], a[href^="/barbarian:main"], a[href^="/bard:main"], a[href^="/cleric:main"], a[href^="/druid:main"], a[href^="/fighter:main"], a[href^="/monk:main"], a[href^="/paladin:main"], a[href^="/ranger:main"], a[href^="/rogue:main"], a[href^="/sorcerer:main"], a[href^="/warlock:main"], a[href^="/wizard:main"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href) {
        // Extract class name from URL (e.g., "/barbarian:main" -> "barbarian")
        const match = href.match(/^\/([a-zA-Z0-9-]+):main$/);
        if (match) {
          links.push(match[1]);
        }
      }
    });
    
    return [...new Set(links)];
  });
  
  console.log(`  ✓ Found ${classLinks.length} total classes`);
  return classLinks;
}

async function scrapeClasses(browser: Browser, config: CliConfig): Promise<void> {
  const successCount = { value: 0 };
  const warningCount = { value: 0 };
  const errorCount = { value: 0 };
  
  try {
    // Get all class names first
    const classNames = await getAllClassNames(browser);
    
    if (config.maxItems && config.maxItems < classNames.length) {
      console.log(`\n⚠️  Limiting to first ${config.maxItems} classes for testing`);
    } else if (classNames.length > 0) {
      console.log(`\n📋 Scraping all ${classNames.length} classes...`);
    }
    
    const allClasses: ClassRecord[] = [];
    
    // Process each class
    for (let i = 0; i < classNames.length; i++) {
      if (config.maxItems && i >= config.maxItems) break;
      
      const className = classNames[i];
      console.log(`\n[${i + 1}/${classNames.length}] Scraping ${className}...`);
      
      try {
        // Fetch class page HTML
        let html: string;
        try {
          const response = await axios.get(`http://dnd2024.wikidot.com/${className}:main`, { timeout: 15000 });
          html = response.data;
        } catch {
          console.error(`  ❌ Failed to fetch class page`);
          errorCount.value++;
          continue;
        }
        
        const page = await browser.newPage();
        await page.setContent(html);
        
        // Parse class data from HTML
        const classData: ClassRecord = await page.evaluate(() => {
          const result: ClassRecord = {
            name: '',
            source: 'Player\'s Handbook',
            hitDie: 0,
            primaryAbility: '',
            savingThrows: [],
            skillProficiencies: [],
            weaponProficiencies: [],
            armorTraining: [],
            startingEquipment: '',
            classFeatures: []
          };
          
          // Extract source if present (look for "Source:" text)
          const content = document.querySelector('#page-content');
          if (content) {
            const sourceMatch = content.textContent?.match(/Source:\s*([^\n]+)/);
            if (sourceMatch) {
              result.source = sourceMatch[1].trim();
            }
            
            // Extract Core Traits table data
            const coreTraitsTable = document.querySelector('table.wiki-content-table');
            if (coreTraitsTable) {
              const rows = coreTraitsTable.querySelectorAll('tr');
              rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 2) {
                  const label = cells[0].textContent?.toLowerCase() ?? '';
                  const value = cells[1]?.textContent?.trim();
                  
                  if (label.includes('hit point die') && value) {
                    const hitDieMatch = value.match(/d([0-9]+)/i);
                    if (hitDieMatch) {
                      result.hitDie = parseInt(hitDieMatch[1]);
                    }
                  } else if (label.includes('primary ability') && value) {
                    result.primaryAbility = value.toLowerCase();
                  } else if (label.includes('saving throw') && value) {
                    // Parse "Strength and Constitution" or "Constitution, Intelligence" format  
                    const parts = value.replace(/and/gi, ',').split(',').map(s => s.trim().toLowerCase());
                    result.savingThrows = parts;
                  } else if (label.includes('skill proficiencies') && value) {
                    // Parse "Choose 2: X, Y, Z" format
                    const skillsMatch = value.match(/(?:Choose\s+(\d+):\s*)?([\w,\s]+)/);
                    if (skillsMatch) {
                      result.skillProficiencies = skillsMatch[2].split(',').map(s => s.trim());
                    }
                  } else if (label.includes('weapon proficiencies') && value) {
                    result.weaponProficiencies = [value];
                  } else if (label.includes('armor training') && value) {
                    result.armorTraining = value.split(',').map(s => s.trim());
                  } else if (label.includes('starting equipment') && value) {
                    result.startingEquipment = value;
                  }
                }
              });
            }
            
            // Extract class features from detailed descriptions below the table
            // Look for "Level X: Feature Name" pattern followed by full description until next Level or end
            const featureText = content.textContent || '';
            
            // Split by "Level N:" to get individual features
            const levelSplit = featureText.split(/(?=Level \d+:)/);
            
            levelSplit.forEach(segment => {
              // Match "Level X: Feature Name" at start of segment
              const headerMatch = segment.match(/^Level (\d+):\s*([^\n]+)/);
              if (!headerMatch) return;
              
              const level = parseInt(headerMatch[1]);
              const name = headerMatch[2].trim();
              
              // Get everything after the header line as description
              const descriptionStartIndex = segment.indexOf('\n');
              let description = '';
              
              if (descriptionStartIndex !== -1) {
                description = segment.substring(descriptionStartIndex + 1).trim();
                
                // Remove trailing text that looks like navigation or footer content
                const cleanupPatterns = [
                  /\s*As a \w+.*$/g,  // "As a Level X Character" etc
                  /\s*Becoming a \w+.*$/g,
                  /\s*\d+\s*[A-Z].*$/g  // Random trailing text
                ];
                
                cleanupPatterns.forEach(pattern => {
                  description = description.replace(pattern, '');
                });
              }
              
              // Clean up - remove extra whitespace but preserve paragraph breaks
              description = description.replace(/\n\s+/g, '\n').replace(/\s+$/g, '').trim();
              
              if (description.length > 10) {  // Only add if we have meaningful content
                result.classFeatures.push({
                  level,
                  name,
                  description
                });
              }
            });
          }
          
          return result;
        });
        
        classData.name = className;
        allClasses.push(classData);
        successCount.value++;
        console.log(`  ✓ Scraped ${classData.classFeatures.length} features`);
        
      } catch (error: unknown) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        if (config.continueOnError) {
          errorCount.value++;
        } else {
          throw error;
        }
      }
    }
    
    const outputPath = 'src/data/classes.json';
    fs.writeFileSync(outputPath, JSON.stringify(allClasses, null, 2));
    console.log(`\n\n✓ Final output saved to ${outputPath}`);
    
    printSummary(successCount.value, warningCount.value, errorCount.value, classNames.length);
    
  } catch (error: unknown) {
    console.error(`\n❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    // Propagate so the caller closes the browser before exiting nonzero.
    throw error;
  }
}

async function main(): Promise<void> {
  const config = parseCliConfig();
  const typesInput = config.types;
  
  // Parse comma-separated types or use default
  let scrapeTypes: ScrapeType[];
  if (typesInput === 'all') {
    scrapeTypes = ['spells', 'subclasses', 'feats', 'backgrounds'];
  } else {
    scrapeTypes = typesInput.split(',').map(t => t.trim()) as ScrapeType[];
    
    // Validate: check for invalid types
    const validTypes = ['spells', 'subclasses', 'feats', 'backgrounds', 'species', 'classes', 'all'];
    for (const type of scrapeTypes) {
      if (!validTypes.includes(type)) {
        console.error(`\n❌ Error: Invalid type "${type}". Valid options: spells, subclasses, feats, backgrounds, species, classes, all`);
        process.exit(1);
      }
    }
  }
  
  // Shared batch-runner configuration for the five item-page scrape types.
  const batchConfigs: Record<string, BatchScrapeConfig<ScrapeRecord>> = {
    spells: spellsBatchConfig(config),
    subclasses: subclassesBatchConfig(config),
    feats: featsBatchConfig(config),
    backgrounds: backgroundsBatchConfig(config),
    species: speciesBatchConfig(config)
  };

  console.log('🎯 Starting D&D 2024 Full Scraper\n');
  console.log(`📋 Scraping: ${scrapeTypes.join(', ')}\n`);
  console.log('🌐 Launching browser...\n');
  
  // --no-sandbox: required on hosts where AppArmor blocks unprivileged user
  // namespaces (kernel.apparmor_restrict_unprivileged_userns=1), e.g. Ubuntu 24.04+
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  try {
    for (const type of scrapeTypes) {
      const batchConfig = batchConfigs[type];
      if (batchConfig) {
        console.log(`📜 Scraping ${type}...\n`);
        await runBatchScrape(browser, batchConfig);
      } else if (type === 'classes') {
        console.log('📜 Scraping classes...\n');
        await scrapeClasses(browser, config);
      }
      
      // Add separator between types (except after last)
      const currentIndex = scrapeTypes.indexOf(type);
      if (currentIndex < scrapeTypes.length - 1) {
        console.log('\n\n' + '='.repeat(60) + '\n');
      }
    }
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed.');
  }
}

/**
 * Only execute the CLI when this module is the direct entry point.
 * Importing this file (e.g. from the debug CLI) must not parse CLI args,
 * launch a browser, or start scraping.
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
  // Failures propagate out of main() after its finally block has closed the
  // browser; log them and set a nonzero exit code instead of exiting early.
  main().catch((error: unknown) => {
    console.error(`\n❌ Scraper failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
