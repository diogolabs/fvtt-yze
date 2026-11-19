const fields = foundry.data.fields;

export class YzeSkillData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      skillKey: new fields.StringField({ initial: "" }),
      attribute: new fields.StringField({
        required: true,
        initial: "strength",
        choices: ["strength", "agility", "wits", "empathy"],
      }),
      level: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 10 }),
      die: new fields.StringField({
        required: true,
        initial: "none",
        choices: ["none", "d6", "d8", "d10", "d12"],
      }),
      xpMarked: new fields.BooleanField({ initial: false }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class YzeSpecialtyData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      category: new fields.StringField({
        required: true,
        initial: "general",
        choices: ["general", "combat", "archetype", "magic"],
      }),
      discipline: new fields.StringField({
        initial: "",
      }),
      tiered: new fields.BooleanField({ initial: false }),
      rank: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 5 }),
      attribute: new fields.StringField({ initial: "" }),
      associatedSkill: new fields.StringField({ initial: "" }),
      modifier: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      maxPush: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 3 }),
      willpowerCost: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      healthBonus: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      resolveBonus: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      carryBonus: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class YzeGearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      subtype: new fields.StringField({
        required: true,
        initial: "gear",
        choices: ["gear", "consumable", "container"],
      }),
      bonus: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 10 }),
      maxBonus: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 10 }),
      artifactDie: new fields.StringField({
        initial: "",
        choices: ["", "d8", "d10", "d12"],
      }),
      associatedSkill: new fields.StringField({ initial: "" }),
      quantity: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
      weight: new fields.NumberField({ required: true, initial: 1, min: 0 }),
      cost: new fields.StringField({ initial: "" }),
      carried: new fields.BooleanField({ initial: true }),
      equipped: new fields.BooleanField({ initial: false }),
      isBackpack: new fields.BooleanField({ initial: false }),
      carryBonus: new fields.NumberField({ required: true, initial: 0, min: 0 }),
      // Consumable Supply Rating (SRD p. 7)
      supplyRating: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 12 }),
      supplyDie: new fields.StringField({
        required: true,
        initial: "none",
        choices: ["none", "d6", "d8", "d10", "d12"],
      }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class YzeWeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      skill: new fields.StringField({ initial: "" }),
      attribute: new fields.StringField({
        required: true,
        initial: "strength",
        choices: ["strength", "agility", "wits", "empathy"],
      }),
      grip: new fields.StringField({
        required: true,
        initial: "1h",
        choices: ["1h", "2h", "unarmed"],
      }),
      bonus: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0, max: 10 }),
      maxBonus: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0, max: 10 }),
      artifactDie: new fields.StringField({
        initial: "",
        choices: ["", "d8", "d10", "d12"],
      }),
      damage: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
      critThreshold: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      critDie: new fields.StringField({ initial: "d66", choices: ["d66", "d12", "d6"] }),
      range: new fields.StringField({
        required: true,
        initial: "engaged",
        choices: ["personal", "engaged", "short", "medium", "long", "extreme"],
      }),
      // Ammo Dice system (SRD p. 19)
      rof: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: 10 }),
      mag: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      }),
      weight: new fields.NumberField({ required: true, initial: 1, min: 0 }),
      cost: new fields.StringField({ initial: "" }),
      carried: new fields.BooleanField({ initial: true }),
      atHand: new fields.BooleanField({ initial: true }),
      features: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class YzeArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      part: new fields.StringField({
        required: true,
        initial: "body",
        choices: ["body", "helmet", "shield", "cover"],
      }),
      rating: new fields.NumberField({ required: true, integer: true, initial: 2, min: 0, max: 20 }),
      maxRating: new fields.NumberField({ required: true, integer: true, initial: 2, min: 0, max: 20 }),
      die: new fields.StringField({
        required: true,
        initial: "d6",
        choices: ["none", "d6", "d8", "d10", "d12"],
      }),
      mobilityPenalty: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      weight: new fields.NumberField({ required: true, initial: 1, min: 0 }),
      cost: new fields.StringField({ initial: "" }),
      carried: new fields.BooleanField({ initial: true }),
      equipped: new fields.BooleanField({ initial: true }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class YzeSpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      discipline: new fields.StringField({
        required: true,
        initial: "general",
        choices: [
          "general",
          "awareness",
          "healing",
          "shapeshifting",
          "bloodMagic",
          "deathMagic",
          "elementalism",
          "symbolism",
        ],
      }),
      rank: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 5 }),
      castingType: new fields.StringField({
        required: true,
        initial: "action",
        choices: ["action", "powerWord", "ritual"],
      }),
      range: new fields.StringField({
        required: true,
        initial: "short",
        choices: ["personal", "engaged", "short", "medium", "long", "extreme", "unlimited"],
      }),
      duration: new fields.StringField({
        required: true,
        initial: "immediate",
        choices: ["immediate", "round", "stretch", "shift", "varies"],
      }),
      ingredients: new fields.StringField({ initial: "" }),
      inGrimoire: new fields.BooleanField({ initial: false }),
      causesDamage: new fields.BooleanField({ initial: false }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class YzeCriticalData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      category: new fields.StringField({
        required: true,
        initial: "physical",
        choices: ["physical", "mental"],
      }),
      d66: new fields.StringField({ initial: "" }),
      lethal: new fields.BooleanField({ initial: false }),
      stabilized: new fields.BooleanField({ initial: false }),
      timeLimit: new fields.StringField({
        required: true,
        initial: "none",
        choices: ["none", "round", "stretch", "shift", "day"],
      }),
      deathSaveModifier: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      healingTime: new fields.StringField({ initial: "" }),
      daysRemaining: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      skillModifiers: new fields.StringField({ initial: "" }),
      effectsSummary: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}
