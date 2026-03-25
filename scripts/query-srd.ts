import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const query = args.join(' ').toLowerCase();

if (!query) {
  console.log('📚 SRD Rules Reference Query Tool');
  console.log('\nUsage: npx tsx scripts/query-srd.ts <search term>');
  console.log('\nExamples:');
  console.log('  npx tsx scripts/query-srd.ts "spell slots"');
  console.log('  npx tsx scripts/query-srd.ts "background bonuses"');
  console.log('  npx tsx scripts/query-srd.ts "species traits"');
  console.log('\n💡 Tip: First run `npm run parse:srd-pdf` to generate the reference files.');
  process.exit(1);
}

const rulesDir = './rules-reference';
const dataPath = path.join(rulesDir, 'srd-text.json');

// Check if parsed data exists
if (!fs.existsSync(dataPath)) {
  console.log('❌ Rules reference not found!');
  console.log('\n💡 Run this first to parse the PDF:');
  console.log('   npm run parse:srd-pdf');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const text = data.content;

console.log(`🔍 Searching SRD for "${query}"...\n`);

// Split into paragraphs and find relevant ones
const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);

const results = paragraphs
  .map(paragraph => ({
    text: paragraph.trim(),
    score: calculateScore(paragraph, query)
  }))
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 10); // Limit to top 10 matches

if (results.length === 0) {
  console.log('No matching sections found.');
  process.exit(0);
}

results.forEach((item, i) => {
  console.log(`\n${i + 1}. [Relevance: ${item.score}]`);
  
  // Show first 300 chars as preview
  const preview = item.text.substring(0, 300).replace(/\n/g, ' ') + '...';
  console.log(preview);
});

console.log(`\n✅ Found ${results.length} matching paragraphs`);
console.log('\n💡 For full context, check: rules-reference/srd-raw.txt');

function calculateScore(text: string, query: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // Exact phrase match is worth most
  if (lowerText.includes(query)) {
    score += 20;
  }
  
  // Individual word matches
  const queryWords = query.split(/\s+/).filter(w => w.length > 2);
  queryWords.forEach(word => {
    const wordMatches = lowerText.match(new RegExp(word, 'g'));
    if (wordMatches) {
      score += wordMatches.length * 3;
    }
  });
  
  // Bonus for appearing early in paragraph (more likely to be topic)
  const firstHundredChars = lowerText.substring(0, 100);
  if (firstHundredChars.includes(query)) {
    score += 10;
  }
  
  return score;
}
