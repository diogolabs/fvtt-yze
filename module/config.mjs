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
    none: { label: "YZE.StepDie.none", letter: "—", faces: 0, deno: "" },
    d6: { label: "YZE.StepDie.d6", letter: "D", faces: 6, deno: "6" },
    d8: { label: "YZE.StepDie.d8", letter: "C", faces: 8, deno: "8" },
    d10: { label: "YZE.StepDie.d10", letter: "B", faces: 10, deno: "10" },
    d12: { label: "YZE.StepDie.d12", letter: "A", faces: 12, deno: "12" },
  },

  attributeStepChoices: {
    d6: "YZE.StepAttr.d6",
    d8: "YZE.StepAttr.d8",
    d10: "YZE.StepAttr.d10",
    d12: "YZE.StepAttr.d12",
  },

  skillStepChoices: {
    none: "YZE.StepSkill.none",
    d6: "YZE.StepSkill.d6",
    d8: "YZE.StepSkill.d8",
    d10: "YZE.StepSkill.d10",
    d12: "YZE.StepSkill.d12",
  },

  artifactDiceChoices: {
    "": "YZE.ArtifactChoice.none",
    d8: "YZE.ArtifactChoice.d8",
    d10: "YZE.ArtifactChoice.d10",
    d12: "YZE.ArtifactChoice.d12",
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
    { id: "r6", min: 1, max: 6, titleKey: "YZE.Tables.Panic.r6.title", effectKey: "YZE.Tables.Panic.r6.effect" },
    { id: "r7", min: 7, max: 7, titleKey: "YZE.Tables.Panic.r7.title", effectKey: "YZE.Tables.Panic.r7.effect" },
    { id: "r8", min: 8, max: 8, titleKey: "YZE.Tables.Panic.r8.title", effectKey: "YZE.Tables.Panic.r8.effect" },
    { id: "r9", min: 9, max: 9, titleKey: "YZE.Tables.Panic.r9.title", effectKey: "YZE.Tables.Panic.r9.effect" },
    { id: "r10", min: 10, max: 10, titleKey: "YZE.Tables.Panic.r10.title", effectKey: "YZE.Tables.Panic.r10.effect" },
    { id: "r11", min: 11, max: 11, titleKey: "YZE.Tables.Panic.r11.title", effectKey: "YZE.Tables.Panic.r11.effect" },
    { id: "r12", min: 12, max: 12, titleKey: "YZE.Tables.Panic.r12.title", effectKey: "YZE.Tables.Panic.r12.effect" },
    { id: "r13", min: 13, max: 13, titleKey: "YZE.Tables.Panic.r13.title", effectKey: "YZE.Tables.Panic.r13.effect" },
    { id: "r14", min: 14, max: 14, titleKey: "YZE.Tables.Panic.r14.title", effectKey: "YZE.Tables.Panic.r14.effect" },
    { id: "r15", min: 15, max: 99, titleKey: "YZE.Tables.Panic.r15.title", effectKey: "YZE.Tables.Panic.r15.effect" },
  ],

  // YZE SRD v1.0 p. 31 — Magic Mishaps (D12)
  magicMishapTable: Array.from({ length: 12 }, (_, idx) => ({
    roll: idx + 1,
    effectKey: `YZE.Tables.MagicMishap.r${idx + 1}`,
  })),

  // YZE SRD v1.0 p. 22–23 — Physical Critical Injuries (D66)
  physicalCritTable: [
    { d66: [11], key: "11", lethal: false, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [12], key: "12", lethal: false, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [13], key: "13", lethal: false, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [14], key: "14", lethal: false, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [15], key: "15", lethal: false, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [16], key: "16", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [21], key: "21", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [22], key: "22", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [23], key: "23", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [24], key: "24", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [25], key: "25", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6" },
    { d66: [26], key: "26", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [31], key: "31", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [32], key: "32", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [33], key: "33", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6" },
    { d66: [34], key: "34", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6" },
    { d66: [35], key: "35", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6" },
    { d66: [36], key: "36", lethal: false, timeLimit: "none", mod: 0, healingTime: "2D6" },
    { d66: [41], key: "41", lethal: false, timeLimit: "none", mod: 0, healingTime: "3D6" },
    { d66: [42], key: "42", lethal: false, timeLimit: "none", mod: 0, healingTime: "3D6" },
    { d66: [43], key: "43", lethal: false, timeLimit: "none", mod: 0, healingTime: "D6" },
    { d66: [44], key: "44", lethal: true, timeLimit: "shift", mod: 0, healingTime: "D6" },
    { d66: [45], key: "45", lethal: true, timeLimit: "shift", mod: 0, healingTime: "2D6" },
    { d66: [46], key: "46", lethal: true, timeLimit: "shift", mod: 0, healingTime: "2D6" },
    { d66: [51], key: "51", lethal: true, timeLimit: "day", mod: 0, healingTime: "D6" },
    { d66: [52], key: "52", lethal: true, timeLimit: "stretch", mod: -1, healingTime: "D6" },
    { d66: [53], key: "53", lethal: true, timeLimit: "stretch", mod: -1, healingTime: "D6" },
    { d66: [54], key: "54", lethal: true, timeLimit: "shift", mod: -1, healingTime: "YZE.Permanent" },
    { d66: [55], key: "55", lethal: true, timeLimit: "shift", mod: -1, healingTime: "YZE.Permanent" },
    { d66: [56], key: "56", lethal: false, timeLimit: "none", mod: 0, healingTime: "3D6" },
    { d66: [61], key: "61", lethal: true, timeLimit: "round", mod: -1, healingTime: "2D6" },
    { d66: [62], key: "62", lethal: true, timeLimit: "round", mod: -2, healingTime: "3D6" },
    { d66: [63], key: "63", lethal: true, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [64], key: "64", lethal: true, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [65], key: "65", lethal: true, timeLimit: "none", mod: 0, healingTime: "—" },
    { d66: [66], key: "66", lethal: true, timeLimit: "none", mod: 0, healingTime: "—" },
  ],

  // YZE SRD v1.0 p. 23–24 — Mental Critical Injuries (D66)
  mentalCritTable: [
    { d66: [11, 12, 13, 14, 15, 16], key: "11", healingTime: "D6" },
    { d66: [21], key: "21", healingTime: "YZE.Permanent" },
    { d66: [22, 23, 24], key: "22", healingTime: "D6" },
    { d66: [25, 26, 31], key: "25", healingTime: "D6" },
    { d66: [32, 33, 34, 35], key: "32", healingTime: "D6" },
    { d66: [36, 41], key: "36", healingTime: "2D6" },
    { d66: [42, 43], key: "42", healingTime: "2D6" },
    { d66: [44, 45], key: "44", healingTime: "3D6" },
    { d66: [46, 51], key: "46", healingTime: "2D6" },
    { d66: [52], key: "52", healingTime: "2D6" },
    { d66: [53, 54], key: "53", healingTime: "2D6" },
    { d66: [55], key: "55", healingTime: "3D6" },
    { d66: [56], key: "56", healingTime: "3D6" },
    { d66: [61, 62], key: "61", healingTime: "YZE.Permanent" },
    { d66: [63], key: "63", healingTime: "D6" },
    { d66: [64, 65], key: "64", healingTime: "D6" },
    { d66: [66], key: "66", healingTime: "—" },
  ],

  // YZE SRD v1.0 p. 27 — Critical Vehicle Damage (D12)
  vehicleCritTable: Array.from({ length: 12 }, (_, idx) => ({
    roll: idx + 1,
    key: `r${idx + 1}`,
  })),
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
