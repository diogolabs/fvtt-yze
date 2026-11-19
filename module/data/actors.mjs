import { YZE_CONFIG, stepDieSize } from "../config.mjs";

const fields = foundry.data.fields;

function makeAttributeSchema(initialScore = 3, initialDie = "d8") {
  return new fields.SchemaField({
    value: new fields.NumberField({ required: true, integer: true, initial: initialScore, min: 0, max: 12 }),
    max: new fields.NumberField({ required: true, integer: true, initial: initialScore, min: 1, max: 12 }),
    die: new fields.StringField({ required: true, initial: initialDie, choices: ["d6", "d8", "d10", "d12"] }),
    mod: new fields.NumberField({ required: true, integer: true, initial: 0 }),
  });
}

export class YzeCharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      archetype: new fields.StringField({ initial: "" }),
      resolutionMode: new fields.StringField({ initial: "" }), // "" = world default, "dicePool", "stepDice"
      keyAttribute: new fields.StringField({ initial: "strength", choices: ["strength", "agility", "wits", "empathy"] }),

      attributes: new fields.SchemaField({
        strength: makeAttributeSchema(3, "d8"),
        agility: makeAttributeSchema(3, "d8"),
        wits: makeAttributeSchema(3, "d8"),
        empathy: makeAttributeSchema(3, "d8"),
      }),

      health: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 4, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 4, min: 0 }),
        customMax: new fields.NumberField({ required: false, nullable: true, integer: true, initial: null, min: 0 }),
      }),

      resolve: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 4, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 4, min: 0 }),
        customMax: new fields.NumberField({ required: false, nullable: true, integer: true, initial: null, min: 0 }),
      }),

      willpower: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 10, min: 0 }),
      }),

      stress: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 10, min: 0 }),
      }),

      experience: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
        total: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      }),

      conditions: new fields.SchemaField({
        exhausted: new fields.BooleanField({ initial: false }),
        battered: new fields.BooleanField({ initial: false }),
        wounded: new fields.BooleanField({ initial: false }),
        angry: new fields.BooleanField({ initial: false }),
        scared: new fields.BooleanField({ initial: false }),
        disheartened: new fields.BooleanField({ initial: false }),
      }),

      hasBackpack: new fields.BooleanField({ initial: false }),

      traits: new fields.SchemaField({
        pride: new fields.SchemaField({
          text: new fields.StringField({ initial: "" }),
          used: new fields.BooleanField({ initial: false }),
        }),
        weakness: new fields.StringField({ initial: "" }),
        darkSecret: new fields.StringField({ initial: "" }),
        bigDream: new fields.StringField({ initial: "" }),
        buddy: new fields.StringField({ initial: "" }),
        relationships: new fields.StringField({ initial: "" }),
        appearance: new fields.StringField({ initial: "" }),
      }),

      biography: new fields.HTMLField({ initial: "" }),
      notes: new fields.HTMLField({ initial: "" }),
    };
  }

  get activeResolutionMode() {
    try {
      return game.settings.get(YZE_CONFIG.ID, "resolutionMode") || "dicePool";
    } catch {
      return "dicePool";
    }
  }

  prepareDerivedData() {
    const mode = this.activeResolutionMode;
    const items = this.parent?.items ?? [];

    // Passive bonuses from Specialties (Tough, Hardened, Pack Mule, etc.)
    let healthBonus = 0;
    let resolveBonus = 0;
    let carryBonus = 0;
    this.maxPushByAttribute = {
      strength: 1,
      agility: 1,
      wits: 1,
      empathy: 1,
    };

    for (const item of items) {
      if (item.type === "specialty") {
        const mult = item.system.tiered ? Math.max(1, item.system.rank || 1) : 1;
        healthBonus += (item.system.healthBonus || 0) * mult;
        resolveBonus += (item.system.resolveBonus || 0) * mult;
        carryBonus += (item.system.carryBonus || 0) * mult;
        if (item.system.maxPush > 1) {
          if (item.system.attribute && this.maxPushByAttribute[item.system.attribute] !== undefined) {
            this.maxPushByAttribute[item.system.attribute] = Math.max(
              this.maxPushByAttribute[item.system.attribute],
              item.system.maxPush
            );
          } else {
            for (const k of Object.keys(this.maxPushByAttribute)) {
              this.maxPushByAttribute[k] = Math.max(this.maxPushByAttribute[k], item.system.maxPush);
            }
          }
        }
      }
    }

    // Derived Health & Resolve (SRD p. 5)
    if (this.health.customMax !== null && this.health.customMax > 0) {
      this.health.max = this.health.customMax;
    } else if (mode === "stepDice") {
      const strSize = stepDieSize(this.attributes.strength.die);
      const agiSize = stepDieSize(this.attributes.agility.die);
      this.health.max = Math.ceil((strSize + agiSize) / 4) + healthBonus;
    } else {
      const str = this.attributes.strength.max;
      const agi = this.attributes.agility.max;
      this.health.max = Math.ceil((str + agi) / 2) + 1 + healthBonus;
    }

    if (this.resolve.customMax !== null && this.resolve.customMax > 0) {
      this.resolve.max = this.resolve.customMax;
    } else if (mode === "stepDice") {
      const witSize = stepDieSize(this.attributes.wits.die);
      const empSize = stepDieSize(this.attributes.empathy.die);
      this.resolve.max = Math.ceil((witSize + empSize) / 4) + resolveBonus;
    } else {
      const wit = this.attributes.wits.max;
      const emp = this.attributes.empathy.max;
      this.resolve.max = Math.ceil((wit + emp) / 2) + 1 + resolveBonus;
    }

    // Conditions count & modifiers (SRD p. 21)
    this.physicalConditionsCount =
      (this.conditions.exhausted ? 1 : 0) +
      (this.conditions.battered ? 1 : 0) +
      (this.conditions.wounded ? 1 : 0);

    this.mentalConditionsCount =
      (this.conditions.angry ? 1 : 0) +
      (this.conditions.scared ? 1 : 0) +
      (this.conditions.disheartened ? 1 : 0);

    // Encumbrance calculation (SRD p. 6)
    let baseCarry = mode === "stepDice"
      ? stepDieSize(this.attributes.strength.die)
      : this.attributes.strength.max * 2;
    let backpackBonus = this.hasBackpack ? baseCarry : 0;

    let weaponsAtHandRule = true;
    try {
      weaponsAtHandRule = game.settings.get(YZE_CONFIG.ID, "weaponsAtHandRule");
    } catch {
      weaponsAtHandRule = true;
    }

    let currentWeight = 0;
    let atHandCount = 0;

    for (const item of items) {
      if (!["weapon", "armor", "gear"].includes(item.type)) continue;
      if (!item.system.carried) continue;

      if (item.type === "gear" && item.system.isBackpack) {
        if (!this.hasBackpack) {
          backpackBonus += item.system.carryBonus > 0 ? item.system.carryBonus : baseCarry;
        }
        continue;
      }

      if (item.type === "armor" && item.system.equipped) {
        continue; // Worn armor/helmet does not count toward encumbrance (SRD p. 6)
      }

      if (item.type === "weapon" && item.system.atHand && weaponsAtHandRule && atHandCount < 3) {
        atHandCount++;
        continue; // Up to 3 weapons at hand don't count toward encumbrance (SRD p. 6)
      }

      const qty = item.system.quantity ?? 1;
      const w = Number(item.system.weight) || 0;
      currentWeight += w * qty;
    }

    const maxCarry = baseCarry + carryBonus + backpackBonus;
    this.encumbrance = {
      value: Math.round(currentWeight * 100) / 100,
      max: maxCarry,
      baseMax: baseCarry + carryBonus,
      overloaded: currentWeight > maxCarry,
      atHandCount,
      percentage: maxCarry > 0 ? Math.min(100, Math.round((currentWeight / maxCarry) * 100)) : 0,
    };
  }
}

export class YzeNpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      role: new fields.StringField({ initial: "" }),
      resolutionMode: new fields.StringField({ initial: "" }),

      attributes: new fields.SchemaField({
        strength: makeAttributeSchema(3, "d8"),
        agility: makeAttributeSchema(3, "d8"),
        wits: makeAttributeSchema(3, "d8"),
        empathy: makeAttributeSchema(3, "d8"),
      }),

      health: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 3, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 3, min: 0 }),
        customMax: new fields.NumberField({ required: false, nullable: true, integer: true, initial: 3, min: 0 }),
      }),

      resolve: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 3, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 3, min: 0 }),
        customMax: new fields.NumberField({ required: false, nullable: true, integer: true, initial: 3, min: 0 }),
      }),

      conditions: new fields.SchemaField({
        exhausted: new fields.BooleanField({ initial: false }),
        battered: new fields.BooleanField({ initial: false }),
        wounded: new fields.BooleanField({ initial: false }),
        angry: new fields.BooleanField({ initial: false }),
        scared: new fields.BooleanField({ initial: false }),
        disheartened: new fields.BooleanField({ initial: false }),
      }),

      notes: new fields.HTMLField({ initial: "" }),
    };
  }

  get activeResolutionMode() {
    try {
      return game.settings.get(YZE_CONFIG.ID, "resolutionMode") || "dicePool";
    } catch {
      return "dicePool";
    }
  }

  prepareDerivedData() {
    const mode = this.activeResolutionMode;
    if (this.health.customMax !== null && this.health.customMax > 0) {
      this.health.max = this.health.customMax;
    } else if (mode === "stepDice") {
      this.health.max = Math.ceil(
        (stepDieSize(this.attributes.strength.die) + stepDieSize(this.attributes.agility.die)) / 4
      );
    } else {
      this.health.max = Math.ceil((this.attributes.strength.max + this.attributes.agility.max) / 2) + 1;
    }

    if (this.resolve.customMax !== null && this.resolve.customMax > 0) {
      this.resolve.max = this.resolve.customMax;
    } else if (mode === "stepDice") {
      this.resolve.max = Math.ceil(
        (stepDieSize(this.attributes.wits.die) + stepDieSize(this.attributes.empathy.die)) / 4
      );
    } else {
      this.resolve.max = Math.ceil((this.attributes.wits.max + this.attributes.empathy.max) / 2) + 1;
    }

    this.physicalConditionsCount =
      (this.conditions.exhausted ? 1 : 0) +
      (this.conditions.battered ? 1 : 0) +
      (this.conditions.wounded ? 1 : 0);

    this.mentalConditionsCount =
      (this.conditions.angry ? 1 : 0) +
      (this.conditions.scared ? 1 : 0) +
      (this.conditions.disheartened ? 1 : 0);

    this.maxPushByAttribute = {
      strength: 1,
      agility: 1,
      wits: 1,
      empathy: 1,
    };
  }
}

export class YzeVehicleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      vehicleType: new fields.StringField({ initial: "" }),
      passengers: new fields.NumberField({ required: true, integer: true, initial: 4, min: 0 }),
      maneuverability: new fields.NumberField({ required: true, integer: true, initial: 1 }),
      maxManeuverability: new fields.NumberField({ required: true, integer: true, initial: 1 }),

      hull: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 4, min: 0 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 4, min: 1 }),
      }),

      armor: new fields.SchemaField({
        rating: new fields.NumberField({ required: true, integer: true, initial: 3, min: 0 }),
        maxRating: new fields.NumberField({ required: true, integer: true, initial: 3, min: 0 }),
        die: new fields.StringField({ required: true, initial: "d6", choices: ["none", "d6", "d8", "d10", "d12"] }),
      }),

      speed: new fields.SchemaField({
        onRoad: new fields.NumberField({ required: true, integer: true, initial: 10, min: 0 }),
        offRoad: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),
      }),

      fuel: new fields.SchemaField({
        value: new fields.NumberField({ required: true, initial: 50, min: 0 }),
        max: new fields.NumberField({ required: true, initial: 50, min: 0 }),
        consumption: new fields.NumberField({ required: true, initial: 1, min: 0 }),
      }),

      cargoCapacity: new fields.NumberField({ required: true, initial: 20, min: 0 }),
      altitude: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      wrecked: new fields.BooleanField({ initial: false }),
      notes: new fields.HTMLField({ initial: "" }),
    };
  }

  prepareDerivedData() {
    this.rammingDamage = Math.ceil((this.hull.max || 1) / 2);
    let cargoUsed = 0;
    for (const item of this.parent?.items ?? []) {
      if (["weapon", "armor", "gear"].includes(item.type)) {
        cargoUsed += (Number(item.system.weight) || 0) * (item.system.quantity ?? 1);
      }
    }
    this.cargoUsed = Math.round(cargoUsed * 100) / 100;
  }
}
