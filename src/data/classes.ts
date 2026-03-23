import type { ClassData, StartingEquipment } from "../types";

const COMMON_ARMOR: StartingEquipment[] = [
  { item: "Leather armor", quantity: 1 },
  { item: "Explorer's pack", quantity: 1 }
];

export const CLASSES: Record<string, ClassData> = {
  barbarian: {
    class: "barbarian",
    hitDie: 12,
    primaryAbility: "strength",
    savingThrows: ["strength", "constitution"],
    armorProficiencies: ["light_armor", "medium_armor", "shields"],
    weaponProficiencies: [
      "simple_melee_weapons",
      "martial_melee_weapons"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Greataxe or martial melee weapon", quantity: 1, choose: { from: ["greataxe", "martial melee weapon"], count: 1 } },
      { item: "Handaxe (x2) or simple ranged weapon", quantity: 1, choose: { from: ["handaxe (x2)", "simple ranged weapon"], count: 1 } },
      ...COMMON_ARMOR
    ],
    classFeatures: [
      { level: 1, name: "Unarmored Defense", description: "While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit." },
      { level: 1, name: "Rage", description: "You can enter a rage in combat. While raging, you have advantage on Strength checks and Strength saving throws, melee weapon attacks using Strength deal extra damage (2 at 1st level), and you have resistance to bludgeoning, piercing, and slashing damage." },
      { level: 2, name: "Reckless Attack", description: "You can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn." },
      { level: 2, name: "Danger Sense", description: "You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells." },
      { level: 3, name: "Primal Path", description: "Choose a Primal Path that shapes your rage. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels." },
      { level: 5, name: "Extra Attack", description: "You can attack twice, instead of once, whenever you take the Attack action on your turn." },
      { level: 5, name: "Fast Movement", description: "Your speed increases by 10 feet while you aren't wearing heavy armor." },
      { level: 7, name: "Feral Instinct", description: "You can react to danger before others even see it. You have advantage on initiative rolls." },
      { level: 9, name: "Brutal Critical (1 die)", description: "When you score a critical hit with a Strength melee weapon attack, you can roll one additional damage die and add it to the extra damage of the critical hit." },
      { level: 11, name: "Relentless Rage", description: "Your rage can keep you fighting despite sustaining injuries. When you drop to 0 hit points while raging and don't die outright, you can drop to 1 hit point instead." },
      { level: 13, name: "Brutal Critical (2 dice)", description: "You can roll two additional damage dice when you score a critical hit with a Strength melee weapon attack." },
      { level: 15, name: "Persistent Rage", description: "Your rage is so fierce that it ends on your turn automatically only if you haven't taken a damage or dealt damage to a hostile creature since your last turn. You also don't need to make a Constitution saving throw at the end of your turn to maintain your rage." },
      { level: 17, name: "Brutal Critical (3 dice)", description: "You can roll three additional damage dice when you score a critical hit with a Strength melee weapon attack." },
      { level: 20, name: "Primal Champion", description: "You embody the power of your rage. Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 24." }
    ]
  },
  bard: {
    class: "bard",
    hitDie: 8,
    primaryAbility: "charisma",
    savingThrows: ["dexterity", "charisma"],
    armorProficiencies: ["light_armor"],
    weaponProficiencies: [
      "simple_melee_weapons",
      "simple_ranged_weapons"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Leather armor or light armor", quantity: 1 },
      { item: "Dagger (x2) or rapier", quantity: 1, choose: { from: ["dagger (x2)", "rapier"], count: 1 } },
      { item: "Musical instrument", quantity: 1 },
      { item: "Entertainer's pack", quantity: 1 }
    ],
    spellcastingInfo: {
      cantripsKnown: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 10],
      spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 22, 22],
      spellSlots: { level1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], level2: [0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], level3: [0, 0, 0, 0, 0, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], level4: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You have learned to untap the magic of music and words. You know two cantrips and four 1st-level spells from the bard spell list." },
      { level: 1, name: "Bardic Inspiration (d6)", description: "You can inspire others through stirring words or music. To do so, you use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a d6." },
      { level: 2, name: "Jack of All Trades", description: "You can add half your proficiency bonus, rounded down, to any ability check you make that doesn't already include your proficiency bonus." },
      { level: 2, name: "Song of Rest (d6)", description: "You can use a bonus action to sing, recite, or play an instrument. If you or any friendly creatures who can hear your performance roll Hit Dice to restore hit points, they gain an extra die of that type." },
      { level: 3, name: "Bard College", description: "Choose a Bard College that you study in depth. Your choice grants you features at 3rd level and again at 6th and 14th levels." },
      { level: 5, name: "Bardic Inspiration (d8)", description: "Your Bardic Inspiration die changes to a d8." },
      { level: 5, name: "Expertise", description: "Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make with either of them." },
      { level: 6, name: "Countercharm", description: "You and friendly creatures within 30 feet can't be charmed or frightened while they can hear you." },
      { level: 10, name: "Bardic Inspiration (d12)", description: "Your Bardic Inspiration die changes to a d12." },
      { level: 14, name: "Magical Secrets", description: "You learn two spells of your choice from any class's spell list. They count as bard spells for you and don't count against the number of bard spells you know." }
    ]
  },
cleric: {
    class: "cleric",
    hitDie: 8,
    primaryAbility: "wisdom",
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["light_armor", "medium_armor", "shields"],
    weaponProficiencies: [
      "simple_melee_weapons"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Scale mail or leather armor", quantity: 1, choose: { from: ["scale mail", "leather armor"], count: 1 } },
      { item: "Shield", quantity: 1 },
      { item: "Mace or warhammer", quantity: 1, choose: { from: ["mace", "warhammer"], count: 1 } },
      { item: "Holy symbol", quantity: 1 },
      { item: "Priest's pack or explorer's pack", quantity: 1, choose: { from: ["priest's pack", "explorer's pack"], count: 1 } }
    ],
    spellcastingInfo: {
      cantripsKnown: [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 10],
      spellsPrepared: (wisdomMod: number, level: number) => Math.max(1, wisdomMod + level),
      spellSlots: { level1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], level2: [0, 0, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], level3: [0, 0, 0, 0, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], level4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], level5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You are a conduit for divine power. You know three cantrips and prepare a number of cleric spells equal to your Wisdom modifier + your cleric level (minimum of one spell)." },
      { level: 1, name: "Divine Domain", description: "Choose a Divine Domain that channels divine power. Your choice grants you features at 1st level and again at 2nd, 6th, 8th, and 17th levels." },
      { level: 2, name: "Channel Divinity (1/rest)", description: "You can channel divine energy to fuel magical effects. You regain all expended uses when you finish a long rest." },
      { level: 5, name: "Destroy Undead (CR 1/2)", description: "When an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below a certain threshold." },
      { level: 6, name: "Channel Divinity (2/rest)", description: "You can use Channel Divinity twice between long rests." },
      { level: 8, name: "Destroy Undead (CR 1)", description: "The threshold for Destroy Undead increases to CR 1." },
      { level: 10, name: "Divine Strike", description: "You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 damage of the same type as the weapon." },
      { level: 11, name: "Destroy Undead (CR 2)", description: "The threshold for Destroy Undead increases to CR 2." },
      { level: 17, name: "Divine Strike (2d8)", description: "Your Divine Strike damage increases to 2d8." },
      { level: 20, name: "Divine Intervention", description: "You can call on your deity to intervene on your behalf when you need help. You have a 5% chance per cleric level that your intervention succeeds." }
    ]
  },
druid: {
    class: "druid",
    hitDie: 8,
    primaryAbility: "wisdom",
    savingThrows: ["intelligence", "wisdom"],
    armorProficiencies: ["light_armor", "medium_armor", "shields"],
    weaponProficiencies: [
      "clubs",
      "darts",
      "javelins",
      "maces",
      "quarterstaffs",
      "scimitars",
      "sickles",
      "slings",
      "spears"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Leather armor or scale mail", quantity: 1, choose: { from: ["leather armor", "scale mail"], count: 1 } },
      { item: "Shield", quantity: 1 },
      { item: "Scimitar or any melee weapon", quantity: 1, choose: { from: ["scimitar", "any melee weapon"], count: 1 } },
      { item: "Holy symbol", quantity: 1 },
      { item: "Druidic focus or explorer's pack", quantity: 1, choose: { from: ["druidic focus", "explorer's pack"], count: 1 } }
    ],
    spellcastingInfo: {
      cantripsKnown: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 10],
      spellsPrepared: (wisdomMod: number, level: number) => Math.max(1, wisdomMod + Math.floor(level / 2)),
      spellSlots: { level1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], level2: [0, 0, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], level3: [0, 0, 0, 0, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], level4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], level5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You can cast druid spells. You prepare a number of druid spells equal to your Wisdom modifier + your druid level (minimum of one spell). You know two cantrips." },
      { level: 2, name: "Druid Circle", description: "Choose a Druid Circle that shapes your practice of druidism. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th levels." },
      { level: 2, name: "Wild Shape (2/rest)", description: "You can use your action to magically assume the shape of a beast that you have seen before. You can use this feature twice between long rests." },
      { level: 4, name: "Druid Circle Feature", description: "You gain a feature from your Druid Circle." },
      { level: 6, name: "Wild Shape Improvement", description: "Your Wild Shape improves. You can now transform into beasts with a challenge rating of up to 1 (without flying or swimming speed)." },
      { level: 8, name: "Druid Circle Feature", description: "You gain another feature from your Druid Circle." },
      { level: 10, name: "Wild Shape Improvement", description: "Your Wild Shape improves further. You can now transform into beasts with a challenge rating of up to 1 (with flying or swimming speed)." },
      { level: 14, name: "Druid Circle Feature", description: "You gain your final Druid Circle feature." }
    ]
  },
  fighter: {
    class: "fighter",
    hitDie: 10,
    primaryAbility: "strength",
    savingThrows: ["strength", "constitution"],
    armorProficiencies: [
      "all_armor_types",
      "shields"
    ],
    weaponProficiencies: [
      "simple_weapons",
      "martial_weapons"
    ],
    startingEquipment: [
      { item: "Chain mail or leather armor", quantity: 1, choose: { from: ["chain mail", "leather armor"], count: 1 } },
      { item: "Shield and martial melee weapon or two martial ranged weapons", quantity: 1, choose: { from: ["shield + martial melee weapon", "two martial ranged weapons"], count: 1 } },
      { item: "Dungeoneer's pack or explorer's pack", quantity: 1, choose: { from: ["dungeoneer's pack", "explorer's pack"], count: 1 } }
    ],
    classFeatures: [
      { level: 1, name: "Fighting Style", description: "You adopt a particular style of fighting as your specialty. Choose one of the following options: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting." },
      { level: 1, name: "Second Wind", description: "You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level." },
      { level: 2, name: "Action Surge (1/use)", description: "You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again." },
      { level: 3, name: "Martial Archetype", description: "Choose a Martial Archetype that represents your military training and tactics. Your choice grants you features at 3rd level and again at 7th, 10th, 15th, and 18th levels." },
      { level: 5, name: "Extra Attack", description: "You can attack twice, instead of once, whenever you take the Attack action on your turn." },
      { level: 6, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 7, name: "Martial Archetype Feature", description: "You gain a feature from your Martial Archetype." },
      { level: 9, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 10, name: "Action Surge (2/use)", description: "You can use Action Surge twice between long rests." },
      { level: 11, name: "Extra Attack (3 attacks)", description: "You can attack three times instead of twice when you take the Attack action." },
      { level: 13, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 14, name: "Martial Archetype Feature", description: "You gain another feature from your Martial Archetype." },
      { level: 15, name: "Indomitable (1/rest)", description: "You can force yourself to continue fighting. When you fail a saving throw, you can reroll it and must use the new roll. Once you use this feature, you must finish a long rest before you can use it again." },
      { level: 17, name: "Martial Archetype Feature", description: "You gain another Martial Archetype feature." },
      { level: 18, name: "Action Surge (3/use)", description: "You can use Action Surge three times between long rests." },
      { level: 19, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 20, name: "Extra Attack (4 attacks)", description: "You can attack four times instead of three when you take the Attack action." }
    ]
  },
  monk: {
    class: "monk",
    hitDie: 8,
    primaryAbility: "dexterity",
    savingThrows: ["strength", "dexterity"],
    armorProficiencies: [],
    weaponProficiencies: [
      "shortswords",
      "simple_melee_weapons"
    ],
    startingEquipment: [
      { item: "Shortsword or any simple melee weapon", quantity: 1, choose: { from: ["shortsword", "any simple melee weapon"], count: 1 } },
      { item: "Dungeoneer's pack or explorer's pack", quantity: 1, choose: { from: ["dungeoneer's pack", "explorer's pack"], count: 1 } },
      { item: "Dart (x10)", quantity: 10 }
    ],
    classFeatures: [
      { level: 1, name: "Unarmored Defense", description: "While you are not wearing armor or wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier." },
      { level: 1, name: "Martial Arts", description: "You can use Dexterity instead of Strength for the attack and damage rolls of your unarmed strikes and monk weapons. You can roll a d4 in place of the normal damage of your unarmed strike or monk weapon." },
      { level: 2, name: "Ki (2 points)", description: " Your ki is a pool of energy that you can use to fuel special abilities. You have 2 Ki points at 2nd level, and you regain all expended Ki points when you finish a short or long rest." },
      { level: 3, name: "Monastic Tradition", description: "Choose a Monastic Tradition that shapes your practice of monasticism. Your choice grants you features at 3rd level and again at 6th, 11th, and 17th levels." },
      { level: 4, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 5, name: "Unarmored Movement", description: "Your speed increases by 10 feet while you are not wearing armor or wielding a shield." },
      { level: 6, name: "Monastic Tradition Feature", description: "You gain a feature from your Monastic Tradition." },
      { level: 8, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 9, name: "Slow Fall", description: "You can use your reaction when you fall to reduce any falling damage you take by an amount equal to five times your monk level." },
      { level: 10, name: "Ki (4 points)", description: "Your Ki pool increases. You now have 4 Ki points at 10th level." },
      { level: 11, name: "Monastic Tradition Feature", description: "You gain another feature from your Monastic Tradition." },
      { level: 13, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 14, name: "Diamond Soul", description: "You have mastered the art of focusing your mind. You gain proficiency in all saving throws. Additionally, whenever you make a saving throw and fail, you can spend 2 Ki points to reroll it and take the second result." },
      { level: 15, name: "Empty Body", description: "You can use your action to spend 4 Ki points to become invisible for 1 minute. During this time, you also have resistance to all damage except psychic and radiant damage." },
      { level: 17, name: "Monastic Tradition Feature", description: "You gain another feature from your Monastic Tradition." },
      { level: 18, name: "Timeless Body", description: "Your mastery of the ki flowing through you makes you immune to poison damage and the poisoned condition. Additionally, you can't be aged magically." },
      { level: 20, name: "Perfect Self", description: "When you roll for initiative and fail, you can spend 6 Ki points to reroll it and take the second result. Additionally, you gain resistance to all damage except psychic and radiant damage." }
    ]
  },
paladin: {
    class: "paladin",
    hitDie: 10,
    primaryAbility: "strength",
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["all_armor_types"],
    weaponProficiencies: [
      "simple_weapons",
      "martial_weapons"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Chain mail or plate armor", quantity: 1, choose: { from: ["chain mail", "plate armor"], count: 1 } },
      { item: "Shield", quantity: 1 },
      { item: "Martial melee weapon or two handaxes", quantity: 1, choose: { from: ["martial melee weapon", "two handaxes"], count: 1 } },
      { item: "Holy symbol", quantity: 1 },
      { item: "Priest's pack or explorer's pack", quantity: 1, choose: { from: ["priest's pack", "explorer's pack"], count: 1 } }
    ],
    spellcastingInfo: {
      cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5],
      spellsPrepared: (charismaMod: number, level: number) => Math.max(1, charismaMod + Math.floor(level / 2)),
      spellSlots: { level1: [0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], level2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You have learned to draw on divine magic through meditation and prayer. You prepare a number of paladin spells equal to your Charisma modifier + half your paladin level (rounded down)." },
      { level: 2, name: "Fighting Style", description: "You adopt a particular style of fighting as your specialty. Choose one of the following options: Defense, Dueling, Great Weapon Fighting, or Protection." },
      { level: 2, name: "Divine Sense", description: "The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. As an action, you can open your awareness to detect such forces." },
      { level: 2, name: "Lay on Hands (5 HP)", description: "Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With it, you can restore a total number of hit points equal to your paladin level × 5." },
      { level: 3, name: "Divine Smite", description: "When you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage to the target, in addition to the weapon's damage. The extra damage is 2d8 for a 1st-level spell slot, plus 1d8 for each level of the spell slot above 1st." },
      { level: 3, name: "Paladin Oath", description: "You swear an oath that binds you to an ideal as you pursue your life as a paladin. Your choice grants you features at 3rd level and again at 7th, 15th, and 20th levels." },
      { level: 5, name: "Extra Attack", description: "You can attack twice, instead of once, whenever you take the Attack action on your turn." },
      { level: 6, name: "Aura of Protection (5 ft)", description: "Whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (minimum of +1)." },
      { level: 10, name: "Aura Improvement", description: "The range of your Aura of Protection increases to 30 feet." },
      { level: 11, name: "Improved Divine Smite", description: "You are so suffused with righteous might that all your melee weapon strikes carry divine power with them. Whenever you hit a creature with a melee weapon, the creature takes an extra 1d4 radiant damage." },
      { level: 18, name: "Aura of Courage", description: "You and friendly creatures within 10 feet (now 30 feet at 18th level) can't be frightened while they can see or hear you." }
    ]
  },
ranger: {
    class: "ranger",
    hitDie: 10,
    primaryAbility: "wisdom",
    savingThrows: ["strength", "dexterity"],
    armorProficiencies: ["light_armor", "medium_armor", "shields"],
    weaponProficiencies: [
      "simple_melee_weapons",
      "martial_melee_weapons",
      "simple_ranged_weapons",
      "martial_ranged_weapons"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Scale mail or leather armor", quantity: 1, choose: { from: ["scale mail", "leather armor"], count: 1 } },
      { item: "Two shortswords or two simple melee weapons", quantity: 1, choose: { from: ["two shortswords", "two simple melee weapons"], count: 1 } },
      { item: "Dungeoneer's pack or explorer's pack", quantity: 1, choose: { from: ["dungeoneer's pack", "explorer's pack"], count: 1 } }
    ],
    spellcastingInfo: {
      cantripsKnown: [0, 0, 0, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10],
      spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22],
      spellSlots: { level1: [0, 0, 0, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11], level2: [0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You have learned to draw on nature's power to cast spells. You prepare a number of ranger spells equal to your Wisdom modifier + half your ranger level (rounded down)." },
      { level: 2, name: "Favored Enemy", description: "Choose one type of creature as your favored enemy. You have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them." },
      { level: 2, name: "Natural Explorer", description: "You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, or swamp." },
      { level: 3, name: "Ranger Archetype", description: "Choose a Ranger Archetype that represents your specialty. Your choice grants you features at 3rd level and again at 5th, 11th, and 15th levels." },
      { level: 5, name: "Extra Attack", description: "You can attack twice, instead of once, whenever you take the Attack action on your turn." },
      { level: 8, name: "Favored Enemy Improvement", description: "Choose two additional types of favored enemies. In addition, you learn one language of your choice for each favored enemy." },
      { level: 10, name: "Natural Explorer Improvement", description: "Your Natural Explorer feature improves. You gain additional benefits based on your chosen terrain." },
      { level: 14, name: "Favored Enemy Improvement", description: "Choose three additional types of favored enemies. In addition, you learn one language of your choice for each favored enemy." }
    ]
  },
  rogue: {
    class: "rogue",
    hitDie: 8,
    primaryAbility: "dexterity",
    savingThrows: ["dexterity", "intelligence"],
    armorProficiencies: [
      "light_armor"
    ],
    weaponProficiencies: [
      "simple_weapons",
      "hand_crossbows",
      "longswords",
      "rapiers",
      "shortswords"
    ],
    startingEquipment: [
      { item: "Leather armor or studded leather armor", quantity: 1 },
      { item: "Two daggers or shortsword", quantity: 1, choose: { from: ["two daggers", "shortsword"], count: 1 } },
      { item: "Thieves' tools", quantity: 1 },
      { item: "Dungeoneer's pack or entertainer's pack", quantity: 1, choose: { from: ["dungeoneer's pack", "entertainer's pack"], count: 1 } }
    ],
    classFeatures: [
      { level: 1, name: "Sneak Attack (1d6)", description: "You know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack roll if you have advantage on the attack roll." },
      { level: 1, name: "Thieves' Cant", description: "You know thieves' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation." },
      { level: 2, name: "Cunning Action", description: "You can take a bonus action on each of your turns to take the Dash, Disengage, or Hide action." },
      { level: 3, name: "Rogue Archetype", description: "Choose a Rogue Archetype that represents your specialty. Your choice grants you features at 3rd level and again at 9th, 13th, and 17th levels." },
      { level: 5, name: "Sneak Attack (2d6)", description: "Your Sneak Attack damage increases to 2d6." },
      { level: 7, name: "Uncanny Dodge", description: "When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack's damage against you." },
      { level: 9, name: "Rogue Archetype Feature", description: "You gain a feature from your Rogue Archetype." },
      { level: 11, name: "Sneak Attack (3d6)", description: "Your Sneak Attack damage increases to 3d6." },
      { level: 13, name: "Rogue Archetype Feature", description: "You gain another feature from your Rogue Archetype." },
      { level: 14, name: "Evasion", description: "When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail." },
      { level: 15, name: "Rogue Archetype Feature", description: "You gain another Rogue Archetype feature." },
      { level: 17, name: "Sneak Attack (4d6)", description: "Your Sneak Attack damage increases to 4d6." },
      { level: 18, name: "Rogue Archetype Feature", description: "You gain your final Rogue Archetype feature." },
      { level: 20, name: "Stroke of Luck", description: "If your attack misses a target within range, you can turn the miss into a hit. Alternatively, if you fail an ability check, you can treat the d20 roll as a 20. Once you use this feature, you can't use it again until you finish a short or long rest." }
    ]
  },
sorcerer: {
    class: "sorcerer",
    hitDie: 6,
    primaryAbility: "charisma",
    savingThrows: ["constitution", "charisma"],
    armorProficiencies: [],
    weaponProficiencies: [
      "simple_melee_weapons"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Light crossbow and 20 bolts or any simple weapon", quantity: 1, choose: { from: ["light crossbow and 20 bolts", "any simple weapon"], count: 1 } },
      { item: "Component pouch or arcane focus", quantity: 1, choose: { from: ["component pouch", "arcane focus"], count: 1 } },
      { item: "Dungeoneer's pack or explorer's pack", quantity: 1, choose: { from: ["dungeoneer's pack", "explorer's pack"], count: 1 } }
    ],
    spellcastingInfo: {
      cantripsKnown: [4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
      spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 22, 23, 24],
      spellSlots: { level1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], level2: [0, 0, 0, 2, 3, 3, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], level3: [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], level4: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], level5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You have learned to tap into the magic of your bloodline. You know two cantrips and four 1st-level spells from the sorcerer spell list." },
      { level: 1, name: "Sorcerous Origin", description: "Choose a Sorcerous Origin that describes your magical source. Your choice grants you features at 1st level and again at 6th, 14th, and 18th levels." },
      { level: 2, name: "Metamagic (2 options)", description: "You gain the ability to twist your spells to suit your needs. You know two Metamagic options: Careful Spell, Distant Spell, Empowered Spell, Extended Spell, Heightened Spell, Quickened Spell, Subtle Spell, or Twinned Spell." },
      { level: 3, name: "Sorcerous Origin Feature", description: "You gain a feature from your Sorcerous Origin." },
      { level: 4, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 5, name: "Sorcerous Origin Feature", description: "You gain another feature from your Sorcerous Origin." },
      { level: 6, name: "Metamagic (3 options)", description: "You learn a third Metamagic option." },
      { level: 8, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 10, name: "Sorcerous Origin Feature", description: "You gain another feature from your Sorcerous Origin." },
      { level: 12, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 14, name: "Metamagic (4 options)", description: "You learn a fourth Metamagic option." },
      { level: 16, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 18, name: "Sorcerous Origin Feature", description: "You gain another feature from your Sorcerous Origin." },
      { level: 20, name: "Metamagic (5 options)", description: "You learn a fifth Metamagic option. Additionally, you can use one of your Metamagic options without spending sorcery points once per long rest." }
    ]
  },
warlock: {
    class: "warlock",
    hitDie: 8,
    primaryAbility: "charisma",
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: [],
    weaponProficiencies: [
      "simple_melee_weapons"
    ],
    toolProficiencies: [],
    startingEquipment: [
      { item: "Light crossbow and 20 bolts or any simple weapon", quantity: 1, choose: { from: ["light crossbow and 20 bolts", "any simple weapon"], count: 1 } },
      { item: "Component pouch or arcane focus", quantity: 1, choose: { from: ["component pouch", "arcane focus"], count: 1 } },
      { item: "Scholar's pack or explorer's pack", quantity: 1, choose: { from: ["scholar's pack", "explorer's pack"], count: 1 } }
    ],
    spellcastingInfo: {
      cantripsKnown: [2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12],
      spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 22, 23, 24],
      spellSlots: { level1: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], level2: [0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], level3: [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], level4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You have learned to draw on cosmic magic through a pact with a powerful being. You know two cantrips and four 1st-level spells from the warlock spell list." },
      { level: 1, name: "Otherworldly Patron", description: "Choose an Otherworldly Patron that you have made a pact with. Your choice grants you features at 1st level and again at 6th, 10th, and 14th levels." },
      { level: 2, name: "Eldritch Invocations (2 options)", description: "You gain two Eldritch Invocations of your choice. You can choose an invocation more than once if its prerequisites are met." },
      { level: 3, name: "Pact Boon", description: "Your pact with your patron grants you a special boon. Choose one of the following options: Pact of the Blade, Pact of the Chain, or Pact of the Tome." },
      { level: 4, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 5, name: "Mystic Arcanum (6th-level spell)", description: "Your patron grants you a mystic arcanum—a powerful spell. Choose one 6th-level spell from the warlock spell list as your mystic arcanum." },
      { level: 6, name: "Otherworldly Patron Feature", description: "You gain a feature from your Otherworldly Patron." },
      { level: 8, name: "Eldritch Invocations (4 options)", description: "You learn two additional Eldritch Invocations of your choice." },
      { level: 9, name: "Mystic Arcanum (7th-level spell)", description: "Choose one 7th-level spell from the warlock spell list as your mystic arcanum." },
      { level: 10, name: "Otherworldly Patron Feature", description: "You gain another feature from your Otherworldly Patron." },
      { level: 11, name: "Mystic Arcanum (8th-level spell)", description: "Choose one 8th-level spell from the warlock spell list as your mystic arcanum." },
      { level: 12, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 14, name: "Otherworldly Patron Feature", description: "You gain another feature from your Otherworldly Patron." },
      { level: 15, name: "Mystic Arcanum (9th-level spell)", description: "Choose one 9th-level spell from the warlock spell list as your mystic arcanum." },
      { level: 16, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 18, name: "Eldritch Invocations (6 options)", description: "You learn two additional Eldritch Invocations of your choice." },
      { level: 19, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 20, name: "Mystic Arcanum (Any level)", description: "Choose any spell from the warlock spell list as an additional mystic arcanum. You can cast it once without expending a spell slot." }
    ]
  },
wizard: {
    class: "wizard",
    hitDie: 6,
    primaryAbility: "intelligence",
    savingThrows: ["intelligence", "wisdom"],
    armorProficiencies: [],
    weaponProficiencies: [
      "daggers",
      "darts",
      "slings",
      "quarterstaffs",
      "light_crossbows"
    ],
    startingEquipment: [
      { item: "Dagger or quarterstaff", quantity: 1, choose: { from: ["dagger", "quarterstaff"], count: 1 } },
      { item: "Component pouch or arcane focus", quantity: 1, choose: { from: ["component pouch", "arcane focus"], count: 1 } },
      { item: "Scholar's pack or explorer's pack", quantity: 1, choose: { from: ["scholar's pack", "explorer's pack"], count: 1 } }
    ],
    spellcastingInfo: {
      cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      spellsPrepared: (intelligenceMod: number, level: number) => Math.max(1, intelligenceMod + level),
      spellSlots: { level1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], level2: [0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], level3: [0, 0, 0, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], level4: [0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], level5: [0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] }
    },
    classFeatures: [
      { level: 1, name: "Spellcasting", description: "You have learned to tap into the magical energy that suffuses the multiverse. You know two cantrips and prepare a number of wizard spells equal to your Intelligence modifier + half your wizard level (minimum of one spell)." },
      { level: 1, name: "Arcane Recovery", description: "You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover." },
      { level: 2, name: "Wizard School", description: "Choose an Arcane School that you specialize in. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th levels." },
      { level: 3, name: "Cantrip Power", description: "You learn one additional cantrip of your choice from the wizard spell list." },
      { level: 4, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 6, name: "Wizard School Feature", description: "You gain a feature from your Arcane School." },
      { level: 8, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 10, name: "Wizard School Feature", description: "You gain another feature from your Arcane School." },
      { level: 12, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 14, name: "Wizard School Feature", description: "You gain another feature from your Arcane School." },
      { level: 16, name: "Ability Score Improvement", description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each." },
      { level: 18, name: "Spell Mastery", description: "You have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level wizard spell and a 2nd-level wizard spell that are in your spellbook. You can cast those spells at their lowest level without expending a spell slot." },
      { level: 20, name: "Signature Spells", description: "You gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared and they don't count against the number of spells you have prepared." }
    ]
  }
};
