import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const query = args.join(' ');

if (!query) {
  console.log('📚 SRD Rules Reference Query Tool');
  console.log('\nUsage: npx tsx scripts/query-srd.ts <search term>');
  console.log('\nExamples:');
  console.log('  npx tsx scripts/query-srd.ts "prepared spells"');
  console.log('  npx tsx scripts/query-srd.ts "/Prepared Spells.*Level/"');
  console.log('  npx tsx scripts/query-srd.ts "wizard spellbook"');
  console.log('\n💡 Tip: Use regex with /pattern/ syntax for advanced searches.');
  process.exit(1);
}

const rulesDir = './rules-reference';
const dataPath = path.join(rulesDir, 'srd-text.json');

if (!fs.existsSync(dataPath)) {
  console.log('❌ Rules reference not found!');
  console.log('\n💡 Run this first to parse the PDF:');
  console.log('   npm run parse:srd-pdf');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
let text = data.content;

// Normalize line breaks within words (PDF artifact cleanup)
text = text.replace(/(\w)\n([a-z])/g, '$1$2');
text = text.replace(/\n\s*\n/g, '\n\n');

// Detect if query is regex (wrapped in /pattern/)
let regexPattern: RegExp | null = null;
let searchTerms: string[] = [];

if (query.startsWith('/') && query.endsWith('/')) {
  const patternStr = query.slice(1, -1);
  try {
    regexPattern = new RegExp(patternStr, 'i');
  } catch (e) {
    console.log('❌ Invalid regex pattern:', e);
    process.exit(1);
  }
} else {
  searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
}

console.log(`🔍 Searching SRD for "${query}"...\n`);

// Split into context blocks (merge paragraphs for better context)
const rawParagraphs = text.split(/\n\n/).filter(p => p.trim().length > 50);
const contextBlocks: string[] = [];
let currentBlock = '';

for (const para of rawParagraphs) {
  if (currentBlock.length + para.length < 3000) {
    currentBlock += (currentBlock ? '\n\n' : '') + para.trim();
  } else {
    if (currentBlock) contextBlocks.push(currentBlock);
    currentBlock = para.trim();
  }
}
if (currentBlock) contextBlocks.push(currentBlock);

const results = contextBlocks
  .map(block => ({
    text: block,
    score: calculateScore(block, regexPattern, searchTerms)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 20);

if (results.length === 0) {
  console.log('No matching sections found.');
  process.exit(0);
}

// Display results with better formatting
results.forEach((item, i) => {
  console.log(`${i + 1}. [Relevance: ${Math.round(item.score)}]`);
  
  // Show first 500 chars as preview
  const preview = item.text.substring(0, 500).replace(/\n+/g, ' ') + '...';
  console.log(preview);
  console.log('');
});

console.log(`✅ Found ${results.length} matching sections`);
console.log('\n💡 For full context, check: rules-reference/srd-raw.txt');

function calculateScore(text: string, regexPattern: RegExp | null, searchTerms: string[]): number {
  let score = 0;
  const lowerText = text.toLowerCase();

  // Regex match (highest priority with better scoring)
  if (regexPattern) {
    const matches = text.match(regexPattern);
    if (matches) {
      // Base score per match
      score += matches.length * 100;
      
      // Bonus for multiple unique matches
      const uniqueMatches = new Set(matches).size;
      if (uniqueMatches > 1) {
        score += uniqueMatches * 50;
      }
      
      // Position bonus: early matches are more relevant
      const firstHalf = text.substring(0, Math.floor(text.length / 2));
      const earlyMatches = firstHalf.match(regexPattern);
      if (earlyMatches && earlyMatches.length > 0) {
        score += earlyMatches.length * 75;
      }
      
      // Context bonus: check for related keywords near matches
      const contextKeywords = ['spell', 'cast', 'prepare', 'level', 'ability', 'modifier'];
      contextKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score += 25;
        }
      });
    }
    return Math.min(score, 1000); // Cap at 1000
  }

  // Multi-term phrase match (all terms together)
  const fullPhrase = searchTerms.join(' ');
  if (lowerText.includes(fullPhrase)) {
    score += 200;
  }

  // Individual term density scoring with better weights
  let totalTermMatches = 0;
  searchTerms.forEach(term => {
    const matches = lowerText.match(new RegExp(term, 'gi'));
    if (matches) {
      const count = matches.length;
      score += count * 30; // Increased weight
      totalTermMatches += count;
    }
  });

  // Density bonus: many matches in one block is very relevant
  if (totalTermMatches > 5) {
    score += totalTermMatches * 20;
  } else if (totalTermMatches > 3) {
    score += totalTermMatches * 15;
  }

  // Position weighting: early mentions are more important
  const firstThird = lowerText.substring(0, Math.floor(text.length / 3));
  const termDensityInStart = searchTerms.filter(term => 
    firstThird.includes(term)
  ).length;
  
  if (termDensityInStart > 0) {
    score += termDensityInStart * 50; // Increased weight
  }

  // Class name detection bonus for spellcasting queries
  const classNames = ['wizard', 'cleric', 'druid', 'bard', 'sorcerer', 'warlock', 
                      'paladin', 'ranger', 'artificer'];
  const isSpellcastingQuery = searchTerms.some(term => 
    ['spell', 'cast', 'prepare', 'cantrip'].includes(term)
  );
  
  if (isSpellcastingQuery) {
    classNames.forEach(className => {
      if (lowerText.includes(className)) {
        score += 40; // Increased weight for class mentions
      }
    });
    
    // Bonus for mentioning spell-related terms
    const spellTerms = ['spellbook', 'prepared', 'slots', 'cantrip', 'casting'];
    spellTerms.forEach(term => {
      if (lowerText.includes(term)) {
        score += 35;
      }
    });
  }

  // Formula detection bonus for queries about numbers/calculations
  const isFormulaQuery = searchTerms.some(term => 
    ['number', 'how many', 'plus', 'modifier', 'level'].includes(term)
  );
  
  if (isFormulaQuery) {
    // Bonus for mathematical patterns
    if (/\d/.test(text) || /plus|modifier|ability/i.test(text)) {
      score += 60;
    }
    
    // Bonus for "as shown in" or table references
    if (/as shown in|column|table/i.test(lowerText)) {
      score += 80;
    }
  }

  return Math.min(score, 1500); // Cap at 1500
}