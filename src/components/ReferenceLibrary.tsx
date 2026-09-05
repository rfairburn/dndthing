import { useState } from 'react';
import type { ClassType, Feat, SpellWithClasses } from '../types';
import { SPELLS_BY_CLASS, getSpellsForClass } from '../data/spells';
import featsData from '../data/feats.json';
import { BACKGROUNDS } from '../data/backgrounds';
import { SPECIES } from '../data/species';

// Parse scraped feat data to extract benefits from description text
const parseFeatDescription = (description: string): { mainText: string; benefits: string[] } => {
  const lines = description.split('\n').filter(line => line.trim());
  
  // Look for "You gain the following benefits" marker
  const benefitsStartIndex = lines.findIndex(line => 
    line.includes('gain the following benefits') || 
    line.includes('following benefits')
  );
  
  if (benefitsStartIndex > -1) {
    const mainText = lines.slice(0, benefitsStartIndex + 1).join('\n');
    const benefitLines = lines.slice(benefitsStartIndex + 1);
    
    // Parse each benefit line: "Benefit Name. Description" format
    const benefits = benefitLines.map(line => {
      const match = line.match(/^([A-Z][^.]+)\.\s*(.*)$/);
      return match ? `${match[1]}. ${match[2]}` : line;
    });
    
    return { mainText, benefits };
  }
  
  // No benefits marker - treat entire description as main text with no structured benefits
  return { mainText: description, benefits: [] };
};

const FEATS: Record<string, Feat> = Object.entries(featsData).reduce((acc, [key, feat]) => {
  const nameKey = key.toLowerCase().replace(/\s+/g, '_');
  const parsed = parseFeatDescription(feat.description);
  
  acc[nameKey] = {
    name: feat.name,
    description: parsed.mainText,
    benefits: parsed.benefits.length > 0 ? parsed.benefits : [parsed.mainText],
    source: feat.source
  };
  
  return acc;
}, {} as Record<string, Feat>);

const CLASS_LABELS: Record<string, string> = {
  artificer: "Artificer",
  barbarian: "Barbarian",
  bard: "Bard",
  cleric: "Cleric",
  druid: "Druid",
  fighter: "Fighter",
  monk: "Monk",
  paladin: "Paladin",
  ranger: "Ranger",
  rogue: "Rogue",
  sorcerer: "Sorcerer",
  warlock: "Warlock",
  wizard: "Wizard"
};

const ALL_CLASSES = ['all', 'artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'] as const;

const REFERENCE_TABS = ['spells', 'feats', 'backgrounds', 'species'] as const;
type ReferenceTab = (typeof REFERENCE_TABS)[number];

export default function ReferenceLibrary() {
  const [activeTab, setActiveTab] = useState<ReferenceTab>('spells');
  const [searchQuery, setSearchQuery] = useState('');
  const [spellLevelFilter, setSpellLevelFilter] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassType | 'all'>('all');

  const allSpells = Object.values(SPELLS_BY_CLASS).flat();

  const filteredSpells = (selectedClass === 'all' 
    ? allSpells 
    : getSpellsForClass(selectedClass)
  ).filter(spell => 
      spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.classes.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Remove duplicates by name
  const uniqueSpells = Array.from(new Map(filteredSpells.map(spell => [spell.name, spell])).values());

  // Group by level for display
  const groupedByLevel = uniqueSpells.reduce<Record<string, SpellWithClasses[]>>((acc, spell) => {
    const levelKey = spell.level === 0 ? 'cantrip' : `level${spell.level}`;
    if (!acc[levelKey]) acc[levelKey] = [];
    acc[levelKey].push(spell);
    return acc;
  }, {});

  // Apply level filter to grouped data
  const filteredGroupedLevel = spellLevelFilter !== null 
    ? { [spellLevelFilter === 0 ? 'cantrip' : `level${spellLevelFilter}`]: groupedByLevel[spellLevelFilter === 0 ? 'cantrip' : `level${spellLevelFilter}`] || [] }
    : groupedByLevel;

  // Helper to format level display name
  const getLevelDisplayName = (level: string) => {
    if (level === 'cantrip') return 'Cantrips';
    const num = parseInt(level.replace('level', ''));
    return isNaN(num) ? level : `Level ${num}`;
  };

  // Check if there are any spells to display after filtering
  const hasSpellsToDisplay = Object.values(filteredGroupedLevel).some(spells => spells.length > 0);

  const filteredFeats = Object.entries(FEATS).filter(([, feat]) =>
    feat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBackgrounds = Object.entries(BACKGROUNDS).filter(([, bg]) =>
    bg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSpecies = Object.entries(SPECIES).filter(([, sp]) =>
    sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sp.traits?.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-700 pb-4">
        {REFERENCE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="w-full px-6 py-4 bg-gray-800 border-2 border-purple-600 rounded-lg text-xl focus:outline-none focus:border-purple-400"
        />

        {activeTab === 'spells' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {ALL_CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                    selectedClass === cls
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {cls === 'all' ? 'All Classes' : CLASS_LABELS[cls]}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                key="all"
                onClick={() => setSpellLevelFilter(null)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  spellLevelFilter === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                All Levels
              </button>
              {['cantrips', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8', 'level9'].map((key) => (
                <button
                  key={key}
                  onClick={() => setSpellLevelFilter(key === 'cantrips' ? 0 : parseInt(key.replace('level', '')))}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    spellLevelFilter === (key === 'cantrips' ? 0 : parseInt(key.replace('level', '')))
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {key === 'cantrips' ? 'Cantrips' : `Level ${key.replace('level', '')}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'spells' && hasSpellsToDisplay && (
          <>
            {Object.entries(filteredGroupedLevel).map(([level, spells]) => (
              <div key={level} className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  {getLevelDisplayName(level)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spells.map((spell) => (
                    <div key={spell.name} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all">
                      <h4 className="text-lg font-bold mb-2">{spell.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-purple-700 rounded text-xs capitalize">{spell.school}</span>
                        <span className="px-2 py-1 bg-blue-700 rounded text-xs">{spell.castingTime}</span>
                        <span className="px-2 py-1 bg-green-700 rounded text-xs">Range: {spell.range}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {spell.classes.map((cls) => (
                          <span key={cls} className="px-2 py-1 bg-orange-700 rounded text-xs capitalize">
                            {CLASS_LABELS[cls] || cls}
                          </span>
                        ))}
                      </div>
                      {spell.components && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-400 mb-1">Components:</div>
                          <div className="flex gap-2 text-xs">
                            {spell.components.verbal && <span>V</span>}
                            {spell.components.somatic && <span>S</span>}
                            {spell.components.material && <span>M</span>}
                          </div>
                        </div>
                      )}
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{spell.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'spells' && !hasSpellsToDisplay && (
          <p className="text-center text-gray-400 py-12">No spells found matching your criteria.</p>
        )}

        {activeTab === 'feats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeats.map(([key, feat]) => (
              <div key={key} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all">
                <h3 className="text-xl font-bold mb-2">{feat.name}</h3>
                {feat.source && (
                  <p className="text-purple-400 text-xs mb-3">Source: {feat.source}</p>
                )}
                {feat.prerequisites && feat.prerequisites.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold mb-1 text-yellow-400 text-sm">Prerequisites</h4>
                    <p className="text-gray-300 text-sm">{feat.prerequisites.map(p => `${p.abilityScore} ${p.minimum}`).join(', ')}</p>
                  </div>
                )}
                {feat.description && !feat.benefits.some(b => b.includes(feat.description)) && (
                  <p className="text-gray-400 text-sm mb-4">{feat.description}</p>
                )}
                {feat.benefits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold mb-1 text-green-400 text-sm">Benefits</h4>
                    <ul className="space-y-1.5">
                      {feat.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5 text-xs">•</span>
                          <span className="text-gray-300 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'backgrounds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBackgrounds.map(([key, bg]) => (
              <div key={key} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all">
                <h3 className="text-xl font-bold mb-2">{bg.name}</h3>
                {bg.source && (
                  <p className="text-purple-400 text-xs mb-2">Source: {bg.source}</p>
                )}
                <p className="text-gray-400 text-sm mb-4">{bg.description}</p>
                
                {bg.abilityScores && bg.abilityScores.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-purple-400">Ability Scores</h4>
                    <div className="flex flex-wrap gap-1">
                      {bg.abilityScores.map(score => (
                        <span key={score} className="px-2 py-1 bg-yellow-700 rounded text-xs capitalize">{score}</span>
                      ))}
                    </div>
                  </div>
                )}

                {bg.feat && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-purple-400">Feat</h4>
                    <span className="text-sm text-gray-300">{bg.feat}</span>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Skill Proficiencies</h4>
                  <div className="flex flex-wrap gap-1">
                    {bg.skillProficiencies.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-purple-700 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                </div>

                {bg.toolProficiencies && bg.toolProficiencies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-purple-400">Tool Proficiencies</h4>
                    <div className="flex flex-wrap gap-1">
                      {bg.toolProficiencies.map(tool => (
                        <span key={tool} className="px-2 py-1 bg-blue-700 rounded text-xs">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Equipment</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {bg.equipment.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {bg.feature.name && (
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <h4 className="font-semibold mb-2 text-purple-400">{bg.feature.name}</h4>
                    <p className="text-sm text-gray-300">{bg.feature.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feats' && filteredFeats.length === 0 && (
          <p className="text-center text-gray-400 py-12">No feats found matching your search.</p>
        )}

        {activeTab === 'backgrounds' && filteredBackgrounds.length === 0 && (
          <p className="text-center text-gray-400 py-12">No backgrounds found matching your search.</p>
        )}

        {activeTab === 'species' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSpecies.map(([key, sp]) => (
              <div key={key} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all">
                <h3 className="text-xl font-bold mb-2">{sp.name}</h3>
                {sp.source && (
                  <p className="text-purple-400 text-xs mb-2">Source: {sp.source}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {sp.creatureType && (
                    <span className="px-2 py-1 bg-blue-700 rounded text-xs capitalize">{sp.creatureType}</span>
                  )}
                  <span className="px-2 py-1 bg-green-700 rounded text-xs">Size: {sp.sizes.join(' or ')}</span>
                  <span className="px-2 py-1 bg-orange-700 rounded text-xs">Speed: {sp.speed} ft</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{sp.description}</p>
                
                {sp.traits && sp.traits.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-400">Traits</h4>
                    <ul className="space-y-2">
                      {sp.traits.map((trait, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="font-semibold text-gray-300">{trait.name}:</span>{' '}
                          <span className="text-gray-400">{trait.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'species' && filteredSpecies.length === 0 && (
          <p className="text-center text-gray-400 py-12">No species found matching your search.</p>
        )}
      </div>
    </div>
  );
}
