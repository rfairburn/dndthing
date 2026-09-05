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

interface RulesReferenceData {
  content: string;
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as RulesReferenceData;
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

// Main search function with fallback logic
function performSearch() {
  const results = contextBlocks
    .map(block => ({
      text: block,
      score: calculateScore(block, regexPattern, searchTerms)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Fallback strategy: if top 5 results don't contain ALL query keywords together, re-score with adjusted weights
  const topResults = results.slice(0, 5);

  function checkIfAllTermsTogether(resultText: string): boolean {
    for (let i = 0; i < searchTerms.length - 1; i++) {
      const term1Pos = resultText.indexOf(searchTerms[i]);
      const term2Pos = resultText.indexOf(searchTerms[i + 1]);
      
      if (term1Pos === -1 || term2Pos === -1 || Math.abs(term1Pos - term2Pos) > 200) {
        return false;
      }
    }
    return true;
  }

  const hasAllKeywordsTogether = topResults.some(result =>
    checkIfAllTermsTogether(result.text.toLowerCase())
  );
  
  // If keywords not found together, boost class feature patterns and table references
  if (!hasAllKeywordsTogether && results.length > 0) {
    console.log('⚠️  Initial search did not find exact matches. Re-scoring with adjusted weights...\n');
    
    const reScored = contextBlocks.map(block => ({
      text: block,
      score: calculateScoreWithFallback(block, regexPattern, searchTerms)
    })).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
    
    if (reScored.length === 0) {
      console.log('No matching sections found.');
      return;
    }
    
    displayResults(reScored.slice(0, 20));
    return;
  }

  if (results.length === 0) {
    console.log('No matching sections found.');
    return;
  }
  
  displayResults(results.slice(0, 20));
}

performSearch();

// Display results helper function
function displayResults(resultsToDisplay: { text: string; score: number }[]) {
  resultsToDisplay.forEach((item, i) => {
    console.log(`${i + 1}. [Relevance: ${Math.round(item.score)}]`);
    
    // Show first 500 chars as preview
    const preview = item.text.substring(0, 500).replace(/\n+/g, ' ') + '...';
    console.log(preview);
    console.log('');
  });

  console.log(`✅ Found ${resultsToDisplay.length} matching sections`);
  console.log('\n💡 For full context, check: rules-reference/srd-raw.txt');
}

function calculateScoreWithFallback(text: string, regexPattern: RegExp | null, searchTerms: string[]): number {
  // Start with base score
  let score = calculateScore(text, regexPattern, searchTerms);
  
  const lowerText = text.toLowerCase();
  
  // Detect if query is looking for a class feature (e.g., "Bard Spellcasting")
  const targetClass = searchTerms.find(term =>
    ['wizard', 'cleric', 'druid', 'bard', 'sorcerer', 'warlock', 'paladin', 'ranger'].includes(term)
  );
  
  if (targetClass) {
    
    // Direct pattern search: look for "Level X: Spellcasting" or similar feature patterns with the target class
    const spellcastingFeaturePattern = new RegExp(`level \\d+: (spellcasting|cantrips|prepared spells)`, 'i');
    const directMatches = text.match(new RegExp(`${targetClass}[^\\n]{0,2000}?${spellcastingFeaturePattern.source}`, 'gis'));
    
    if (directMatches && directMatches.length > 0) {
      // Found direct match - boost it significantly
      score += 1500;
      
      // Also check for the full spellcasting section markers
      const hasSpellSlots = /spell slots\./.test(lowerText);
      const hasPreparedSpells = /prepared spells of level 1\+/.test(lowerText);
      const hasChangingSpells = /changing your prepared spells/.test(lowerText);
      const hasSpellcastingAbility = /spellcasting ability/.test(lowerText);
      
      if (hasSpellSlots && hasPreparedSpells && hasChangingSpells) {
        score += 1000; // Full spellcasting section found
      } else if ((hasSpellSlots || hasPreparedSpells) && hasSpellcastingAbility) {
        score += 800; // Partial spellcasting section
      }
    }
    
    // Boost "Level X: FeatureName" patterns where feature name matches query terms
    const classFeatureMatch = /level \d+: ([a-z\s]+)/i.exec(lowerText);
    if (classFeatureMatch) {
      const featureName = classFeatureMatch[1].toLowerCase().trim();
      searchTerms.forEach(term => {
        if (featureName.includes(term)) {
          score += 800; // Major boost for matching feature names in class context
        }
      });
      
      // Extra boost if we find the target class name AND a spellcasting-related feature
      if (targetClass && lowerText.includes(targetClass) && 
          ['spellcasting', 'cantrips', 'prepared spells'].some(feat => featureName.includes(feat))) {
        score += 1000; // Huge boost for exact class + feature match
      }
    }
    
    // Boost "Level X: Cantrips" patterns with class name nearby
    const cantripsFeatureMatch = /level \d+: cantrips/i.exec(lowerText);
    if (cantripsFeatureMatch && targetClass && lowerText.includes(targetClass)) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 700; // Boost for cantrips feature section with matching class
        }
      });
    }
    
    // Boost "Spell Slots." patterns with class name nearby  
    const spellSlotsFeatureMatch = /spell slots\./i.exec(lowerText);
    if (spellSlotsFeatureMatch && targetClass && lowerText.includes(targetClass)) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 650; // Boost for spell slots feature section with matching class
        }
      });
    }
    
    // Boost "Prepared Spells of Level 1+." patterns with class name nearby
    const preparedSpellsFeatureMatch = /prepared spells of level 1\+\./i.exec(lowerText);
    if (preparedSpellsFeatureMatch && targetClass && lowerText.includes(targetClass)) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 700; // Boost for prepared spells feature section with matching class
        }
      });
    }
    
    // Boost "Changing Your Prepared Spells." patterns
    const changingSpellsMatch = /changing your prepared spells\./i.exec(lowerText);
    if (changingSpellsMatch && targetClass && lowerText.includes(targetClass)) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 600; // Boost for changing spells section with matching class
        }
      });
    }
    
    // Boost "Spellcasting Ability." patterns
    const spellcastingAbilityFeatureMatch = /spellcasting ability\./i.exec(lowerText);
    if (spellcastingAbilityFeatureMatch && targetClass && lowerText.includes(targetClass)) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 550; // Boost for spellcasting ability section with matching class
        }
      });
    }
    
    // Boost "Spellcasting Focus." patterns
    const spellcastingFocusMatch = /spellcasting focus\./i.exec(lowerText);
    if (spellcastingFocusMatch && targetClass && lowerText.includes(targetClass)) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 500; // Boost for spellcasting focus section with matching class
        }
      });
    }
    
    // Boost "Prepared Spells of Level 1+" patterns with query terms nearby
    const preparedSpellsMatch = /prepared spells of level 1\+/i.exec(lowerText);
    if (preparedSpellsMatch) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 300; // Boost for prepared spells section
        }
      });
    }
    
    // Boost "Spell Slots" and "Cantrips" sections with class name context
    const spellSlotsMatch = /spell slots\./i.exec(lowerText);
    if (spellSlotsMatch) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 250; // Boost for spell slots section
        }
      });
    }
    
    // Boost "Spellcasting Ability" patterns
    const spellcastingAbilityMatch = /spellcasting ability\./i.exec(lowerText);
    if (spellcastingAbilityMatch) {
      searchTerms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 200; // Boost for spellcasting ability section
        }
      });
    }
    
    // Penalize monster stat blocks (they have "Spellcasting" but aren't class features)
    if (/medium|small|large|huge|gargantuan.*humanoid|dragon/i.test(lowerText)) {
      score -= 300; // Reduce relevance for monsters
    }
  }
  
  // Boost table column references (e.g., "Prepared Spells column")
  const tableColumnMatch = /([a-z\s]+) column/i.exec(lowerText);
  if (tableColumnMatch) {
    const columnName = tableColumnMatch[1].toLowerCase();
    searchTerms.forEach(term => {
      if (columnName.includes(term)) {
        score += 150; // Boost for matching column names
      }
    });
  }
  
  // Boost "as shown in" patterns with query terms
  const asShownMatch = /as shown in the ([a-z\s]+)/i.exec(lowerText);
  if (asShownMatch) {
    const reference = asShownMatch[1].toLowerCase();
    searchTerms.forEach(term => {
      if (reference.includes(term)) {
        score += 120; // Boost for matching table references
      }
    });
  }
  
  return Math.min(score, 2500); // Higher cap for fallback scoring
}

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