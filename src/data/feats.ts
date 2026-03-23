import type { Feat } from "../types";

export const FEATS: Record<string, Feat> = {
  "ability_score_improvement": {
    name: "Ability Score Improvement",
    description: "You can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1 each. You can't increase an ability score above 20 using this feat.",
    benefits: [
      "+2 to one ability score, OR +1 to two different ability scores"
    ]
  },
  "acrobatic": {
    name: "Acrobatic",
    description: "You are nimble and agile, able to move with grace and precision.",
    prerequisites: [{ abilityScore: "dexterity", minimum: 12 }],
    benefits: [
      "+1 Dexterity (maximum of 20)",
      "You gain proficiency in the Acrobatics skill if you don't already have it"
    ]
  },
  "alert": {
    name: "Alert",
    description: "Always on the lookout for danger, you have keen senses and a quick reaction time.",
    benefits: [
      "+5 feet to your initiative modifier",
      "You can't be surprised while you are conscious",
      "Hidden creatures don't gain advantage on attack rolls against you"
    ]
  },
  "athletic": {
    name: "Athletic",
    description: "You have trained hard all your life to be as strong and fit as possible.",
    prerequisites: [{ abilityScore: "strength", minimum: 12 }],
    benefits: [
      "+1 Strength (maximum of 20)",
      "When you make a running start, you can jump farther than normal"
    ]
  },
  "brave": {
    name: "Brave",
    description: "You have trained yourself to overcome fear and stand firm against terror.",
    benefits: [
      "You gain advantage on saving throws against being frightened"
    ]
  },
  "crossbow_expert": {
    name: "Crossbow Expert",
    description: "Thanks to extensive practice with the crossbow, you have gained proficiency with it that allows you to fight effectively with it in close quarters.",
    benefits: [
      "You ignore the loading property of crossbows with the crossbow expert feat",
      "Being within 5 feet of a hostile creature doesn't impose disadvantage on your ranged attack rolls",
      "When you use the Attack action and attack with a one-handed weapon, you can use a bonus action to attack with a hand crossbow"
    ]
  },
  "dungeon_delver": {
    name: "Dungeon Delver",
    description: "You are accustomed to delving into dangerous dungeons and have learned skills that help you survive in such environments.",
    benefits: [
      "Advantage on Intelligence checks made to recall information about dungeons",
      "You can hold your breath for 15 minutes",
      "Darkvision extends an additional 30 feet"
    ]
  },
  "durable": {
    name: "Durable",
    description: "You have trained yourself to push on through pain and injury.",
    prerequisites: [{ abilityScore: "constitution", minimum: 12 }],
    benefits: [
      "+1 Constitution (maximum of 20)",
      "Your hit point maximum increases by 1, and it increases by 1 every time you gain a level"
    ]
  },
  "grappler": {
    name: "Grappler",
    description: "You are good at grabbing and holding onto your foes.",
    prerequisites: [{ abilityScore: "strength", minimum: 13 }],
    benefits: [
      "You have advantage on attack rolls against a grappled creature if the attacker is also grappling the target"
    ]
  },
  "heavy_armor_master": {
    name: "Heavy Armor Master",
    description: "You can use your armor to deflect strikes that would kill an ordinary person.",
    prerequisites: [{ abilityScore: "strength", minimum: 13 }],
    benefits: [
      "+1 Strength (maximum of 20)",
      "When you are wearing heavy armor, bludgeoning, piercing, and slashing damage that you take from nonmagical weapons is reduced by 3"
    ]
  },
  "insightful": {
    name: "Insightful",
    description: "You have trained yourself to read people's intentions and pick up on subtle social cues.",
    prerequisites: [{ abilityScore: "wisdom", minimum: 12 }],
    benefits: [
      "+1 Wisdom (maximum of 20)",
      "You gain proficiency in the Insight skill if you don't already have it"
    ]
  },
  "intimidating": {
    name: "Intimidating",
    description: "You are skilled at making others fear you and do your bidding.",
    prerequisites: [{ abilityScore: "charisma", minimum: 12 }],
    benefits: [
      "+1 Charisma (maximum of 20)",
      "You gain proficiency in the Intimidation skill if you don't already have it"
    ]
  },
  "keen_sighted": {
    name: "Keen-Sighted",
    description: "Your eyes are sharp, and you can see things that others might miss.",
    prerequisites: [{ abilityScore: "wisdom", minimum: 12 }],
    benefits: [
      "+1 Wisdom (maximum of 20)",
      "You gain proficiency in the Perception skill if you don't already have it"
    ]
  },
  "lucky": {
    name: "Lucky",
    description: "You have inexplicable luck that seems to kick in at just the right moment.",
    benefits: [
      "When you roll a d20 for an attack roll, ability check, or saving throw, you can reroll the die and use either result",
      "When another creature makes an attack roll against you, you can use your reaction to force them to reroll the attack roll",
      "When another creature makes an ability check, you can use your reaction to force them to reroll the ability check"
    ]
  },
  "mage_hands": {
    name: "Mage Hand Legerdemain",
    description: "You have learned to do tricks with the Mage Hand spell that others don't expect.",
    prerequisites: [{ abilityScore: "intelligence", minimum: 12 }],
    benefits: [
      "When you cast Mage Hand, you can make two objects as part of the same action",
      "You can perform one of the following additional tasks with your Mage Hand: pick up a tiny object, stow an object in your pack, retrieve an object in your pack, or manipulate an object"
    ]
  },
  "metamagic_adept": {
    name: "Metamagic Adept",
    description: "You have learned how to use sorcery points to fuel your spells with subtle effects.",
    prerequisites: [{ abilityScore: "charisma", minimum: 13 }],
    benefits: [
      "You gain 2 sorcery points, which you can spend on Metamagic options when you cast a spell",
      "You learn two Metamagic options from the sorcerer class"
    ]
  },
  "mobile": {
    name: "Mobile",
    description: "You are so fast that even though others might be able to hit you, they can't keep up with you.",
    benefits: [
      "+5 feet to your speed",
      "When you make a melee attack against a creature, you don't provoke opportunity attacks from that creature for the rest of the turn",
      "If you move at least 10 feet away from a hostile creature before making an attack with a ranged weapon, you can add your Dexterity modifier to the damage roll"
    ]
  },
  "mountaineer": {
    name: "Mountaineer",
    description: "You are accustomed to traveling in difficult terrain and have learned skills that help you navigate such environments.",
    benefits: [
      "+1 Constitution (maximum of 20)",
      "When you make a Strength saving throw, you can add your proficiency bonus if you aren't wearing heavy armor",
      "Difficult terrain costs you no extra movement when you're climbing, crawling, or swimming"
    ]
  },
  "observant": {
    name: "Observant",
    description: "You pay close attention to details and have a keen eye for spotting hidden things.",
    prerequisites: [{ abilityScore: "wisdom", minimum: 13 }],
    benefits: [
      "+1 Intelligence or Wisdom (maximum of 20)",
      "If you can see a creature's mouth while it is speaking a language you understand, you can interpret what it's saying through lip reading"
    ]
  },
  "polearm_master": {
    name: "Polearm Master",
    description: "You can keep your enemies at bay with reach weapons and strike back when they attempt to attack you.",
    prerequisites: [{ abilityScore: "strength", minimum: 13 }],
    benefits: [
      "When you take the Attack action and attack with only a glaive, halberd, quarterstaff, or spear, you can use a bonus action to make a melee attack with the opposite end of the weapon",
      "When a creature within 5 feet of you makes a melee attack against you, you can use your reaction to make a melee weapon attack against that creature"
    ]
  },
  "resilient": {
    name: "Resilient",
    description: "You have practiced and trained your mind and body to be more resilient.",
    prerequisites: [{ abilityScore: "constitution", minimum: 12 }],
    benefits: [
      "+1 Constitution (maximum of 20)",
      "You gain proficiency in Constitution saving throws"
    ]
  },
  "ritual_caster": {
    name: "Ritual Caster",
    description: "You have learned a number of spells that you can cast as rituals.",
    benefits: [
      "Choose one class from the bard, cleric, druid, sorcerer, warlock, or wizard spell lists. You learn two cantrips and three 1st-level spells from that class's spell list",
      "You can cast these spells as rituals if they have the ritual tag"
    ]
  },
  "sarcastic": {
    name: "Sarcastic",
    description: "Your quick wit and sharp tongue make you a formidable debater.",
    prerequisites: [{ abilityScore: "charisma", minimum: 12 }],
    benefits: [
      "+1 Charisma (maximum of 20)",
      "You gain proficiency in the Deception skill if you don't already have it"
    ]
  },
  "sharpshooter": {
    name: "Sharpshooter",
    description: "You are a master at hitting your targets, even under difficult circumstances.",
    benefits: [
      "+1 Dexterity (maximum of 20)",
      "Attacking from hiding doesn't impose disadvantage on attack rolls",
      "Your ranged weapon attacks ignore half cover and three-quarters cover"
    ]
  },
  "skulker": {
    name: "Skulker",
    description: "You are skilled at moving stealthily through the shadows.",
    prerequisites: [{ abilityScore: "dexterity", minimum: 13 }],
    benefits: [
      "+1 Dexterity (maximum of 20)",
      "When you are hidden from a creature and miss it with a ranged weapon attack, making the attack doesn't reveal your position"
    ]
  },
  "spell_sniper": {
    name: "Spell Sniper",
    description: "You have learned techniques to enhance your attacks with certain kinds of spells.",
    prerequisites: [{ abilityScore: "intelligence", minimum: 13 }],
    benefits: [
      "+1 Intelligence (maximum of 20)",
      "Your ranged spell attacks ignore half cover and three-quarters cover",
      "You learn one cantrip that requires an attack roll"
    ]
  },
  "strong_back": {
    name: "Strong Back",
    description: "You have the strength to carry more than most people.",
    prerequisites: [{ abilityScore: "strength", minimum: 13 }],
    benefits: [
      "+1 Strength (maximum of 20)",
      "When you wear armor, your carrying capacity increases by 15 pounds"
    ]
  },
  "tavern_fighter": {
    name: "Tavern Brawler",
    description: "You are skilled at using whatever weapons are available and fighting in close quarters.",
    prerequisites: [{ abilityScore: "strength", minimum: 13 }],
    benefits: [
      "+1 Strength (maximum of 20)",
      "You gain proficiency with improvised weapons",
      "When you make an unarmed strike, you can use a d4 instead of the normal damage die"
    ]
  },
  "tough": {
    name: "Tough",
    description: "You have more hit points than most people.",
    benefits: [
      "+1 Constitution (maximum of 20)",
      "Your hit point maximum increases by 2 per level"
    ]
  },
  "war_caster": {
    name: "War Caster",
    description: "You have practiced casting spells in the midst of combat, learning techniques that grant you the following benefits.",
    prerequisites: [{ abilityScore: "intelligence", minimum: 13 }],
    benefits: [
      "You have advantage on Constitution saving throws that you make to maintain your concentration on a spell when you take damage",
      "You can perform the somatic components of spells even when you have weapons or a shield in one or both hands",
      "When a hostile creature's movement provokes an opportunity attack from you, you can use your reaction to cast a spell at the creature"
    ]
  }
};
