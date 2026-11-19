export const YZE_CONFIG = {
  ID: "fvtt-yze",

  attributes: {
    strength: "YZE.Attribute.strength",
    agility: "YZE.Attribute.agility",
    wits: "YZE.Attribute.wits",
    empathy: "YZE.Attribute.empathy",
  },

  attributeAbbr: {
    strength: "YZE.AttributeAbbr.strength",
    agility: "YZE.AttributeAbbr.agility",
    wits: "YZE.AttributeAbbr.wits",
    empathy: "YZE.AttributeAbbr.empathy",
  },

  physicalAttributes: ["strength", "agility"],
  mentalAttributes: ["wits", "empathy"],

  stepDice: {
    none: { label: "—", letter: "—", faces: 0, deno: "" },
    d6: { label: "D (d6)", letter: "D", faces: 6, deno: "6" },
    d8: { label: "C (d8)", letter: "C", faces: 8, deno: "8" },
    d10: { label: "B (d10)", letter: "B", faces: 10, deno: "10" },
    d12: { label: "A (d12)", letter: "A", faces: 12, deno: "12" },
  },

  attributeStepChoices: {
    d6: "D (d6) — Feeble",
    d8: "C (d8) — Average",
    d10: "B (d10) — Capable",
    d12: "A (d12) — Extraordinary",
  },

  skillStepChoices: {
    none: "— (Unskilled)",
    d6: "D (d6) — Novice",
    d8: "C (d8) — Experienced",
    d10: "B (d10) — Veteran",
    d12: "A (d12) — Elite",
  },

  artifactDiceChoices: {
    "": "—",
    d8: "D8 (Mighty)",
    d10: "D10 (Epic)",
    d12: "D12 (Legendary)",
  },

  stepOrder: ["none", "d6", "d8", "d10", "d12"],

  // 12 Core Skills from YZE SRD v1.0 p. 8
  coreSkills: [
    { key: "force", nameKey: "YZE.CoreSkill.force", attribute: "strength" },
    { key: "melee", nameKey: "YZE.CoreSkill.melee", attribute: "strength" },
    { key: "stamina", nameKey: "YZE.CoreSkill.stamina", attribute: "strength" },
    { key: "marksmanship", nameKey: "YZE.CoreSkill.marksmanship", attribute: "agility" },
    { key: "mobility", nameKey: "YZE.CoreSkill.mobility", attribute: "agility" },
    { key: "stealth", nameKey: "YZE.CoreSkill.stealth", attribute: "agility" },
    { key: "crafting", nameKey: "YZE.CoreSkill.crafting", attribute: "wits" },
    { key: "observation", nameKey: "YZE.CoreSkill.observation", attribute: "wits" },
    { key: "survival", nameKey: "YZE.CoreSkill.survival", attribute: "wits" },
    { key: "healing", nameKey: "YZE.CoreSkill.healing", attribute: "empathy" },
    { key: "insight", nameKey: "YZE.CoreSkill.insight", attribute: "empathy" },
    { key: "persuasion", nameKey: "YZE.CoreSkill.persuasion", attribute: "empathy" },
  ],

  ranges: {
    personal: "YZE.Range.personal",
    engaged: "YZE.Range.engaged",
    short: "YZE.Range.short",
    medium: "YZE.Range.medium",
    long: "YZE.Range.long",
    extreme: "YZE.Range.extreme",
    unlimited: "YZE.Range.unlimited",
  },

  weaponGrips: {
    "1h": "YZE.Weapon.Grip.1h",
    "2h": "YZE.Weapon.Grip.2h",
    unarmed: "YZE.Weapon.Grip.unarmed",
  },

  armorParts: {
    body: "YZE.Armor.Part.body",
    helmet: "YZE.Armor.Part.helmet",
    shield: "YZE.Armor.Part.shield",
    cover: "YZE.Armor.Part.cover",
  },

  gearSubtypes: {
    gear: "YZE.Gear.Subtype.gear",
    consumable: "YZE.Gear.Subtype.consumable",
    container: "YZE.Gear.Subtype.container",
  },

  weightChoices: {
    0: "YZE.Weight.tiny",
    0.25: "YZE.Weight.quarter",
    0.5: "YZE.Weight.light",
    1: "YZE.Weight.regular",
    2: "YZE.Weight.heavy",
    3: "YZE.Weight.veryHeavy",
  },

  specialtyCategories: {
    general: "YZE.Specialty.Category.general",
    combat: "YZE.Specialty.Category.combat",
    archetype: "YZE.Specialty.Category.archetype",
    magic: "YZE.Specialty.Category.magic",
  },

  magicDisciplines: {
    general: "YZE.Magic.Discipline.general",
    awareness: "YZE.Magic.Discipline.awareness",
    healing: "YZE.Magic.Discipline.healing",
    shapeshifting: "YZE.Magic.Discipline.shapeshifting",
    bloodMagic: "YZE.Magic.Discipline.bloodMagic",
    deathMagic: "YZE.Magic.Discipline.deathMagic",
    elementalism: "YZE.Magic.Discipline.elementalism",
    symbolism: "YZE.Magic.Discipline.symbolism",
  },

  spellCastingTypes: {
    action: "YZE.Magic.CastingType.action",
    powerWord: "YZE.Magic.CastingType.powerWord",
    ritual: "YZE.Magic.CastingType.ritual",
  },

  spellDurations: {
    immediate: "YZE.Magic.Duration.immediate",
    round: "YZE.Magic.Duration.round",
    stretch: "YZE.Magic.Duration.stretch",
    shift: "YZE.Magic.Duration.shift",
    varies: "YZE.Magic.Duration.varies",
  },

  criticalCategories: {
    physical: "YZE.Critical.Category.physical",
    mental: "YZE.Critical.Category.mental",
  },

  timeLimits: {
    none: "YZE.TimeLimit.none",
    round: "YZE.TimeLimit.round",
    stretch: "YZE.TimeLimit.stretch",
    shift: "YZE.TimeLimit.shift",
    day: "YZE.TimeLimit.day",
  },

  conditions: {
    physical: [
      { id: "exhausted", label: "YZE.Condition.exhausted", type: "physical" },
      { id: "battered", label: "YZE.Condition.battered", type: "physical" },
      { id: "wounded", label: "YZE.Condition.wounded", type: "physical" },
    ],
    mental: [
      { id: "angry", label: "YZE.Condition.angry", type: "mental" },
      { id: "scared", label: "YZE.Condition.scared", type: "mental" },
      { id: "disheartened", label: "YZE.Condition.disheartened", type: "mental" },
    ],
  },

  difficulties: [
    { key: "trivial", label: "YZE.Difficulty.trivial", mod: 3 },
    { key: "simple", label: "YZE.Difficulty.simple", mod: 2 },
    { key: "easy", label: "YZE.Difficulty.easy", mod: 1 },
    { key: "average", label: "YZE.Difficulty.average", mod: 0 },
    { key: "demanding", label: "YZE.Difficulty.demanding", mod: -1 },
    { key: "hard", label: "YZE.Difficulty.hard", mod: -2 },
    { key: "formidable", label: "YZE.Difficulty.formidable", mod: -3 },
  ],

  coverPresets: [
    { key: "none", label: "YZE.Cover.none", pool: 0, step: "none" },
    { key: "furniture", label: "YZE.Cover.furniture", pool: 3, step: "d6" },
    { key: "woodenDoor", label: "YZE.Cover.woodenDoor", pool: 4, step: "d8" },
    { key: "treeTrunk", label: "YZE.Cover.treeTrunk", pool: 5, step: "d8" },
    { key: "woodenWall", label: "YZE.Cover.woodenWall", pool: 6, step: "d10" },
    { key: "stoneWall", label: "YZE.Cover.stoneWall", pool: 8, step: "d12" },
  ],

  // YZE SRD v1.0 p. 10 — Sample Panic Table (D6 + current Stress)
  panicTable: [
    { min: 1, max: 6, title: "Keeping it Together", effect: "You manage to keep your nerves in check. Barely." },
    { min: 7, max: 7, title: "Nervous Twitch", effect: "You and all PCs in Short range gain a stress point." },
    { min: 8, max: 8, title: "Tremble", effect: "You tremble uncontrollably. All skill rolls using Agility suffer a −2 modifier." },
    { min: 9, max: 9, title: "Drop Item", effect: "You drop a weapon or other important item – the GM decides which one." },
    { min: 10, max: 10, title: "Freeze", effect: "You’re frozen by fear or stress for one round, losing your next turn." },
    { min: 11, max: 11, title: "Seek Cover", effect: "You must use your next action to move away from danger and find a safe spot if possible. You lose 1 stress point, but all other PCs in Short range gain 1 stress point." },
    { min: 12, max: 12, title: "Scream", effect: "You scream for one round, losing your next turn. You lose 1 stress point, but every PC who hears your scream must make an immediate panic roll." },
    { min: 13, max: 13, title: "Flee", effect: "You must flee to a safe place and refuse to leave it. You lose 1 stress point, but every PC who hears your scream must make an immediate panic roll." },
    { min: 14, max: 14, title: "Berserk", effect: "You must immediately attack the nearest person or creature, friendly or not, until you or the target is broken. Every PC who witnesses your rampage must make an immediate panic roll." },
    { min: 15, max: 99, title: "Catatonic", effect: "You collapse to the floor and can’t talk or move, staring blankly into oblivion." },
  ],

  // YZE SRD v1.0 p. 31 — Magic Mishaps (D12)
  magicMishapTable: [
    { roll: 1, effect: "The magic makes you unable to sleep for D6 days." },
    { roll: 2, effect: "Your spell drains your energy, inflicting one point of stress." },
    { roll: 3, effect: "Your magic hurts your body and you suffer one point of damage." },
    { roll: 4, effect: "The spell triggers a magical disease with a virulence of 2D6. You and everyone within Engaged range for the next shift are exposed." },
    { roll: 5, effect: "The spell also affects a friend or other unintended victim." },
    { roll: 6, effect: "Your magic permanently alters your appearance. The GM decides how." },
    { roll: 7, effect: "The spell blinds you. You act as in total darkness for the next full day." },
    { roll: 8, effect: "The spell ravages your mind. Immediately roll for a mental critical injury." },
    { roll: 9, effect: "The force of the magic breaks bones in your body. Immediately roll for a physical critical injury." },
    { roll: 10, effect: "Your magic attracts a demon from another dimension. The demon appears within the next shift." },
    { roll: 11, effect: "The spell backfires. An offensive spell affects you instead of your intended target; a healing spell wounds instead of healing." },
    { roll: 12, effect: "Your magic rips open a rift to another dimension, and a demon pulls you over to the other side. Your character returns as an NPC after D66 days… changed." },
  ],

  // YZE SRD v1.0 p. 22–23 — Physical Critical Injuries (D66)
  physicalCritTable: [
    { d66: [11], name: "Winded", lethal: false, timeLimit: "none", mod: 0, healingTime: "—", effects: "None." },
    { d66: [12], name: "Stunned", lethal: false, timeLimit: "none", mod: 0, healingTime: "—", effects: "None." },
    { d66: [13], name: "Crippling pain", lethal: false, timeLimit: "none", mod: 0, healingTime: "—", effects: "None." },
    { d66: [14], name: "Sprained ankle", lethal: false, timeLimit: "none", mod: 0, healingTime: "—", effects: "Mobility −2 and movement is a slow action until a Healing roll is made." },
    { d66: [15], name: "Blood in eyes", lethal: false, timeLimit: "none", mod: 0, healingTime: "—", effects: "Observation and Marksmanship −2 until a Healing roll is made." },
    { d66: [16], name: "Concussion", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "Mobility −2." },
    { d66: [21], name: "Severed ear", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "Observation −2." },
    { d66: [22], name: "Broken toes", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "Movement becomes a slow action." },
    { d66: [23], name: "Broken hand", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "Hand cannot be used." },
    { d66: [24], name: "Knocked out teeth", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "Persuasion −2." },
    { d66: [25], name: "Impaled thigh", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6", effects: "Movement becomes a slow action." },
    { d66: [26], name: "Slashed shoulder", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "Arm cannot be used." },
    { d66: [31], name: "Broken nose", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "Persuasion and Observation −1." },
    { d66: [32], name: "Crotch hit", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6", effects: "One point of damage for every Mobility or Melee roll made." },
    { d66: [33], name: "Broken ribs", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6", effects: "Mobility and Observation −2." },
    { d66: [34], name: "Gouged eye", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6", effects: "Marksmanship and Observation −2." },
    { d66: [35], name: "Busted kneecap", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6", effects: "Movement becomes a slow action." },
    { d66: [36], name: "Broken arm", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6", effects: "Arm cannot be used." },
    { d66: [41], name: "Broken leg", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6", effects: "Movement becomes a slow action." },
    { d66: [42], name: "Crushed foot", lethal: false, timeLimit: "none", mod: 0, healingTime: "3D6", effects: "Movement becomes a slow action." },
    { d66: [43], name: "Crushed elbow", lethal: false, timeLimit: "none", mod: 0, healingTime: "3D6", effects: "Arm cannot be used." },
    { d66: [44], name: "Punctured lung", lethal: true, timeLimit: "shift", mod: 0, healingTime: "D6", effects: "Stamina and Mobility −2." },
    { d66: [45], name: "Bleeding gut", lethal: true, timeLimit: "shift", mod: 0, healingTime: "D6", effects: "One point of damage for every Mobility or Melee roll made." },
    { d66: [46], name: "Ruptured intestines", lethal: true, timeLimit: "shift", mod: 0, healingTime: "2D6", effects: "Disease with virulence 6." },
    { d66: [51], name: "Busted kidney", lethal: true, timeLimit: "day", mod: 0, healingTime: "2D6", effects: "Mobility −2 and movement is a slow action." },
    { d66: [52], name: "Severed arm artery", lethal: true, timeLimit: "stretch", mod: -1, healingTime: "D6", effects: "Arm cannot be used." },
    { d66: [53], name: "Severed leg artery", lethal: true, timeLimit: "stretch", mod: -1, healingTime: "D6", effects: "Movement becomes a slow action." },
    { d66: [54], name: "Severed arm", lethal: true, timeLimit: "shift", mod: -1, healingTime: "Permanent", effects: "Arm cannot be used." },
    { d66: [55], name: "Severed leg", lethal: true, timeLimit: "shift", mod: -1, healingTime: "Permanent", effects: "Movement becomes a slow action." },
    { d66: [56], name: "Cracked spine", lethal: false, timeLimit: "none", mod: 0, healingTime: "3D6", effects: "Paralyzed from the neck down. If no Healing roll is made in time, the effect is permanent." },
    { d66: [61], name: "Ruptured jugular", lethal: true, timeLimit: "round", mod: -1, healingTime: "2D6", effects: "Stamina −1." },
    { d66: [62], name: "Ruptured aorta", lethal: true, timeLimit: "round", mod: -2, healingTime: "3D6", effects: "Stamina −2." },
    { d66: [63], name: "Disemboweled", lethal: true, timeLimit: "none", mod: 0, healingTime: "—", effects: "Instant death." },
    { d66: [64], name: "Crushed skull", lethal: true, timeLimit: "none", mod: 0, healingTime: "—", effects: "Your story ends here." },
    { d66: [65], name: "Pierced head", lethal: true, timeLimit: "none", mod: 0, healingTime: "—", effects: "You die immediately." },
    { d66: [66], name: "Impaled heart", lethal: true, timeLimit: "none", mod: 0, healingTime: "—", effects: "Your heart beats for the last time." },
  ],

  // YZE SRD v1.0 p. 23–24 — Mental Critical Injuries (D66)
  mentalCritTable: [
    { d66: [11, 12, 13, 14, 15, 16], name: "Trembling", healingTime: "D6", effects: "Modifier −1 on all Agility-based rolls." },
    { d66: [21], name: "White hair", healingTime: "Permanent", effects: "None." },
    { d66: [22, 23, 24], name: "Anxious", healingTime: "D6", effects: "Modifier −1 on all Wits-based rolls." },
    { d66: [25, 26, 31], name: "Sullen", healingTime: "D6", effects: "Modifier −1 on all Empathy-based rolls." },
    { d66: [32, 33, 34, 35], name: "Nightmares", healingTime: "D6", effects: "Make an Insight roll every shift spent sleeping. Failure means the sleep doesn’t count." },
    { d66: [36, 41], name: "Nocturnal", healingTime: "2D6", effects: "You can only sleep during the light part of the day." },
    { d66: [42, 43], name: "Phobic", healingTime: "2D6", effects: "You are terrified by something related to what broke you. Suffer 1 stress/Wits damage each round within Short range." },
    { d66: [44, 45], name: "Alcoholic", healingTime: "3D6", effects: "You must drink alcohol every day, or suffer 1 stress/damage to Agility." },
    { d66: [46, 51], name: "Claustrophobic", healingTime: "2D6", effects: "Every stretch in a confined environment, you suffer 1 stress/damage to Wits." },
    { d66: [52], name: "Mythomaniac", healingTime: "2D6", effects: "You cannot stop yourself from lying about everything." },
    { d66: [53, 54], name: "Paranoia", healingTime: "2D6", effects: "You are certain that someone is out to get you." },
    { d66: [55], name: "Delusion", healingTime: "3D6", effects: "You are totally convinced of something that is totally untrue." },
    { d66: [56], name: "Hallucinations", healingTime: "3D6", effects: "Make an Insight roll every shift. If you fail, you suffer a powerful hallucination." },
    { d66: [61, 62], name: "Altered personality", healingTime: "Permanent", effects: "Your personality is altered in a fundamental way." },
    { d66: [63], name: "Amnesia", healingTime: "D6", effects: "You lose all memory, and cannot recollect who you or the other PCs are." },
    { d66: [64, 65], name: "Catatonic", healingTime: "D6", effects: "You stare blankly into oblivion, and do not respond to any stimuli." },
    { d66: [66], name: "Heart attack", healingTime: "—", effects: "Your heart stops, and you die of pure fright." },
  ],

  // YZE SRD v1.0 p. 27 — Critical Vehicle Damage (D12)
  vehicleCritTable: [
    { roll: 1, name: "Ricochet", effects: "The attack bounces off the vehicle and strikes another random target in the same zone, inflicting the same damage." },
    { roll: 2, name: "Skid", effects: "The vehicle skids severely. The driver must make an immediate skill roll (not an action) – failure loses their next turn." },
    { roll: 3, name: "Windshield Shattered", effects: "The windshield is shattered, reducing Maneuverability by one step." },
    { roll: 4, name: "Driver Hit", effects: "The driver is hit and suffers damage equal to the damage inflicted on the vehicle." },
    { roll: 5, name: "Passenger Hit", effects: "A random passenger is hit and suffers damage equal to the damage inflicted on the vehicle, plus a critical injury." },
    { roll: 6, name: "Wheel Blown", effects: "A wheel or thruster is blown out, giving a −2 modifier to all driving skill rolls." },
    { roll: 7, name: "Severe Spin", effects: "The driver must make an immediate skill roll – failure means the vehicle crashes and is automatically wrecked." },
    { roll: 8, name: "Fuel Fire", effects: "The vehicle catches fire. Everyone inside is exposed to intensity 6 (C) fire." },
    { roll: 9, name: "Weapon Disabled", effects: "A random weapon mounted on the vehicle is disabled." },
    { roll: 10, name: "Massive Crash", effects: "The vehicle careens out of control and crashes violently. Automatically wrecked; passengers suffer D6 falling damage." },
    { roll: 11, name: "Engine Disabled", effects: "The engine is disabled, and the vehicle can’t continue." },
    { roll: 12, name: "Explosion", effects: "The vehicle explodes in a ball of flame! Everyone inside is exposed to a blast power 9 (B) explosion; vehicle destroyed beyond repair." },
  ],
};

/**
 * Helper to convert a Dice Pool score (0..5) to a default Step Die ("none".."d12")
 */
export function poolToStepDie(score, isAttribute = false) {
  const n = Number(score) || 0;
  if (n <= 0) return isAttribute ? "d6" : "none";
  if (n === 1) return "d6";
  if (n === 2) return isAttribute ? "d6" : "d8";
  if (n === 3) return "d8";
  if (n === 4) return "d10";
  return "d12";
}

/**
 * Helper to get the numeric die size (6, 8, 10, 12) from a Step Die key
 */
export function stepDieSize(stepKey) {
  return YZE_CONFIG.stepDice[stepKey]?.faces ?? 0;
}
