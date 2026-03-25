import { useState, useEffect } from 'react';
import type { Character, Species, Background, Subclass, ClassType } from '../types';
import { SPECIES } from '../data/species';
import { BACKGROUNDS } from '../data/backgrounds';
import { CLASSES } from '../data/classes';
import { getSpellsForClass } from '../data/spells';
import { calculateAbilityModifier } from '../utils/calculations';
import InventoryManager from './InventoryManager';

const SUBCLASSES: Record<ClassType, Subclass[]> = {
  artificer: ["artificer_armorer", "artificer_alchemist", "artificer_battle_smith", "artificer_mystic"],
  barbarian: ["barbarian_path_of_the_beast", "barbarian_path_of_the_berserker", "barbarian_path_of_wild_magic", "barbarian_path_of_the_totem_warrior"],
  bard: ["bard_college_of_creation", "bard_college_of_glamour", "bard_college_of_lore", "bard_college_of_valor"],
  cleric: ["cleric_domain_of_life", "cleric_domain_of_light", "cleric_domain_of_trickery", "cleric_domain_of_war"],
  druid: ["druid_circle_of_the_land", "druid_circle_of_the_moon", "druid_circle_of_wildfire", "druid_circle_of_stars"],
  fighter: ["fighter_champion", "fighter_eldritch_knight", "fighter_battle_master", "fighter_rune_knight"],
  monk: ["monk_way_of_the_open_hand", "monk_way_of_shadow", "monk_way_of_the_ascendant_dragon", "monk_way_of_mercy"],
  paladin: ["paladin_oath_of_devotion", "paladin_oath_of_the_ancients", "paladin_oath_of_vengeance", "paladin_oath_of_conquest"],
  ranger: ["ranger_beast_master", "ranger_fey_wanderer", "ranger_gloom_stalker", "ranger_hunter"],
  rogue: ["rogue_thief", "rogue_assassin", "rogue_arcane_trickster", "rogue_soulknife"],
  sorcerer: ["sorcerer_draconic_bloodline", "sorcerer_wild_magic", "sorcerer_aberrant_mind", "sorcerer_storm_sorcery"],
  warlock: ["warlock_the_fiend", "warlock_the_archfey", "warlock_the_great_old_one", "warlock_the_celestial"],
  wizard: ["wizard_school_of_abjuration", "wizard_school_of_divination", "wizard_school_of_evocation", "wizard_school_of_illusion"]
};

const SUBCLASS_NAMES: Record<Subclass, string> = {
  "artificer_armorer": "Armorer",
  "artificer_alchemist": "Alchemist",
  "artificer_battle_smith": "Battle Smith",
  "artificer_mystic": "Mystic",
  "barbarian_path_of_the_beast": "Path of the Beast",
  "barbarian_path_of_the_berserker": "Path of the Berserker",
  "barbarian_path_of_wild_magic": "Path of Wild Magic",
  "barbarian_path_of_the_totem_warrior": "Path of the Totem Warrior",
  "bard_college_of_creation": "College of Creation",
  "bard_college_of_glamour": "College of Glamour",
  "bard_college_of_lore": "College of Lore",
  "bard_college_of_valor": "College of Valor",
  "cleric_domain_of_life": "Domain of Life",
  "cleric_domain_of_light": "Domain of Light",
  "cleric_domain_of_trickery": "Domain of Trickery",
  "cleric_domain_of_war": "Domain of War",
  "druid_circle_of_the_land": "Circle of the Land",
  "druid_circle_of_the_moon": "Circle of the Moon",
  "druid_circle_of_wildfire": "Circle of Wildfire",
  "druid_circle_of_stars": "Circle of Stars",
  "fighter_champion": "Champion",
  "fighter_eldritch_knight": "Eldritch Knight",
  "fighter_battle_master": "Battle Master",
  "fighter_rune_knight": "Rune Knight",
  "monk_way_of_the_open_hand": "Way of the Open Hand",
  "monk_way_of_shadow": "Way of Shadow",
  "monk_way_of_the_ascendant_dragon": "Way of the Ascendant Dragon",
  "monk_way_of_mercy": "Way of Mercy",
  "paladin_oath_of_devotion": "Oath of Devotion",
  "paladin_oath_of_the_ancients": "Oath of the Ancients",
  "paladin_oath_of_vengeance": "Oath of Vengeance",
  "paladin_oath_of_conquest": "Oath of Conquest",
  "ranger_beast_master": "Beast Master",
  "ranger_fey_wanderer": "Fey Wanderer",
  "ranger_gloom_stalker": "Gloom Stalker",
  "ranger_hunter": "Hunter",
  "rogue_thief": "Thief",
  "rogue_assassin": "Assassin",
  "rogue_arcane_trickster": "Arcane Trickster",
  "rogue_soulknife": "Soulknife",
  "sorcerer_draconic_bloodline": "Draconic Bloodline",
  "sorcerer_wild_magic": "Wild Magic",
  "sorcerer_aberrant_mind": "Aberrant Mind",
  "sorcerer_storm_sorcery": "Storm Sorcery",
  "warlock_the_fiend": "The Fiend",
  "warlock_the_archfey": "The Archfey",
  "warlock_the_great_old_one": "The Great Old One",
  "warlock_the_celestial": "The Celestial",
  "wizard_school_of_abjuration": "School of Abjuration",
  "wizard_school_of_divination": "School of Divination",
  "wizard_school_of_evocation": "School of Evocation",
  "wizard_school_of_illusion": "School of Illusion"
};

type Step = 'name' | 'species' | 'background' | 'ability_scores' | 'class' | 'subclass' | 'spells' | 'inventory' | 'review';

const standardArray = [15, 14, 13, 12, 10, 8];
const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

type AbilitySlot = {
  ability: typeof abilities[number];
  value: number | null;
};

export default function CharacterGenerator() {
  const [step, setStep] = useState<Step>('name');
  const [expandedBackground, setExpandedBackground] = useState<Background | null>(null);
  const [expandedSpecies, setExpandedSpecies] = useState<string | null>(null);
  
  const handleSpeciesToggle = (speciesName: string) => {
    if (expandedSpecies === speciesName) {
      setExpandedSpecies(null);
    } else {
      setExpandedSpecies(speciesName);
      
      // Use functional update to get latest state
      setCharacter(prev => {
        const speciesData = SPECIES[speciesName as Species];
        
        if (!prev.species || prev.species !== speciesName) {
          if (speciesData.sizes && speciesData.sizes.length === 1) {
            return { ...prev, species: speciesName as Species, selectedSize: speciesData.sizes[0] as "Small" | "Medium", speciesSelected: true };
          } else if (!prev.selectedSize) {
            // Set default size for multi-size species (first available)
            if (speciesData.sizes && speciesData.sizes.length > 0) {
              return { ...prev, species: speciesName as Species, selectedSize: speciesData.sizes[0] as "Small" | "Medium", speciesSelected: true };
            }
          } else {
            // Species already has a size selected
            return { ...prev, species: speciesName as Species, speciesSelected: true };
          }
        }
        
        return prev;
      });
    }
  };

  const handleSizeSelect = (size: "Small" | "Medium") => {
    setCharacter(prev => ({ ...prev, selectedSize: size, speciesSelected: true }));
  };
  
  const [slots, setSlots] = useState<AbilitySlot[]>([
    { ability: 'strength', value: 15 },
    { ability: 'dexterity', value: 14 },
    { ability: 'constitution', value: 13 },
    { ability: 'intelligence', value: 12 },
    { ability: 'wisdom', value: 10 },
    { ability: 'charisma', value: 8 }
  ]);

  const [backgroundBonuses, setBackgroundBonuses] = useState<Record<typeof abilities[number], number>>({
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  });

  const getAbilityScoresFromSlots = (): Record<typeof abilities[number], number> => {
    // Initialize with 0 for all abilities, then add base scores and bonuses
    const finalScores: Record<typeof abilities[number], number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    };
    
    // Add base scores from slots (only if assigned)
    slots.forEach(slot => {
      if (slot.value !== null) {
        finalScores[slot.ability] = slot.value;
      }
    });
    
    // Add background bonuses
    abilities.forEach(ability => {
      const bonusValue = backgroundBonuses[ability] || 0;
      finalScores[ability] += bonusValue;
    });
    
    return finalScores;
  };

  const [character, setCharacter] = useState<Character>({
    id: '',
    name: '',
    playerName: '',
    background: "acolyte" as Background,
    classData: { class: "fighter" },
    level: 1,
    experiencePoints: 0,
    abilityScores: getAbilityScoresFromSlots(),
    proficiencyBonus: 2,
    knownSpells: [],
    cantripsKnown: [],
    wizardSpellbook: [],
    ac: 10,
    speed: 30,
    hitPoints: { current: 10, max: 10, temporary: 0 },
    hitDice: { total: 1, value: "d8" },
    initiativeModifier: 0,
    passiveWisdom: 10,
    savingThrows: [],
    skillProficiencies: [],
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    languages: ["Common"],
    traits: [],
    featuresAndClasses: [],
    actions: [],
    inventory: [],
    goldPieces: 0,
    platinumPieces: 0,
    electrumPieces: 0,
    silverPieces: 0,
    copperPieces: 0
  });

  const handleNameChange = (name: string) => {
    setCharacter(prev => ({ ...prev, name }));
  };

  
  const handleScoreChangeDirect = (slotIndex: number, score: number) => {
    setSlots(prev => {
      const newSlots = [...prev];
      const currentValue = newSlots[slotIndex].value;
      
      if (currentValue === score) {
        newSlots[slotIndex] = { ability: newSlots[slotIndex].ability, value: null };
      } else {
        for (let i = 0; i < newSlots.length; i++) {
          if (newSlots[i].value === score) {
            newSlots[i] = { ability: newSlots[i].ability, value: currentValue };
          }
        }
        newSlots[slotIndex] = { ability: newSlots[slotIndex].ability, value: score };
      }
      
      return newSlots;
    });
  };

  useEffect(() => {
    setCharacter(prev => ({ ...prev, abilityScores: getAbilityScoresFromSlots() }));
  }, [slots]);

  const handleClassSelect = (classKey: ClassType) => {
    const classData = CLASSES[classKey];
    const isWizard = classKey === 'wizard';
    
    // Get all spells and filter by the selected class
    const allSpellsForClass = getSpellsForClass(classKey);
    
    // Initialize wizard: 3 known cantrips (separate from spellbook) + 6 level 1 spells in spellbook (per SRD 2024)
    let initialSpellbook: string[] = [];
    if (isWizard) {
      // Cantrips are "known" separately, not in spellbook
      const allCantrips = allSpellsForClass.filter(s => s.level === 0);
      const level1Spells = allSpellsForClass.filter(s => s.level === 1).slice(0, 6).map(s => s.name);
      
      // Start with first 3 cantrips as "known" (separate from spellbook)
      setCharacter(prev => ({
        ...prev,
        cantripsKnown: allCantrips.slice(0, 3).map(s => s.name),
        wizardSpellbook: level1Spells
      }));
      
      initialSpellbook = level1Spells;
    }

    setCharacter(prev => ({
      ...prev,
      classData: { class: classKey },
      wizardSpellbook: initialSpellbook,
      hitDice: { total: prev.level, value: `d${classData.hitDie}` },
      armorProficiencies: classData.armorProficiencies as any[],
      weaponProficiencies: classData.weaponProficiencies as any[]
    }));
  };

  const handleSubclassSelect = (subclass: Subclass) => {
    setCharacter(prev => ({
      ...prev,
      classData: { ...prev.classData, subclass }
    }));
  };

  const handleBackgroundSelect = (backgroundKey: Background) => {
    const backgroundData = BACKGROUNDS[backgroundKey];
    
    // Reset background bonuses when selecting new background
    setBackgroundBonuses({
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    });
    
    setCharacter(prev => ({
      ...prev,
      background: backgroundKey,
      skillProficiencies: [
        ...prev.skillProficiencies,
        ...backgroundData.skillProficiencies.map(skill => ({ skill, proficient: true }))
      ],
      featuresAndClasses: [
        ...prev.featuresAndClasses,
        { name: backgroundData.feature.name, description: backgroundData.feature.description, source: "background" as const }
      ]
    }));
  };

  const incrementBackgroundBonus = (ability: typeof abilities[number]) => {
    setBackgroundBonuses(prev => {
      const currentTotal = Object.values(prev).reduce((sum, val) => sum + val, 0);
      
      // Check if this ability is already at max (+2)
      if (prev[ability] >= 2) {
        return prev;
      }
      
      // Check if we've reached total max (+3)
      if (currentTotal >= 3) {
        return prev;
      }
      
      return {
        ...prev,
        [ability]: prev[ability] + 1
      };
    });
  };

  const decrementBackgroundBonus = (ability: typeof abilities[number]) => {
    setBackgroundBonuses(prev => {
      if (prev[ability] <= 0) {
        return prev;
      }
      
      return {
        ...prev,
        [ability]: prev[ability] - 1
      };
    });
  };

const handleLevelChange = (level: number) => {
    const classKey = character.classData.class;
    const isWizard = classKey === 'wizard';
    
    let updatedSpellbook = [...character.wizardSpellbook];
    let updatedCantripsKnown = [...character.cantripsKnown];
    
    if (isWizard && level > 1) {
      // Add two new wizard spells per level gained for levels 2-20
      const allSpellsForClass = getSpellsForClass(classKey);
      
      // Calculate max spell level based on spell slots
      const spellcastingInfo = CLASSES.wizard.spellcastingInfo;
      let maxSpellLevel = 0;
      if (spellcastingInfo?.spellSlots) {
        for (let l = 9; l >= 1; l--) {
          const slotKey = `level${l}` as keyof typeof spellcastingInfo.spellSlots;
          const slots = spellcastingInfo.spellSlots[slotKey];
          if (slots && slots[Math.min(level - 1, 19)] && slots[Math.min(level - 1, 19)] > 0) {
            maxSpellLevel = l;
            break;
          }
        }
      }
      
      // Find spells not already in spellbook (level 1+, cantrips are separate)
      const availableSpells = allSpellsForClass.filter(
        s => s.level > 0 && s.level <= maxSpellLevel && !updatedSpellbook.includes(s.name)
      );
      
      // Add up to 2 new spells per level gained (from previous level to current)
      const levelsGained = level - 1; // How many levels above 1st
      const newSpellsToAdd = Math.min(availableSpells.length, levelsGained * 2);
      const newSpells = availableSpells.slice(0, newSpellsToAdd).map(s => s.name);
      
      if (newSpells.length > 0) {
        updatedSpellbook = [...updatedSpellbook, ...newSpells];
      }
      
      // Handle cantrip progression: +1 at levels 4 and 10
      const spellcastingInfoForWizard = CLASSES.wizard.spellcastingInfo;
      if (spellcastingInfoForWizard?.cantripsKnown) {
        const currentCantripLimit = spellcastingInfoForWizard.cantripsKnown[Math.min(level - 1, 19)] || 0;
        
        // If we've gained a cantrip slot at this level, add one more
        if (currentCantripLimit > character.cantripsKnown.length) {
          const allCantrips = allSpellsForClass.filter(s => s.level === 0);
          const availableCantrips = allCantrips.filter(
            c => !updatedCantripsKnown.includes(c.name)
          );
          
          if (availableCantrips.length > 0) {
            updatedCantripsKnown = [...updatedCantripsKnown, availableCantrips[0].name];
          }
        }
      }
    }

    setCharacter(prev => ({
      ...prev,
      level,
      proficiencyBonus: Math.ceil(level / 4),
      hitDice: { total: level, value: prev.hitDice.value },
      experiencePoints: (level - 1) * 3000,
      wizardSpellbook: updatedSpellbook,
      cantripsKnown: updatedCantripsKnown
    }));
  };

  const nextStep = () => {
    const steps: Step[] = ['name', 'species', 'background', 'ability_scores', 'class', 'subclass', 'spells', 'inventory', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['name', 'species', 'background', 'ability_scores', 'class', 'subclass', 'spells', 'inventory', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const renderNameStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-purple-400">Character Name</h2>
      <input
        type="text"
        value={character.name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Enter your character's name"
        className="w-full px-6 py-4 bg-gray-800 border-2 border-purple-600 rounded-lg text-xl focus:outline-none focus:border-purple-400 mb-4"
      />
      <input
        type="text"
        value={character.playerName || ''}
        onChange={(e) => setCharacter(prev => ({ ...prev, playerName: e.target.value }))}
        placeholder="Player name (optional)"
        className="w-full px-6 py-4 bg-gray-800 border-2 border-purple-600 rounded-lg text-xl focus:outline-none focus:border-purple-400 mb-8"
      />
    </div>
  );

  const renderSpeciesStep = () => {
    // Get species array, potentially reordered if expanded card needs to move left before expanding
    const speciesEntries = Object.entries(SPECIES);
    let displayOrder = [...speciesEntries];
    
    if (expandedSpecies) {
      const expandedIndex = speciesEntries.findIndex(([key]) => key === expandedSpecies);
      
      // Move selected card to leftmost position of its row before expanding
      // Row starts at: expandedIndex - (expandedIndex % 3)
      const rowStart = expandedIndex - (expandedIndex % 3);
      
      if (rowStart !== expandedIndex) {
        // Build new order: cards before row, selected card, then remaining cards in row
        displayOrder = [];
        
        // Add all cards before this row
        for (let i = 0; i < rowStart; i++) {
          displayOrder.push(speciesEntries[i]);
        }
        
        // Add the selected card first in its row
        displayOrder.push(speciesEntries[expandedIndex]);
        
        // Add remaining cards in this row (excluding the selected one)
        for (let i = rowStart; i <= expandedIndex; i++) {
          if (i !== expandedIndex) {
            displayOrder.push(speciesEntries[i]);
          }
        }
        
        // Add all cards after this row
        for (let i = expandedIndex + 1; i < speciesEntries.length; i++) {
          displayOrder.push(speciesEntries[i]);
        }
      }
    }

    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">Choose Your Species</h2>
        <p className="text-gray-400 mb-4">Click a species to see full details and size options. Click again to collapse.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayOrder.map(([key, species]) => {
            const isExpanded = expandedSpecies === key;
            const isSelected = character.species === key;
            
            return (
              <div
                key={key}
                className={`rounded-lg border-2 transition-all ${
                  isExpanded 
                    ? 'col-span-1 md:col-span-2 lg:col-span-3 border-purple-500 bg-purple-900/40'
                    : isSelected
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-gray-700 hover:border-purple-500 bg-gray-800'
                }`}
              >
                {/* Condensed Card */}
                <button
                  onClick={() => handleSpeciesToggle(key)}
                  className="w-full p-6 text-left"
                >
                  <h3 className="text-xl font-bold mb-2">{species.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{species.description}</p>
                  
                  {/* Show currently selected size */}
                  {isSelected && character.selectedSize ? (
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-700 rounded text-xs">Size: {character.selectedSize}</span>
                      <span className="px-2 py-1 bg-blue-700 rounded text-xs">Speed: {species.speed} ft</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-700 rounded text-xs">Size: {species.sizes.join(' or ')}</span>
                      <span className="px-2 py-1 bg-blue-700 rounded text-xs">Speed: {species.speed} ft</span>
                    </div>
                  )}
                </button>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-gray-700">
                    <p className="text-gray-300 mb-4">{species.description}</p>
                    
                    {/* Size Selection Section */}
                    <div className="mb-4">
                      <h4 className="font-bold text-sm text-gray-400 mb-2">Size Options</h4>
                      {species.sizeDescription && (
                        <p className="text-gray-300 text-sm mb-3">{species.sizeDescription}</p>
                      )}
                      
                      {/* Size buttons */}
                      <div className="flex flex-wrap gap-2">
                        {species.sizes.map(size => {
                          const isSizeSelected = character.selectedSize === size;
                          
                          return (
                            <button
                              key={size}
                              onClick={() => handleSizeSelect(size as "Small" | "Medium")}
                              className={`px-3 py-2 rounded text-sm border-2 ${
                                isSizeSelected && isSelected
                                  ? 'border-purple-500 bg-purple-700 font-bold'
                                  : 'border-gray-600 hover:border-purple-400 bg-gray-700'
                              }`}
                            >
                              Size: {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Traits */}
                    {species.traits && species.traits.length > 0 && (
                      <div>
                        <h4 className="font-bold text-sm text-gray-400 mb-2">Traits</h4>
                        <ul className="text-sm space-y-2">
                          {species.traits.map((trait, index) => (
                            <li key={index} className="text-gray-300">
                              <span className="font-bold">{trait.name}</span>: {trait.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

const renderAbilityScoresStep = () => {
  const selectedBackgroundData = BACKGROUNDS[character.background];
  const abilityScoresList = (selectedBackgroundData.abilityScores || []).map(a => a.toLowerCase());
  const hasBackgroundBonuses = abilityScoresList.length > 0;
  const totalBonusApplied = Object.values(backgroundBonuses).reduce((sum, val) => sum + val, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-purple-400">Assign Ability Scores</h2>
      
      {hasBackgroundBonuses && (
        <div className="mb-8 p-6 bg-yellow-900/30 rounded-lg border-2 border-yellow-600">
          <h3 className="text-xl font-bold mb-4 text-yellow-400">Background Stat Bonuses</h3>
          <p className="text-gray-300 mb-4">Your {selectedBackgroundData.name} background gives you +3 total stat points. Use the counters below to distribute them (max +2 per ability, max +3 total):</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {abilityScoresList.map(ability => {
              const currentBonus = backgroundBonuses[ability as typeof abilities[number]] || 0;
              
              return (
                <div key={ability} className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm capitalize text-gray-400 mb-2">{ability}</div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => decrementBackgroundBonus(ability as typeof abilities[number])}
                      disabled={currentBonus <= 0}
                      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <div className={`text-2xl font-bold px-4 py-1 rounded ${currentBonus > 0 ? 'bg-yellow-700 text-white' : 'bg-gray-700'}`}>
                      {currentBonus > 0 ? `+${currentBonus}` : '+0'}
                    </div>
                    <button
                      onClick={() => incrementBackgroundBonus(ability as typeof abilities[number])}
                      disabled={currentBonus >= 2 || totalBonusApplied >= 3}
                      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-400">Total bonuses applied: </span>
            <span className={`font-bold ${totalBonusApplied === 3 ? 'text-green-400' : 'text-yellow-400'}`}>+{totalBonusApplied}/+3</span>
          </div>
        </div>
      )}

      <p className="text-gray-400 mb-8">Click a value to assign it. Each value can only be used once.</p>

      {/* Ability Score Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slots.map((slot, index) => {
          const baseValue = slot.value || 0;
          const bonusValue = backgroundBonuses[slot.ability] || 0;
          const totalValue = baseValue + bonusValue;
          
          return (
            <div key={slot.ability} className="p-6 bg-gray-800 rounded-lg border-2 border-purple-600">
              <h3 className="text-xl font-bold capitalize mb-4 text-center">{slot.ability}</h3>
              
              {/* Current Score Display */}
              <div className="mb-4 p-4 bg-gray-700 rounded-lg text-center">
                {baseValue !== 0 ? (
                  <>
                    <div className="text-sm text-gray-400 mb-1">Base Score</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold">{baseValue}</span>
                      {bonusValue > 0 && (
                        <>
                          <span className="text-yellow-400 text-xl">+{bonusValue}</span>
                          <span className="text-gray-500">=</span>
                          <span className="text-green-400 text-3xl font-bold">{totalValue}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Click below to assign</span>
                )}
              </div>

              {/* Score Selection Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {standardArray.map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreChangeDirect(index, score)}
                    disabled={slot.value === score && slot.value !== null}
                    className={`p-3 rounded-lg font-bold transition-all ${
                      slot.value === score
                        ? 'bg-green-600 text-white'
                        : slots.find(s => s.ability !== slot.ability && s.value === score)
                          ? 'bg-purple-700 hover:bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>

              {/* Modifier Display */}
              <div className="p-2 bg-purple-900/30 rounded-lg text-center">
                {baseValue !== 0 ? (
                  <>
                    <span className="text-sm text-gray-400">Modifier: </span>
                    <span className="text-xl font-bold text-purple-400">+{calculateAbilityModifier(totalValue)}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">No value assigned</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 p-6 bg-purple-900/30 rounded-lg">
        <h4 className="font-bold mb-4 text-center">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {abilities.map((ability) => {
            const slot = slots.find(s => s.ability === ability);
            const baseValue = slot?.value || 0;
            const bonusValue = backgroundBonuses[ability] || 0;
            const totalValue = baseValue + bonusValue;
            
            return (
              <div key={ability} className="p-3 bg-gray-800 rounded text-center">
                <div className="text-xs capitalize text-gray-400 mb-1">{ability}</div>
                {slot && slot.value !== null ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">{baseValue}</span>
                      {bonusValue > 0 && (
                        <>
                          <span className="text-yellow-400 text-sm">+{bonusValue}</span>
                          <span className="text-green-400 text-xl font-bold">= {totalValue}</span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-purple-400">+{calculateAbilityModifier(totalValue)}</div>
                  </>
                ) : (
                  <div className="text-gray-500">Unassigned</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

  const renderClassStep = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-purple-400">Choose Your Class</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CLASSES).map(([key, cls]) => (
          <button
            key={key}
            onClick={() => handleClassSelect(key as ClassType)}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              character.classData.class === key
                ? 'border-purple-500 bg-purple-900/30'
                : 'border-gray-700 hover:border-purple-500 bg-gray-800'
            }`}
          >
            <h3 className="text-xl font-bold mb-2 capitalize">{key.replace('_', ' ')}</h3>
            <p className="text-gray-400 text-sm mb-3">Hit Die: d{cls.hitDie} | Primary: {cls.primaryAbility}</p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-purple-700 rounded text-xs">{cls.savingThrows[0]}</span>
              <span className="px-2 py-1 bg-purple-700 rounded text-xs">{cls.savingThrows[1]}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSubclassStep = () => {
    const currentClass = character.classData.class;
    const subclasses = SUBCLASSES[currentClass] || [];

    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">Choose Your Subclass</h2>
        <p className="text-gray-400 mb-8">You'll unlock this subclass at level {currentClass === 'barbarian' || currentClass === 'bard' || currentClass === 'cleric' || currentClass === 'druid' || currentClass === 'fighter' || currentClass === 'monk' || currentClass === 'paladin' || currentClass === 'ranger' || currentClass === 'rogue' ? 3 : 1}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subclasses.map((subclass) => (
            <button
              key={subclass}
              onClick={() => handleSubclassSelect(subclass)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                character.classData.subclass === subclass
                  ? 'border-purple-500 bg-purple-900/30'
                  : 'border-gray-700 hover:border-purple-500 bg-gray-800'
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{SUBCLASS_NAMES[subclass]}</h3>
              <p className="text-gray-400 text-sm">Subclass feature at level 3</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSpellsStep = () => {
    const classKey = character.classData.class;
    const classData = CLASSES[classKey];
    
    // Get all spells and filter by the selected class
    const allSpellsForClass = getSpellsForClass(classKey);
    
    if (!classData.spellcastingInfo) {
      return (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Spells</h2>
          <p className="text-gray-400">This class does not have spellcasting.</p>
        </div>
      );
    }

    const spellcastingInfo = classData.spellcastingInfo;
    const isWizard = classKey === 'wizard';
    const cantrips = allSpellsForClass.filter(s => s.level === 0);
    const leveledSpells = allSpellsForClass.filter(s => s.level > 0);
    
    const getMaxSpellLevel = () => {
      if (!spellcastingInfo.spellSlots) return 0;
      for (let level = 9; level >= 1; level--) {
        const slotKey = `level${level}` as keyof typeof spellcastingInfo.spellSlots;
        const slots = spellcastingInfo.spellSlots[slotKey];
        if (slots && slots[Math.min(character.level, 20)] && slots[Math.min(character.level, 20)] > 0) {
          return level;
        }
      }
      return 0;
    };

    const isCantripSelected = (spellName: string) => {
      return character.cantripsKnown.includes(spellName);
    };

    const isSpellPreparedOrKnown = (spellName: string) => {
      return character.knownSpells.includes(spellName);
    };

    const isInSpellbook = (spellName: string) => {
      if (!isWizard) return false;
      return character.wizardSpellbook.includes(spellName);
    };

    const toggleCantrip = (spellName: string) => {
      setCharacter(prev => ({
        ...prev,
        cantripsKnown: prev.cantripsKnown.includes(spellName)
          ? prev.cantripsKnown.filter(s => s !== spellName)
          : [...prev.cantripsKnown, spellName]
      }));
    };

    const toggleSpellPreparation = (spellName: string) => {
      setCharacter(prev => ({
        ...prev,
        knownSpells: prev.knownSpells.includes(spellName)
          ? prev.knownSpells.filter(s => s !== spellName)
          : [...prev.knownSpells, spellName]
      }));
    };

    const toggleSpellInSpellbook = (spellName: string) => {
      setCharacter(prev => {
        const isInSpellbook = prev.wizardSpellbook.includes(spellName);
        
        // If removing, allow it freely
        if (isInSpellbook) {
          return {
            ...prev,
            wizardSpellbook: prev.wizardSpellbook.filter(s => s !== spellName)
          };
        }
        
        // If adding, check limit
        const spellbookLimit = 6 + (prev.level - 1) * 2;
        if (prev.wizardSpellbook.length >= spellbookLimit) {
          return prev; // Don't add if at limit
        }
        
        return {
          ...prev,
          wizardSpellbook: [...prev.wizardSpellbook, spellName]
        };
      });
    };

    const getCantripLimit = () => {
      if (!spellcastingInfo.cantripsKnown) return 0;
      return spellcastingInfo.cantripsKnown[Math.min(character.level - 1, 19)] || 0;
    };

    

    const getSpellbookLimit = () => {
      if (!isWizard) return 0;
      // Wizard spellbook: starts with 6 at level 1, +2 per wizard level after 1st
      return 6 + (character.level - 1) * 2;
    };



      const getPreparedSpellLimit = () => {
        if (spellcastingInfo.spellsKnown) {
          return spellcastingInfo.spellsKnown[Math.min(character.level - 1, 19)] || 0;
        }
        
        // Determine which ability score to use based on class
        let abilityScore: number | undefined;
        if (classKey === 'artificer' || classKey === 'wizard') {
          abilityScore = character.abilityScores.intelligence;
        } else if (classKey === 'cleric' || classKey === 'druid') {
          abilityScore = character.abilityScores.wisdom;
        } else if (classKey === 'bard' || classKey === 'paladin' || classKey === 'sorcerer' || classKey === 'warlock') {
          abilityScore = character.abilityScores.charisma;
        } else if (classKey === 'ranger') {
          // Rangers can use Wisdom or Dexterity, default to Wisdom for spellcasting
          abilityScore = character.abilityScores.wisdom ?? character.abilityScores.dexterity;
        }
        
        // If ability score is not set yet, return a placeholder value (assuming 10 = +0 modifier)
        if (spellcastingInfo.spellsPrepared && abilityScore !== undefined) {
          const abilityMod = calculateAbilityModifier(abilityScore);
          return spellcastingInfo.spellsPrepared(abilityMod, character.level);
        }
        
        // Fallback: assume 10 in the primary ability (+0 modifier) if not set yet
        if (spellcastingInfo.spellsPrepared) {
          return spellcastingInfo.spellsPrepared(0, character.level);
        }
        
        return 0;
      };

    const maxSpellLevel = getMaxSpellLevel();

    // Filter spells to only show those available to this class
    const filteredCantrips = cantrips.filter(spell => spell.classes.includes(classKey));
    const filteredLeveledSpells = leveledSpells.filter(spell => spell.classes.includes(classKey));

    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">Choose Your Spells</h2>
        
        <div className="mb-8 p-4 bg-purple-900/30 rounded-lg">
          {isWizard ? (
            <p className="text-gray-300">
              Cantrips Known: {character.cantripsKnown.length} / {getCantripLimit()} | 
              Spellbook: {character.wizardSpellbook.length} / {getSpellbookLimit()} | 
              Prepared: {character.knownSpells.length} / {getPreparedSpellLimit()}
            </p>
          ) : (
            <p className="text-gray-300">
              Cantrips Known: {character.cantripsKnown.length} / {getCantripLimit()} | 
              Spells Known/Prepared: {character.knownSpells.length} / {getPreparedSpellLimit()}
            </p>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-purple-300">Cantrips</h3>
          {isWizard ? (
            <p className="text-gray-400 mb-4">Wizards know cantrips separately from their spellbook. Click to add/remove known cantrips.</p>
          ) : (
            <p className="text-gray-400 mb-4">Select your known cantrips. You know {getCantripLimit()} cantrips at this level.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCantrips.map(spell => {
              const isSelected = isCantripSelected(spell.name);
              const isAtLimit = !isWizard && character.cantripsKnown.length >= getCantripLimit();
              
              return (
              <button
                key={spell.name}
                onClick={() => toggleCantrip(spell.name)}
                disabled={isAtLimit && !isSelected}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-green-500 bg-green-900/30'
                    : isAtLimit
                      ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                      : isWizard && character.cantripsKnown.length >= getCantripLimit() && !isSelected
                        ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                        : 'border-gray-700 hover:border-purple-500 bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{spell.name}</h4>
                  <span className="text-xs bg-purple-700 px-2 py-1 rounded">Cantrip</span>
                </div>
                <p className="text-sm text-gray-400 mb-2 whitespace-pre-wrap">{spell.description.substring(0, 100)}...</p>
                <div className="flex gap-2 text-xs">
                  {spell.components.verbal && <span className="bg-gray-700 px-1 rounded">V</span>}
                  {spell.components.somatic && <span className="bg-gray-700 px-1 rounded">S</span>}
                  {spell.components.material && <span className="bg-gray-700 px-1 rounded">M</span>}
                </div>
              </button>
              );
            })}
          </div>
        </div>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
          if (level > maxSpellLevel) return null;
          const spellsAtLevel = filteredLeveledSpells.filter(s => s.level === level);
          if (spellsAtLevel.length === 0) return null;
          
          return (
            <div key={level} className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Level {level} Spells</h3>
              {isWizard ? (
                <p className="text-gray-400 mb-4">Click to add/remove spells from your spellbook. Then prepare your daily spells below.</p>
              ) : (
                <p className="text-gray-400 mb-4">Select your known/prepared spells. You know {getPreparedSpellLimit()} at this level.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spellsAtLevel.map(spell => {
                  const spellbookLimit = isWizard ? 6 + (character.level - 1) * 2 : 0;
                  const isAtSpellbookLimit = isWizard && character.wizardSpellbook.length >= spellbookLimit;
                  const isAtPreparedLimit = !isWizard && character.knownSpells.length >= getPreparedSpellLimit();
                  
                  return (
                    <button
                      key={spell.name}
                      onClick={() => isWizard ? toggleSpellInSpellbook(spell.name) : toggleSpellPreparation(spell.name)}
                      disabled={isWizard 
                        ? !isInSpellbook(spell.name) && isAtSpellbookLimit
                        : !isSpellPreparedOrKnown(spell.name) && isAtPreparedLimit
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isWizard && isInSpellbook(spell.name) ? 'border-green-500 bg-green-900/30' :
                          isWizard && !isInSpellbook(spell.name) && isAtSpellbookLimit
                            ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                            : isWizard && !isInSpellbook(spell.name)
                              ? 'border-gray-700 hover:border-purple-500 bg-gray-800'
                            : isSpellPreparedOrKnown(spell.name)
                              ? 'border-green-500 bg-green-900/30'
                              : !isWizard && isAtPreparedLimit
                                ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                                : 'border-gray-700 hover:border-purple-500 bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{spell.name}</h4>
                        <span className="text-xs bg-purple-700 px-2 py-1 rounded">Level {level}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2 whitespace-pre-wrap">{spell.description.substring(0, 100)}...</p>
                      <div className="flex gap-2 text-xs">
                        {spell.components.verbal && <span className="bg-gray-700 px-1 rounded">V</span>}
                        {spell.components.somatic && <span className="bg-gray-700 px-1 rounded">S</span>}
                        {spell.components.material && <span className="bg-gray-700 px-1 rounded">M</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {isWizard && (
          <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border-2 border-blue-600">
            <h4 className="font-bold text-blue-300 mb-2">Prepare Daily Spells</h4>
            <p className="text-sm text-gray-300 mb-2">Select spells from your spellbook to prepare. You can prepare {getPreparedSpellLimit()} spells at this level.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredLeveledSpells.filter(s => s.level > 0 && s.level <= maxSpellLevel && isInSpellbook(s.name)).map(spell => (
                <button
                  key={spell.name}
                  onClick={() => toggleSpellPreparation(spell.name)}
                  disabled={!isInSpellbook(spell.name) || character.knownSpells.length >= getPreparedSpellLimit() && !character.knownSpells.includes(spell.name)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSpellPreparedOrKnown(spell.name)
                      ? 'border-green-500 bg-green-900/30'
                      : character.knownSpells.length >= getPreparedSpellLimit() && !character.knownSpells.includes(spell.name)
                        ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                        : 'border-blue-600 hover:border-blue-400 bg-blue-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{spell.name}</h4>
                    <span className="text-xs bg-purple-700 px-2 py-1 rounded">Level {spell.level}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 whitespace-pre-wrap">{spell.description.substring(0, 100)}...</p>
                  <div className="flex gap-2 text-xs">
                    {spell.components.verbal && <span className="bg-gray-700 px-1 rounded">V</span>}
                    {spell.components.somatic && <span className="bg-gray-700 px-1 rounded">S</span>}
                    {spell.components.material && <span className="bg-gray-700 px-1 rounded">M</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBackgroundStep = () => {
    // Get backgrounds array, potentially reordered if expanded card needs to move left before expanding
    const backgroundsEntries = Object.entries(BACKGROUNDS);
    let displayOrder = [...backgroundsEntries];
    
    if (expandedBackground) {
      const expandedIndex = backgroundsEntries.findIndex(([key]) => key === expandedBackground);
      
      // Move selected card to leftmost position of its row before expanding
      // Row starts at: expandedIndex - (expandedIndex % 3)
      const rowStart = expandedIndex - (expandedIndex % 3);
      
      if (rowStart !== expandedIndex) {
        // Build new order: cards before row, selected card, then remaining cards in row
        displayOrder = [];
        
        // Add all cards before this row
        for (let i = 0; i < rowStart; i++) {
          displayOrder.push(backgroundsEntries[i]);
        }
        
        // Add the selected card first in its row
        displayOrder.push(backgroundsEntries[expandedIndex]);
        
        // Add remaining cards in this row (excluding the selected one)
        for (let i = rowStart; i <= expandedIndex; i++) {
          if (i !== expandedIndex) {
            displayOrder.push(backgroundsEntries[i]);
          }
        }
        
        // Add all cards after this row
        for (let i = expandedIndex + 1; i < backgroundsEntries.length; i++) {
          displayOrder.push(backgroundsEntries[i]);
        }
      }
    }

    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">Choose Your Background</h2>
        <p className="text-gray-400 mb-4">Click a background to see full details. Click again to collapse.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayOrder.map(([key, bg]) => {
            const isSelected = character.background === key;
            const isExpanded = expandedBackground === key;
            
            return (
              <button
                key={key}
                onClick={() => {
                  const bgKey = key as Background;
                  handleBackgroundSelect(bgKey);
                  setExpandedBackground(expandedBackground === bgKey ? null : bgKey);
                }}
                className={`p-5 rounded-lg border-2 transition-all text-left ${
                  isExpanded 
                    ? 'col-span-1 md:col-span-2 lg:col-span-3 border-purple-500 bg-purple-900/40'
                    : isSelected
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-gray-700 hover:border-purple-500 bg-gray-800'
                }`}
              >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold ${isExpanded ? 'text-2xl' : 'text-lg'}`}>{bg.name}</h3>
                {bg.source && (
                  <span className="text-xs text-purple-400 bg-purple-900/50 px-2 py-1 rounded">{bg.source}</span>
                )}
              </div>
              
              {(bg.abilityScores && bg.abilityScores.length > 0) || bg.feat ? (
                <div className="mb-3 space-y-1">
                  {bg.abilityScores && bg.abilityScores.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bg.abilityScores.map(score => (
                        <span key={score} className="px-2 py-0.5 bg-yellow-700 rounded text-xs capitalize">{score}</span>
                      ))}
                    </div>
                  )}
                  {bg.feat && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Feat:</span>
                      <span className="text-xs font-semibold text-green-400">{bg.feat}</span>
                    </div>
                  )}
                </div>
              ) : null}

              <p className={`text-gray-400 mb-3 ${isExpanded ? 'text-base' : 'text-sm line-clamp-2'}`}>{bg.description}</p>
              
              {isExpanded && (
                <div className="space-y-3 pt-3 border-t border-purple-700/50 mt-3">
                  <div>
                    <span className="text-xs text-gray-500 mr-2 uppercase font-semibold">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {bg.skillProficiencies.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-purple-700 rounded text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {bg.toolProficiencies && bg.toolProficiencies.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 mr-2 uppercase font-semibold">Tools:</span>
                      <div className="flex flex-wrap gap-1">
                        {bg.toolProficiencies.map(tool => (
                          <span key={tool} className="px-2 py-1 bg-blue-700 rounded text-sm">{tool}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-gray-500 mr-2 uppercase font-semibold">Equipment:</span>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      {bg.equipment.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {bg.feature.name && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2 text-purple-400">{bg.feature.name}</h4>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{bg.feature.description}</p>
                    </div>
                  )}
                </div>
              )}

              {!isExpanded && (
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 mr-2">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {bg.skillProficiencies.map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 bg-purple-700 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {bg.toolProficiencies && bg.toolProficiencies.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 mr-2">Tools:</span>
                      <div className="flex flex-wrap gap-1">
                        {bg.toolProficiencies.map(tool => (
                          <span key={tool} className="px-1.5 py-0.5 bg-blue-700 rounded text-xs">{tool}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {bg.feature.name && (
                    <div className="pt-2 mt-2 border-t border-gray-700">
                      <span className="text-xs font-semibold text-purple-400">{bg.feature.name}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

  const renderReviewStep = () => {
    const classKey = character.classData.class;
    const isWizard = classKey === 'wizard';
    const classData = CLASSES[classKey];
    const spellcastingInfo = classData.spellcastingInfo;
    
    const getCantripLimit = () => {
      if (!spellcastingInfo?.cantripsKnown) return 0;
      return spellcastingInfo.cantripsKnown[Math.min(character.level - 1, 19)] || 0;
    };

    const getSpellbookCount = () => {
      if (isWizard) return character.wizardSpellbook.length;
      if (!spellcastingInfo?.spellsKnown) return 0;
      return spellcastingInfo.spellsKnown[Math.min(character.level - 1, 19)] || 0;
    };

    const getSpellbookLimit = () => {
      if (isWizard) {
        // Wizard spellbook: starts with 6 at level 1, +2 per wizard level after 1st
        return 6 + (character.level - 1) * 2;
      }
      if (!spellcastingInfo?.spellsKnown) return 0;
      return spellcastingInfo.spellsKnown[Math.min(character.level - 1, 19)] || 0;
    };

    const getPreparedSpellLimit = () => {
        if (isWizard && spellcastingInfo?.spellsPrepared) {
          const abilityMod = calculateAbilityModifier(character.abilityScores.intelligence);
          return spellcastingInfo.spellsPrepared(abilityMod, character.level);
        }
        if (spellcastingInfo?.spellsPrepared && character.abilityScores.charisma !== undefined) {
          const abilityMod = calculateAbilityModifier(character.abilityScores.charisma);
          return spellcastingInfo.spellsPrepared(abilityMod, character.level);
        }
        if (!spellcastingInfo?.spellsKnown) return 0;
        return spellcastingInfo.spellsKnown[Math.min(character.level - 1, 19)] || 0;
      };

      return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">Character Summary</h2>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">{character.name}</h3>
            {character.playerName && <p className="text-gray-400">Player: {character.playerName}</p>}
          </div>
          <select
            value={character.level}
            onChange={(e) => handleLevelChange(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-700 rounded-lg"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
              <option key={lvl} value={lvl}>Level {lvl}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
<div className="p-3 bg-gray-700 rounded text-center">
              <div className="text-sm text-gray-400">{character.species ? SPECIES[character.species].name : 'Not selected'}</div>
            </div>
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400 capitalize">{character.classData.class.replace('_', ' ')}</div>
          </div>
<div className="p-3 bg-gray-700 rounded text-center">
              <div className="text-sm text-gray-400">{character.species ? SPECIES[character.species].name : 'Not selected'}</div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {Object.entries(character.abilityScores).map(([stat, score]) => (
            <div key={stat} className="p-4 bg-gray-700 rounded text-center">
              <div className="text-sm capitalize text-gray-400">{stat}</div>
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-purple-400">+{calculateAbilityModifier(score)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">AC</div>
            <div className="text-2xl font-bold">{character.ac}</div>
          </div>
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">Speed</div>
            <div className="text-2xl font-bold">{character.speed} ft</div>
          </div>
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">Hit Points</div>
            <div className="text-2xl font-bold">{character.hitPoints.current}/{character.hitPoints.max}</div>
          </div>
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">Proficiency</div>
            <div className="text-2xl font-bold">+{character.proficiencyBonus}</div>
          </div>
        </div>

        {character.classData.subclass && (
          <div className="mb-6 p-4 bg-purple-900/30 rounded-lg">
            <h4 className="font-bold mb-2">Subclass</h4>
            <p>{SUBCLASS_NAMES[character.classData.subclass]}</p>
          </div>
        )}

        {character.traits.length > 0 && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-bold mb-2">Racial Traits</h4>
            {character.traits.map((trait, idx) => (
              <p key={idx} className="text-sm text-gray-300">{trait.name}: {trait.description}</p>
            ))}
          </div>
        )}

        {character.featuresAndClasses.length > 0 && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-bold mb-2">Features</h4>
            {character.featuresAndClasses.map((feature, idx) => (
              <p key={idx} className="text-sm text-gray-300">{feature.name}: {feature.description}</p>
            ))}
          </div>
        )}

        {(character.cantripsKnown.length > 0 || character.knownSpells.length > 0 || (character.classData.class === 'wizard' && character.wizardSpellbook.length > 0)) && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-bold mb-2">Spells</h4>
            {isWizard ? (
              <>
                <p className="text-sm text-green-300 font-semibold mb-1">Cantrips Known ({character.cantripsKnown.length}/{getCantripLimit()}):</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {character.cantripsKnown.map(spell => (
                    <span key={spell} className="px-2 py-1 bg-gray-800 rounded text-xs">{spell}</span>
                  ))}
                </div>
                <p className="text-sm text-blue-300 font-semibold mb-1">Spellbook ({character.wizardSpellbook.length}/{getSpellbookLimit()}):</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {character.wizardSpellbook.map(spell => (
                    <span key={spell} className="px-2 py-1 bg-blue-800 rounded text-xs">{spell}</span>
                  ))}
                </div>
                <p className="text-sm text-purple-300 font-semibold mb-1">Prepared ({character.knownSpells.length}/{getPreparedSpellLimit()}):</p>
                <div className="flex flex-wrap gap-2">
                  {character.knownSpells.map(spell => (
                    <span key={spell} className="px-2 py-1 bg-purple-800 rounded text-xs">{spell}</span>
                  ))}
                </div>
              </>
            ) : (
              <>
                {character.cantripsKnown.length > 0 && (
                  <>
                    <p className="text-sm text-green-300 font-semibold mb-1">Cantrips ({character.cantripsKnown.length}/{getCantripLimit()}):</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {character.cantripsKnown.map(spell => (
                        <span key={spell} className="px-2 py-1 bg-gray-800 rounded text-xs">{spell}</span>
                      ))}
                    </div>
                  </>
                )}
                <p className="text-sm text-purple-300 font-semibold mb-1">Spells Known/Prepared ({character.knownSpells.length}/{getSpellbookCount()}):</p>
                <div className="flex flex-wrap gap-2">
                  {character.knownSpells.map(spell => (
                    <span key={spell} className="px-2 py-1 bg-gray-800 rounded text-xs">{spell}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">Gold</div>
            <div className="text-xl font-bold">{character.goldPieces} gp</div>
          </div>
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">Platinum</div>
            <div className="text-xl font-bold">{character.platinumPieces} pp</div>
          </div>
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">Electrum</div>
            <div className="text-xl font-bold">{character.electrumPieces} ep</div>
          </div>
          <div className="p-3 bg-gray-700 rounded text-center">
            <div className="text-sm text-gray-400">Silver</div>
            <div className="text-xl font-bold">{character.silverPieces} sp</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const saved = JSON.stringify(character);
          localStorage.setItem('dnd_character', saved);
          alert('Character saved!');
        }}
        className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl transition-all"
      >
        Save Character
      </button>
    </div>
  );
};

  const stepNames: Step[] = ['name', 'species', 'background', 'ability_scores', 'class', 'subclass', 'spells', 'inventory', 'review'];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Name', 'Species', 'Background', 'Abilities', 'Class', 'Subclass', 'Spells', 'Inventory', 'Review'].map((label, idx) => {
            const currentStepIndex = stepNames.indexOf(step);
            const clickedStepIndex = idx;
            const isCompleted = clickedStepIndex <= currentStepIndex;
            
            return (
              <button
                key={label}
                onClick={() => isCompleted && setStep(stepNames[idx])}
                disabled={!isCompleted}
                className={`text-sm cursor-pointer transition-all ${
                  step === stepNames[idx] 
                    ? 'text-purple-400 font-bold' 
                    : isCompleted 
                      ? 'text-gray-300 hover:text-purple-400' 
                      : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${(stepNames.indexOf(step) + 1) * 11.11}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {step === 'name' && renderNameStep()}
      {step === 'species' && renderSpeciesStep()}
      {step === 'ability_scores' && renderAbilityScoresStep()}
      {step === 'class' && renderClassStep()}
      {step === 'subclass' && renderSubclassStep()}
      {step === 'spells' && renderSpellsStep()}
      {step === 'background' && renderBackgroundStep()}
      {step === 'inventory' && <InventoryManager character={character} setCharacter={setCharacter} />}
      {step === 'review' && renderReviewStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={['name'].includes(step)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            ['name'].includes(step)
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-purple-700 hover:bg-purple-600'
          }`}
        >
          Previous
        </button>

        {step !== 'review' && (
          <button
            onClick={nextStep}
            disabled={
              (step === 'name' && !character.name) ||
              (step === 'species' && !character.speciesSelected)
            }
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              (step === 'name' && !character.name) || (step === 'species' && !character.speciesSelected)
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
