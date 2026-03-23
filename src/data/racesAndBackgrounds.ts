import type { Race, BackgroundData, Background } from "../types";

export const RACES: Record<Race, any> = {
  human: {
    name: "Human",
    description: "Humans are versatile and ambitious, found in every corner of the multiverse.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    languages: ["Common"],
    traits: [
      { name: "Extra Language", description: "You can speak, read, and write one extra language of your choice." },
      { name: "All-Rounder", description: "You gain one skill proficiency of your choice." }
    ]
  },
  dwarf: {
    name: "Dwarf",
    description: "Dwarves are sturdy and hardy, known for their craftsmanship and resilience.",
    size: "Medium",
    speed: 25,
    abilityScoreIncrease: { constitution: 2 },
    darkvision: true,
    languages: ["Common", "Dwarvish"],
    traits: [
      { name: "Dwarven Resilience", description: "You have advantage on saving throws against poison, and you have resistance to the poison damage." },
      { name: "Dwarven Combat Training", description: "You gain proficiency with the battleaxe, handaxe, light hammer, and warhammer." },
      { name: "Tool Proficiency", description: "You gain proficiency with the smith's tools, brewer's supplies, or mason's tools." },
      { name: "Stonecunning", description: "Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus." }
    ]
  },
  elf: {
    name: "Elf",
    description: "Elves are graceful and magical, with keen senses and an affinity for arcane magic.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { dexterity: 2 },
    darkvision: true,
    languages: ["Common", "Elvish"],
    traits: [
      { name: "Fey Ancestry", description: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Trance", description: "Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day." }
    ]
  },
  halfling: {
    name: "Halfling",
    description: "Halflings are small and nimble, known for their luck and agility.",
    size: "Small",
    speed: 25,
    abilityScoreIncrease: { dexterity: 2 },
    lucky: true,
    languages: ["Common", "Halfling"],
    traits: [
      { name: "Lucky", description: "When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll." },
      { name: "Brave", description: "You have advantage on saving throws against being frightened." },
      { name: "Halfling Nimbleness", description: "You can move through the space of any creature that is of a size larger than yours." }
    ]
  },
  dragonborn: {
    name: "Dragonborn",
    description: "Dragonborn are powerful and proud, with draconic ancestry and breath weapons.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 2, charisma: 1 },
    languages: ["Common", "Draconic"],
    traits: [
      { name: "Draconic Ancestry", description: "You have a draconic ancestry that determines your damage type and some of your other traits." },
      { name: "Breath Weapon", description: "You can use an action to exhale destructive energy. Your race determines the size, shape, and damage type of the exhalation." },
      { name: "Damage Resistance", description: "You have resistance to a damage type determined by your Draconic Ancestry." }
    ]
  },
  gnome: {
    name: "Gnome",
    description: "Gnomes are inventive and curious, with natural magic affinity.",
    size: "Small",
    speed: 25,
    abilityScoreIncrease: { intelligence: 2 },
    darkvision: true,
    languages: ["Common", "Gnomish"],
    traits: [
      { name: "Gnome Cunning", description: "You have advantage on Intelligence, Wisdom, and Charisma saving throws against magic." },
      { name: "Natural Illusionist", description: "You know the minor illusion cantrip. Intelligence is your spellcasting ability for it." }
    ]
  },
  "half-elf": {
    name: "Half-Elf",
    description: "Half-elves combine the best traits of humans and elves.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { charisma: 2 },
    darkvision: true,
    languages: ["Common", "Elvish"],
    traits: [
      { name: "Fey Ancestry", description: "You have advantage on saving throws against being charmed, and magic can't put you to sleep." },
      { name: "Skill Versatility", description: "You gain proficiency in two skills of your choice." }
    ]
  },
  "half-orc": {
    name: "Half-Orc",
    description: "Half-orcs are tough and fierce, combining human versatility with orcish strength.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { strength: 2, constitution: 1 },
    darkvision: true,
    languages: ["Common", "Orc"],
    traits: [
      { name: "Darkvision", description: "You can see in dim light within 60 feet of you as if it were bright light." },
      { name: "Menacing", description: "You gain proficiency in the Intimidation skill." },
      { name: "Relentless Endurance", description: "When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can't use this feature again until you finish a long rest." },
      { name: "Savage Attacks", description: "When you score a critical hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the critical hit." }
    ]
  },
  tiefling: {
    name: "Tiefling",
    description: "Tieflings have infernal heritage, with natural magic abilities.",
    size: "Medium",
    speed: 30,
    abilityScoreIncrease: { charisma: 2, intelligence: 1 },
    darkvision: true,
    languages: ["Common", "Infernal"],
    traits: [
      { name: "Hellish Resistance", description: "You have resistance to fire damage." },
      { name: "Darkvision", description: "You can see in dim light within 60 feet of you as if it were bright light." },
      { name: "Infernal Legacy", description: "You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell once with this feature and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for it." }
    ]
  }
};

export const BACKGROUNDS: Record<Background, BackgroundData> = {
  acolyte: {
    name: "Acolyte",
    description: "You have spent your life in the service of a temple to a specific god or pantheon of gods.",
    skillProficiencies: ["Insight", "Religion"],
    toolProficiencies: ["Calligrapher's supplies"],
    equipment: [
      "A holy symbol (a gift to you when you entered the priesthood)",
      "A prayer book or prayer wheel",
      "5 sticks of incense",
      "Vestments",
      "A set of common clothes",
      "A pouch containing 15 gp"
    ],
    feature: {
      name: "Shelter of the Faithful",
      description: "As an acolyte, you command the respect of those who share your faith, and you can find a place to rest and heal in most temples. While proceeding through your faith's rites and offerings, you receive free nourishment and shelter appropriate to your station and status."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I idolize a particular hero of my faith, and constantly refer to that person's deeds and example.",
        "I can find common ground between any two people, even if they are enemies.",
        "I'm inclined to use soft words and a calm tone.",
        "I don't like to lie."
      ],
      ideals: [
        "Tradition. The ancient traditions of worship and sacrifice must be preserved and upheld.",
        "Charity. I always try to help those in need, no matter what the personal cost.",
        "Change. We must help bring about the changes the gods are constantly working in the world."
      ],
      bonds: [
        "I would die to recover an ancient relic of my faith that was lost long ago.",
        "I will someday get revenge on the corrupt temple hierarchy who branded me a heretic.",
        "I owe my life to the priest who took me in when my parents died."
      ],
      flaws: [
        "I judge others harshly, and myself even more severely.",
        "I put too much trust in those who wield power within my temple's hierarchy.",
        "My piety sometimes leads me to blindly trust anyone that presents themselves as a follower of my god."
      ]
    }
  },
  criminal: {
    name: "Criminal",
    description: "You are an experienced thief with a history of breaking the law.",
    skillProficiencies: ["Deception", "Stealth"],
    toolProficiencies: ["Thieves' tools"],
    equipment: [
      "A crowbar",
      "A set of dark common clothes including a hood",
      "A pouch containing 15 gp"
    ],
    feature: {
      name: "Criminal Contact",
      description: "You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know how to get messages to and from your contact, even over great distances; specifically, you know the local messengers, corrupt caravan masters, and seedy sailors who can deliver messages for you."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I always have a plan for what to do when things go wrong.",
        "I'm always trying to figure out how much I can get away with stealing.",
        "I speak in a gruff manner, low and fast."
      ],
      ideals: [
        "Honor. I don't steal from others in the trade.",
        "Freedom. Chains are meant to be broken, as are those who would forge them.",
        "Charity. I steal from the wealthy so that I can help the poor."
      ],
      bonds: [
        "I'm trying to pay off an old debt I owe to a generous benefactor.",
        "My ill-gotten gains go to support my family.",
        "Something important was taken from me, and I aim to steal it back."
      ],
      flaws: [
        "I can't resist a pretty face.",
        "I'm always in debt.",
        "I'm a softie for the downtrodden."
      ]
    }
  },
  entertainer: {
    name: "Entertainer",
    description: "You thrive in front of an audience. You know how to entrance, delight, and amuse the people around you.",
    skillProficiencies: ["Acrobatics", "Performance"],
    toolProficiencies: ["Disguise kit", "One type of musical instrument"],
    equipment: [
      "A costume",
      "An instrument (one of your choice)",
      "A lucky charm",
      "A pouch containing 15 gp"
    ],
    feature: {
      name: "By Popular Demand",
      description: "You can always find a place to perform, usually in an inn or tavern but possibly with a circus, at a theater, or even in a noble's court. At such a place, you can get a free meal and lodging that is modest but comfortable. You probably don't stand out the most in this setting, but at least you are not bothered by authorities while performing."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I know a story relevant to almost every situation.",
        "Whenever I come up with a lie, I go along with it as best I can.",
        "Entertainment is the most important thing in life."
      ],
      ideals: [
        "Beauty. What is beautiful matters—more than anything else.",
        "Greed. I'm only in it for the money and fame.",
        "People. I like seeing the smiles on people's faces when I perform."
      ],
      bonds: [
        "I have a love-hate relationship with someone who betrayed me once.",
        "I would die to recover an heirloom of mine that was stolen from me.",
        "I want to be famous, whatever it takes."
      ],
      flaws: [
        "I talk a lot.",
        "I'm stubborn, two-headed mule.",
        "I will always point out the smartest person in any room."
      ]
    }
  },
  folk_hero: {
    name: "Folk Hero",
    description: "You come from a humble social rank but are destined for so much more.",
    skillProficiencies: ["Animal Handling", "Survival"],
    toolProficiencies: ["One type of artisan's tools", "Vehicles (land)"],
    equipment: [
      "A set of artisan's tools or a musical instrument",
      "A shovel",
      "An iron pot",
      "A set of common clothes",
      "A pouch containing 10 gp"
    ],
    feature: {
      name: "Rustic Hospitality",
      description: "Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have made enemies in a specific community."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I judge people by their actions, not their words.",
        "If someone is in trouble, I'm always ready to lend help.",
        "When I set my mind to something, I follow through no matter what gets in my way."
      ],
      ideals: [
        "Respect. People deserve to be treated with dignity and respect.",
        "Fairness. No one should get preferential treatment before the law, and no one is above the law.",
        "Freedom. Tyrants must not be allowed to oppress the masses."
      ],
      bonds: [
        "I have a family member who I love and would do anything for them.",
        "I will get revenge on the evil forces that destroyed my homeland.",
        "I swear to use my abilities to protect the common folk."
      ],
      flaws: [
        "The tyrant who rules my people will be dead, or I'll die trying.",
        "I don't trust anyone who doesn't share my hardships.",
        "I'm too curious for my own good."
      ]
    }
  },
  guild_artisan: {
    name: "Guild Artisan",
    description: "You are a member of an artisan's guild, skilled in a particular field and closely tied to a town or city.",
    skillProficiencies: ["Insight", "Persuasion"],
    toolProficiencies: ["One type of artisan's tools"],
    equipment: [
      "A set of artisan's tools (one of your choice)",
      "A letter of introduction from your guild",
      "A set of common clothes",
      "A pouch containing 15 gp"
    ],
    feature: {
      name: "Guild Member",
      description: "You are a recognized member of a guild, which means you can access its facilities and other members. You get free lodging and food at the guildhall or with other guild members unless they are on an adventure."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I'm always in debt.",
        "I speak in a gruff manner, low and fast.",
        "I'm always trying to figure out how much I can get away with stealing."
      ],
      ideals: [
        "Community. It is the duty of all civilized people to strengthen the bonds of community and the rules that hold it together.",
        "Diversity. Diversity makes the world go round.",
        "Faith. I trust in my god to guide me."
      ],
      bonds: [
        "The guild saved my life when I was young, and I will always be loyal to them.",
        "Someone close to me was killed by someone outside our guild.",
        "I want to prove myself worthy of my master's tools."
      ],
      flaws: [
        "I'm convinced that no one can handle the responsibility of running a business.",
        "I'll do anything to get what I want.",
        "I'm quick to anger."
      ]
    }
  },
  hermit: {
    name: "Hermit",
    description: "You lived in seclusion—either in a sheltered community such as a monastery, or entirely alone—for a formative part of your life.",
    skillProficiencies: ["Medicine", "Religion"],
    toolProficiencies: ["Calligrapher's supplies"],
    equipment: [
      "A scroll case stuffed full of notes from your studies and observations",
      "A winter blanket",
      "Common clothes",
      "An alms box containing 5 gp"
    ],
    feature: {
      name: "Discovery",
      description: "The seclusion of your hermitage last for at least 10 years. During that time, you uncovered a secret that has yet to be revealed to the world. Either you discovered a truth about the deities or the cosmos, buried in ruins and forgotten texts, or you hid from something that should not be found."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I've been isolated for so long that I rarely speak, preferring gestures and the occasional grunt.",
        "I am utterly serene, even in the face of disaster.",
        "The leader of my community had something wise to say on every topic, and I am eager to share that wisdom."
      ],
      ideals: [
        "Greater Good. The needs of the many outweigh the needs of the few.",
        "Beauty. Life must be enjoyed and celebrated.",
        "Logic. Emotions must not cloud our sense of what is right and true."
      ],
      bonds: [
        "My comfort in solitude was shattered when someone killed my mentor, and I seek vengeance.",
        "I am looking for something lost during my time in seclusion.",
        "I owe my life to the hermit who took me in."
      ],
      flaws: [
        "Now that I've left my secluded community, I'm overly trusting of those outside it.",
        "I see hidden meanings in everything anyone says.",
        "I am easily distracted by the promise of information."
      ]
    }
  },
  noble: {
    name: "Noble",
    description: "You understand wealth, power, and privilege. You carry a title, and your family has owned land and goods for generations.",
    skillProficiencies: ["History", "Persuasion"],
    toolProficiencies: ["One type of gaming set"],
    equipment: [
      "A signet ring",
      "A scroll of pedigree",
      "A fine set of clothes",
      "A pouch containing 25 gp"
    ],
    feature: {
      name: "Position of Privilege",
      description: "Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are. The common folk make every effort to accommodate you and avoid your displeasure."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I excel at courtly games and sports.",
        "I'm always polite and respectful.",
        "I enjoy feasting, drinking, and bantering with friends."
      ],
      ideals: [
        "Respect. Respect is due to me because of my position, but all people regardless of station deserve to be treated with dignity.",
        "Responsibility. It is my duty to respect the authority of those above me, just as those below me must respect mine.",
        "Independence. I must prove that I can handle myself without coddling from my family."
      ],
      bonds: [
        "I will face any challenge to protect my family's honor.",
        "I will do anything to prove myself worthy of the title I hold.",
        "My loyalty to my sovereign is unwavering."
      ],
      flaws: [
        "The common folk hate me, and I show it with arrogance and disdain.",
        "I'm a gambler who can't resist taking risks.",
        "I have an insatiable desire for carnal pleasures."
      ]
    }
  },
  outlander: {
    name: "Outlander",
    description: "You lived in the wilds, far from civilization and its trappings. You grew up in a tribe of nomads who roamed across the face of the land.",
    skillProficiencies: ["Athletics", "Survival"],
    toolProficiencies: [],
    equipment: [
      "A trophy from an animal you killed",
      "A souvenir from your homeland",
      "A set of common clothes",
      "A pouch containing 10 gp"
    ],
    feature: {
      name: "Wanderer",
      description: "You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I'm driven by a wanderlust that led me away from home.",
        "I watch over my friends as if they were a litter of newborn pups.",
        "I once ran 20 miles without stopping to warn my clan of an approaching orc horde. I'd do it again."
      ],
      ideals: [
        "Might. The strongest are destined to rule.",
        "Nature. The natural world is more important than the works of civilization.",
        "Tradition. The traditions of my people must be preserved and upheld."
      ],
      bonds: [
        "My clan did terrible things in the name of survival, and I will not repeat them.",
        "I have a family member who I love and would do anything for them.",
        "I swear to use my abilities to protect those weaker than myself."
      ],
      flaws: [
        "I'm too enamored with adventure.",
        "I'm slow to trust members of other races, tribes, and societies.",
        "Violence is my first answer to any problem."
      ]
    }
  },
  sage: {
    name: "Sage",
    description: "You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you.",
    skillProficiencies: ["Arcana", "History"],
    toolProficiencies: [],
    equipment: [
      "A bottle of black ink",
      "A quill",
      "A small knife",
      "A letter from a famous scholar you once studied with",
      "Common clothes",
      "A pouch containing 10 gp"
    ],
    feature: {
      name: "Researcher",
      description: "When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it. Usually, the answer comes with a cost."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I use polysyllabic words that convey the impression of great erudition.",
        "I've read every book in the world's greatest libraries—or I like to boast that I have.",
        "I'm used to helping out those who aren't as smart as I am, and I patiently explain anything and everything to others."
      ],
      ideals: [
        "Beauty. What is beautiful matters—more than anything else.",
        "Knowledge. The path to power and self-improvement lies through knowledge.",
        "Nature. The natural world is more important than the works of civilization."
      ],
      bonds: [
        "I have a family member who I love and would do anything for them.",
        "I seek to preserve a sacred text that my ancestors tried to keep hidden from evil hands.",
        "It is my duty to protect my students."
      ],
      flaws: [
        "I am easily distracted by the promise of information.",
        "I'm open-minded and accepting where others are not.",
        "I assume people are eager to share life-changing secrets with me."
      ]
    }
  },
  sailor: {
    name: "Sailor",
    description: "You know the sea as few other people do, having spent your life on a ship.",
    skillProficiencies: ["Athletics", "Perception"],
    toolProficiencies: ["Vehicles (water)"],
    equipment: [
      "A lucky charm such as a rabbit foot or a small stone carved into the shape of a star",
      "A belt pouch containing 10 gp",
      "Common clothes"
    ],
    feature: {
      name: "Ship's Passage",
      description: "You can arrange free passage on a sailing ship for yourself and your allies. You might sail on your old ship, a ship you have a stake in, or simply a ship that would be happy to have an experienced hand aboard."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I'm always trying to find the best route between two points.",
        "I'm quick to point out landmarks and navigate through unfamiliar terrain.",
        "I speak in a gruff manner, low and fast."
      ],
      ideals: [
        "Respect. Respect is due to me because of my position, but all people regardless of station deserve to be treated with dignity.",
        "Freedom. Chains are meant to be broken, as are those who would forge them.",
        "Nature. The natural world is more important than the works of civilization."
      ],
      bonds: [
        "I'm loyal to my captain and shipmates above all else.",
        "I carry a token of my loved ones back home, and I think of them whenever I see the ocean.",
        "I seek to uncover the secrets of the oceans."
      ],
      flaws: [
        "I follow orders, even if they go against my better judgment.",
        "I can't resist a pretty face.",
        "I'm stubborn and set in my ways."
      ]
    }
  },
  soldier: {
    name: "Soldier",
    description: "War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons, and learned how to survive.",
    skillProficiencies: ["Athletics", "Intimidation"],
    toolProficiencies: ["One type of gaming set", "Vehicles (land)"],
    equipment: [
      "A trophy from a fallen enemy (a dagger, broken blade, or piece of a banner)",
      "A set of common clothes",
      "A letter from your regimental commander giving you leave and commending you for service",
      "A pouch containing 10 gp"
    ],
    feature: {
      name: "Military Rank",
      description: "You have a military rank from your days as a soldier. Soldiers loyal to your former military organization still recognize your authority and will follow your commands if they are reasonable."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I'm always polite and respectful.",
        "I'm quick to point out landmarks and navigate through unfamiliar terrain.",
        "I speak in a gruff manner, low and fast."
      ],
      ideals: [
        "Greater Good. The needs of the many outweigh the needs of the few.",
        "Might. The strongest are destined to rule.",
        "Independence. I must prove that I can handle myself without coddling from my family."
      ],
      bonds: [
        "I would die for my comrades-in-arms.",
        "My regiment was destroyed by a powerful enemy, and I seek vengeance.",
        "I swear to use my abilities to protect those weaker than myself."
      ],
      flaws: [
        "The tyrant who rules my people will be dead, or I'll die trying.",
        "I'm quick to anger.",
        "I have a hard time reading social cues."
      ]
    }
  },
  urchin: {
    name: "Urchin",
    description: "You grew up on the streets alone, orphaned, and poor. You struggled to survive day by day, often resorting to theft or scamming passersby for spare change.",
    skillProficiencies: ["Sleight of Hand", "Stealth"],
    toolProficiencies: ["Disguise kit"],
    equipment: [
      "A small knife",
      "A map of your home city",
      "A pet mouse",
      "A token to remember your parents by",
      "Common clothes",
      "A pouch containing 10 gp"
    ],
    feature: {
      name: "City Secrets",
      description: "You know the secret patterns and flow to the city streets and alleys. When you are not in combat, you (and your companions) can find a safe house or other hiding place within the city that can hold up to six people for a number of days equal to your proficiency bonus."
    },
    suggestedCharacteristics: {
      personalityTraits: [
        "I live where I can, when I can. I don't like staying in one place too long.",
        "I'm always looking for the best deal.",
        "I speak in a gruff manner, low and fast."
      ],
      ideals: [
        "Fairness. No one should get preferential treatment before the law, and no one is above the law.",
        "Freedom. Chains are meant to be broken, as are those who would forge them.",
        "Charity. I steal from the wealthy so that I can help the poor."
      ],
      bonds: [
        "I stole something I shouldn't have, and I'm trying to return it.",
        "Someone close to me was killed by someone outside our guild.",
        "I want to prove myself worthy of my master's tools."
      ],
      flaws: [
        "I can't resist a pretty face.",
        "I'm always in debt.",
        "I'm a softie for the downtrodden."
      ]
    }
  }
};
