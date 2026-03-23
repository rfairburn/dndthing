import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const config = yargs(hideBin(process.argv))
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

type ScrapeType = 'spells' | 'subclasses' | 'feats' | 'backgrounds';

interface ScrapedItem {
  name: string;
  friendlyName?: string;
}

async function getAllSpellNames(browser: puppeteer.Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all spells from http://dnd2024.wikidot.com/spell:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/spell:all', { timeout: 10000 });
    html = response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch spell index page`);
    process.exit(1);
  }
  
  await page.setContent(html);
  
  const spellLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    const allLinks = document.querySelectorAll('a[href^="/spell:"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.includes('-school')) {
        const match = href.match(/\/spell:([a-zA-Z0-9\-]+)/);
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

async function getAllSubclassNames(browser: puppeteer.Browser): Promise<string[]> {
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
      } catch (error) {
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
              const match = href.match(/\/[a-z]+:([a-zA-Z0-9\-]+)/);
              if (match) {
                links.push(match[1]);
              }
            }
          });
        });
        
        return [...new Set(links)];
      });
      
      allSubclasses.push(...subclasses);
      
    } catch (error: any) {
      console.warn(`  ⚠️  Error fetching subclasses for ${className}: ${error.message}`);
    }
  }
  
  const uniqueSubclasses = [...new Set(allSubclasses)];
  console.log(`  ✓ Found ${uniqueSubclasses.length} total subclasses`);
  return uniqueSubclasses;
}

async function getAllFeatNames(browser: puppeteer.Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all feats from http://dnd2024.wikidot.com/feat:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/feat:all', { timeout: 10000 });
    html = response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch feat index page`);
    process.exit(1);
  }
  
  await page.setContent(html);
  
  const featLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    const allLinks = document.querySelectorAll('a[href^="/feat:"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.includes('#toc')) {
        const match = href.match(/\/feat:([a-zA-Z0-9\-]+)/);
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

async function getAllBackgroundNames(browser: puppeteer.Browser): Promise<string[]> {
  console.log(`\n📋 Fetching all backgrounds from http://dnd2024.wikidot.com/background:all...`);
  
  const page = await browser.newPage();
  
  let html: string;
  try {
    const response = await axios.get('http://dnd2024.wikidot.com/background:all', { timeout: 10000 });
    html = response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch background index page`);
    process.exit(1);
  }
  
  await page.setContent(html);
  
  const backgroundLinks = await page.evaluate(() => {
    const links: string[] = [];
    
    const allLinks = document.querySelectorAll('a[href^="/background:"]');
    
    allLinks.forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.includes('#toc')) {
        const match = href.match(/\/background:([a-zA-Z0-9\-]+)/);
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

async function fetchPageHtml(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

async function scrapeSpellPage(browser: puppeteer.Browser, spellName: string): Promise<any> {
  const url = `http://dnd2024.wikidot.com/spell:${spellName}`;
  const html = await fetchPageHtml(url);
  
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as any).__name = (fn: Function) => fn;
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
      
      function parseStatsLine(text: string): { castingTime: string; range: string; components: any; duration: string } {
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

async function scrapeSubclassPage(browser: puppeteer.Browser, subclassName: string): Promise<any> {
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
    const page = await browser.newPage();
    
    await page.evaluate(() => {
      (window as any).__name = (fn: Function) => fn;
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

async function scrapeFeatPage(browser: puppeteer.Browser, featName: string): Promise<any> {
  const url = `http://dnd2024.wikidot.com/feat:${featName}`;
  const html = await fetchPageHtml(url);
  
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as any).__name = (fn: Function) => fn;
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

async function scrapeBackgroundPage(browser: puppeteer.Browser, backgroundName: string): Promise<any> {
  const url = `http://dnd2024.wikidot.com/background:${backgroundName}`;
  const html = await fetchPageHtml(url);
  
  const page = await browser.newPage();
  
  try {
    await page.evaluate(() => {
      (window as any).__name = (fn: Function) => fn;
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

async function scrapeWithRetry<T>(
  browser: puppeteer.Browser,
  itemName: string,
  scraperFn: (browser: puppeteer.Browser, name: string) => Promise<T | null>,
  maxRetries: number = 3
): Promise<T | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scraperFn(browser, itemName);
      
      if (result && result.name) {
        return result;
      }
      
      throw new Error('Invalid data structure');
      
    } catch (error: any) {
      lastError = error as Error;
      console.error(`\n❌ ${itemName} - Attempt ${attempt}/${maxRetries} FAILED`);
      console.error(`   Raw error: ${error.message}`);
      console.error(`   Stack: ${error.stack || 'N/A'}`);
      
      if (attempt < maxRetries) {
        const delay = 500 * Math.pow(2, attempt - 1);
        console.log(`  ⏳ Retry ${attempt + 1}/${maxRetries} for ${itemName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Unknown error during scraping');
}

async function savePartialOutput(
  data: any[], 
  timestamp: string,
  type: ScrapeType
): Promise<void> {
  const outputPath = `src/data/${type}-${timestamp}.json.partial`;
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Partial output saved to ${outputPath}`);
  } catch (error: any) {
    console.error(`❌ Failed to save partial output: ${error.message}`);
  }
}

async function printSummary(
  successCount: number, 
  warningCount: number, 
  errorCount: number,
  totalItems: number
): Promise<void> {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Successful: ${successCount}`);
  console.log(`⚠️  Warnings (partial data): ${warningCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total items collected: ${totalItems}`);
}

async function scrapeSpells(browser: puppeteer.Browser): Promise<void> {
  let spellNames: string[] = [];
  
  if (config['items'] && config['items'].trim()) {
    spellNames = config['items'].split(',').map(s => s.trim()).filter(s => s);
    console.log(`⚙️  Targeted scrape mode: ${spellNames.length} specific spells`);
  } else {
    const allSpellNames = await getAllSpellNames(browser);
    
    if (allSpellNames.length === 0) {
      console.error('❌ No spells found in index, exiting...');
      process.exit(1);
    }
    
    spellNames = allSpellNames;
    
    if (config['max-items']) {
      console.log(`⚙️  Test mode: Limiting to first ${config['max-items']} spells`);
      spellNames = spellNames.slice(0, config['max-items']);
    }
  }
  
  if (config['continue-on-error']) {
    console.log(`⚙️  Continue on error mode enabled`);
  }
  console.log(`⚙️  Delay between requests: ${config.delay}ms\n`);
  
  const allSpells: any[] = [];
  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  try {
    console.log(`📜 Scraping ${spellNames.length} individual spell pages...\n`);
    
    for (const [index, spellName] of spellNames.entries()) {
      if (config['max-items'] && index >= config['max-items']) break;
      
      const progress = Math.round((index + 1) / spellNames.length * 100);
      process.stdout.write(`\r[${'='.repeat(Math.floor(progress / 2))}${' '.repeat(50 - Math.floor(progress / 2))}] ${index + 1}/${spellNames.length} (${progress}%) - ${spellName}`);
      
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
      
      try {
        const spellData = await scrapeWithRetry(browser, spellName, scrapeSpellPage, config.retries);
        
        if (!spellData || !spellData.name) {
          console.warn(`\n⚠️  ${spellName}: Failed to extract data`);
          
          warningCount++;
          
          if (!config['continue-on-error']) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            await savePartialOutput(allSpells, timestamp, 'spells');
            printSummary(successCount, warningCount, errorCount, spellNames.length);
            console.log('\n⛔ Stopping due to error.');
            process.exit(1);
          }
          
          continue;
        }
        
        allSpells.push(spellData);
        successCount++;
        
      } catch (error: any) {
        console.warn(`\n❌ ${spellName}: ${error.message}`);
        
        errorCount++;
        
        if (!config['continue-on-error']) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          await savePartialOutput(allSpells, timestamp, 'spells');
          printSummary(successCount, warningCount, errorCount, spellNames.length);
          console.log('\n⛔ Stopping due to error.');
          process.exit(1);
        }
      }
    }
    
    const outputPath = 'src/data/spells.json';
    fs.writeFileSync(outputPath, JSON.stringify(allSpells, null, 2));
    console.log(`\n\n✓ Final output saved to ${outputPath}`);
    
    printSummary(successCount, warningCount, errorCount, spellNames.length);
    
  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

async function scrapeSubclasses(browser: puppeteer.Browser): Promise<void> {
  let subclassNames: string[] = [];
  
  if (config['items'] && config['items'].trim()) {
    subclassNames = config['items'].split(',').map(s => s.trim()).filter(s => s);
    console.log(`⚙️  Targeted scrape mode: ${subclassNames.length} specific subclasses`);
  } else {
    const allSubclassNames = await getAllSubclassNames(browser);
    
    if (allSubclassNames.length === 0) {
      console.error('❌ No subclasses found, exiting...');
      process.exit(1);
    }
    
    subclassNames = allSubclassNames;
    
    if (config['max-items']) {
      console.log(`⚙️  Test mode: Limiting to first ${config['max-items']} subclasses`);
      subclassNames = subclassNames.slice(0, config['max-items']);
    }
  }
  
  if (config['continue-on-error']) {
    console.log(`⚙️  Continue on error mode enabled`);
  }
  console.log(`⚙️  Delay between requests: ${config.delay}ms\n`);
  
  const allSubclasses: any[] = [];
  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  try {
    console.log(`📜 Scraping ${subclassNames.length} individual subclass pages...\n`);
    
    for (const [index, subclassName] of subclassNames.entries()) {
      if (config['max-items'] && index >= config['max-items']) break;
      
      const progress = Math.round((index + 1) / subclassNames.length * 100);
      process.stdout.write(`\r[${'='.repeat(Math.floor(progress / 2))}${' '.repeat(50 - Math.floor(progress / 2))}] ${index + 1}/${subclassNames.length} (${progress}%) - ${subclassName}`);
      
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
      
      try {
        const subclassData = await scrapeWithRetry(browser, subclassName, scrapeSubclassPage, config.retries);
        
        if (!subclassData || !subclassData.name) {
          console.warn(`\n⚠️  ${subclassName}: Failed to extract data`);
          
          warningCount++;
          
          if (!config['continue-on-error']) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            await savePartialOutput(allSubclasses, timestamp, 'subclasses');
            printSummary(successCount, warningCount, errorCount, subclassNames.length);
            console.log('\n⛔ Stopping due to error.');
            process.exit(1);
          }
          
          continue;
        }
        
        allSubclasses.push(subclassData);
        successCount++;
        
      } catch (error: any) {
        console.warn(`\n❌ ${subclassName}: ${error.message}`);
        
        errorCount++;
        
        if (!config['continue-on-error']) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          await savePartialOutput(allSubclasses, timestamp, 'subclasses');
          printSummary(successCount, warningCount, errorCount, subclassNames.length);
          console.log('\n⛔ Stopping due to error.');
          process.exit(1);
        }
      }
    }
    
    const outputPath = 'src/data/subclasses.json';
    fs.writeFileSync(outputPath, JSON.stringify(allSubclasses, null, 2));
    console.log(`\n\n✓ Final output saved to ${outputPath}`);
    
    printSummary(successCount, warningCount, errorCount, subclassNames.length);
    
  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

async function scrapeFeats(browser: puppeteer.Browser): Promise<void> {
  let featNames: string[] = [];
  
  if (config['items'] && config['items'].trim()) {
    featNames = config['items'].split(',').map(s => s.trim()).filter(s => s);
    console.log(`⚙️  Targeted scrape mode: ${featNames.length} specific feats`);
  } else {
    const allFeatNames = await getAllFeatNames(browser);
    
    if (allFeatNames.length === 0) {
      console.error('❌ No feats found in index, exiting...');
      process.exit(1);
    }
    
    featNames = allFeatNames;
    
    if (config['max-items']) {
      console.log(`⚙️  Test mode: Limiting to first ${config['max-items']} feats`);
      featNames = featNames.slice(0, config['max-items']);
    }
  }
  
  if (config['continue-on-error']) {
    console.log(`⚙️  Continue on error mode enabled`);
  }
  console.log(`⚙️  Delay between requests: ${config.delay}ms\n`);
  
  const allFeats: any[] = [];
  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  try {
    console.log(`📜 Scraping ${featNames.length} individual feat pages...\n`);
    
    for (const [index, featName] of featNames.entries()) {
      if (config['max-items'] && index >= config['max-items']) break;
      
      const progress = Math.round((index + 1) / featNames.length * 100);
      process.stdout.write(`\r[${'='.repeat(Math.floor(progress / 2))}${' '.repeat(50 - Math.floor(progress / 2))}] ${index + 1}/${featNames.length} (${progress}%) - ${featName}`);
      
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
      
      try {
        const featData = await scrapeWithRetry(browser, featName, scrapeFeatPage, config.retries);
        
        if (!featData || !featData.name) {
          console.warn(`\n⚠️  ${featName}: Failed to extract data`);
          
          warningCount++;
          
          if (!config['continue-on-error']) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            await savePartialOutput(allFeats, timestamp, 'feats');
            printSummary(successCount, warningCount, errorCount, featNames.length);
            console.log('\n⛔ Stopping due to error.');
            process.exit(1);
          }
          
          continue;
        }
        
        allFeats.push(featData);
        successCount++;
        
      } catch (error: any) {
        console.warn(`\n❌ ${featName}: ${error.message}`);
        
        errorCount++;
        
        if (!config['continue-on-error']) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          await savePartialOutput(allFeats, timestamp, 'feats');
          printSummary(successCount, warningCount, errorCount, featNames.length);
          console.log('\n⛔ Stopping due to error.');
          process.exit(1);
        }
      }
    }
    
    const outputPath = 'src/data/feats.json';
    fs.writeFileSync(outputPath, JSON.stringify(allFeats, null, 2));
    console.log(`\n\n✓ Final output saved to ${outputPath}`);
    
    printSummary(successCount, warningCount, errorCount, featNames.length);
    
  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

async function scrapeBackgrounds(browser: puppeteer.Browser): Promise<void> {
  let backgroundNames: string[] = [];
  
  if (config['items'] && config['items'].trim()) {
    backgroundNames = config['items'].split(',').map(s => s.trim()).filter(s => s);
    console.log(`⚙️  Targeted scrape mode: ${backgroundNames.length} specific backgrounds`);
  } else {
    const allBackgroundNames = await getAllBackgroundNames(browser);
    
    if (allBackgroundNames.length === 0) {
      console.error('❌ No backgrounds found in index, exiting...');
      process.exit(1);
    }
    
    backgroundNames = allBackgroundNames;
    
    if (config['max-items']) {
      console.log(`⚙️  Test mode: Limiting to first ${config['max-items']} backgrounds`);
      backgroundNames = backgroundNames.slice(0, config['max-items']);
    }
  }
  
  if (config['continue-on-error']) {
    console.log(`⚙️  Continue on error mode enabled`);
  }
  console.log(`⚙️  Delay between requests: ${config.delay}ms\n`);
  
  const allBackgrounds: any[] = [];
  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  try {
    console.log(`📜 Scraping ${backgroundNames.length} individual background pages...\n`);
    
    for (const [index, backgroundName] of backgroundNames.entries()) {
      if (config['max-items'] && index >= config['max-items']) break;
      
      const progress = Math.round((index + 1) / backgroundNames.length * 100);
      process.stdout.write(`\r[${'='.repeat(Math.floor(progress / 2))}${' '.repeat(50 - Math.floor(progress / 2))}] ${index + 1}/${backgroundNames.length} (${progress}%) - ${backgroundName}`);
      
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
      
      try {
        const backgroundData = await scrapeWithRetry(browser, backgroundName, scrapeBackgroundPage, config.retries);
        
        if (!backgroundData || !backgroundData.name) {
          console.warn(`\n⚠️  ${backgroundName}: Failed to extract data`);
          
          warningCount++;
          
          if (!config['continue-on-error']) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            await savePartialOutput(allBackgrounds, timestamp, 'backgrounds');
            printSummary(successCount, warningCount, errorCount, backgroundNames.length);
            console.log('\n⛔ Stopping due to error.');
            process.exit(1);
          }
          
          continue;
        }
        
        allBackgrounds.push(backgroundData);
        successCount++;
        
      } catch (error: any) {
        console.warn(`\n❌ ${backgroundName}: ${error.message}`);
        
        errorCount++;
        
        if (!config['continue-on-error']) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          await savePartialOutput(allBackgrounds, timestamp, 'backgrounds');
          printSummary(successCount, warningCount, errorCount, backgroundNames.length);
          console.log('\n⛔ Stopping due to error.');
          process.exit(1);
        }
      }
    }
    
    const outputPath = 'src/data/backgrounds.json';
    fs.writeFileSync(outputPath, JSON.stringify(allBackgrounds, null, 2));
    console.log(`\n\n✓ Final output saved to ${outputPath}`);
    
    printSummary(successCount, warningCount, errorCount, backgroundNames.length);
    
  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const typesInput = config.types as string;
  
  // Parse comma-separated types or use default
  let scrapeTypes: ScrapeType[];
  if (typesInput === 'all') {
    scrapeTypes = ['spells', 'subclasses', 'feats', 'backgrounds'];
  } else {
    scrapeTypes = typesInput.split(',').map(t => t.trim()) as ScrapeType[];
    
    // Validate: check for invalid types
    const validTypes = ['spells', 'subclasses', 'feats', 'backgrounds', 'all'];
    for (const type of scrapeTypes) {
      if (!validTypes.includes(type)) {
        console.error(`\n❌ Error: Invalid type "${type}". Valid options: spells, subclasses, feats, backgrounds, all`);
        process.exit(1);
      }
    }
  }
  
  console.log('🎯 Starting D&D 2024 Full Scraper\n');
  console.log(`📋 Scraping: ${scrapeTypes.join(', ')}\n`);
  console.log('🌐 Launching browser...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    for (const type of scrapeTypes) {
      if (type === 'spells') {
        console.log('📜 Scraping spells...\n');
        await scrapeSpells(browser);
      } else if (type === 'subclasses') {
        console.log('📜 Scraping subclasses...\n');
        await scrapeSubclasses(browser);
      } else if (type === 'feats') {
        console.log('📜 Scraping feats...\n');
        await scrapeFeats(browser);
      } else if (type === 'backgrounds') {
        console.log('📜 Scraping backgrounds...\n');
        await scrapeBackgrounds(browser);
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

main();
