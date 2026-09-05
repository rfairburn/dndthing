import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Test scraper for a single spell to debug CSS selectors
 */
async function testScrape(spellName: string): Promise<void> {
  const url = `http://dnd2024.wikidot.com/spell:${spellName}`;
  
  console.log(`🔍 Testing scrape of ${spellName}\n`);
  console.log(`URL: ${url}\n`);
  
  // Fetch HTML
  let html: string;
  try {
    const response = await axios.get(url, { timeout: 10000 });
    html = response.data;
    
    // Save to cache for debugging
    const cacheDir = path.join(process.cwd(), 'cache', 'wikidot', 'spells');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    const safeName = spellName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    fs.writeFileSync(path.join(cacheDir, `test-${safeName}.html`), html);
    console.log(`✓ Saved HTML to cache/test-${safeName}.html\n`);
  } catch (error: any) {
    console.error(`❌ Failed to fetch ${url}: ${error.message}`);
    return;
  }
  
  // Launch browser and inspect structure
  // --no-sandbox: required on hosts where AppArmor blocks unprivileged user
  // namespaces (kernel.apparmor_restrict_unprivileged_userns=1), e.g. Ubuntu 24.04+
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html);
    
    console.log('📋 Available selectors on page:\n');
    
    // Test various selectors based on actual HTML structure
    const testSelectors = [
      '.page-title',           // Spell name
      '.main-content p:first-of-type',  // Level/school/classes line
      '.main-content p:nth-of-type(2)', // Casting time, range, components, duration
      '.main-content p:nth-of-type(3)'  // Description
    ];
    
    for (const selector of testSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`✓ Found element(s) matching: "${selector}"`);
        
        // Get text content of first match
        const text = await page.evaluate((el: Element) => el.textContent?.substring(0, 200), elements[0]);
        if (text) {
          console.log(`   Content: ${text.trim()}`);
        }
      } else {
        console.log(`✗ No elements found for: "${selector}"`);
      }
    }
    
    // Try to extract what we can with available selectors
    console.log('\n🎯 Attempting data extraction:\n');
    
    const extracted = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll('.main-content p'));
      
      return {
        title: document.querySelector('.page-title span')?.textContent,
        levelLine: paragraphs[0]?.textContent,
        statsLine: paragraphs[1]?.textContent,
        description: paragraphs[2]?.textContent,
        allParagraphs: paragraphs.map(p => p.textContent)
      };
    });
    
    console.log('Extracted data:', JSON.stringify(extracted, null, 2));
    
  } finally {
    await browser.close();
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Review the HTML file saved to cache/test-*.html');
  console.log('2. Inspect the page structure in a browser');
  console.log('3. Adjust CSS selectors based on actual wikidot.com layout');
}

// Run test
const spellName = process.argv[2] || 'cure-wounds';
testScrape(spellName).catch(console.error);
