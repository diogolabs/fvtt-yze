import { YZE_CONFIG } from "../config.mjs";
import { YzeRollDialog } from "../applications/roll-dialog.mjs";
import { YzeSpellDialog } from "../applications/spell-dialog.mjs";
import {
  executeYzeRoll,
  rollCriticalTable,
  rollMagicMishap,
  rollPanic,
} from "../helpers/rolls.mjs";

export class YzeActor extends foundry.documents.Actor {
  get isBroken() {
    if (this.type === "vehicle") {
      return Boolean(this.system.wrecked) || (this.system.hull?.value ?? 1) <= 0;
    }

    let damageMode = "healthResolve";
    try {
      damageMode = game.settings.get(YZE_CONFIG.ID, "damageMode") || "healthResolve";
    } catch {
      damageMode = "healthResolve";
    }

    if (damageMode === "attributeDamage") {
      return Object.values(this.system.attributes ?? {}).some(a => (a.value ?? 1) <= 0);
    }

    if (damageMode === "conditions") {
      return (this.system.physicalConditionsCount ?? 0) >= 3 && (this.system.mentalConditionsCount ?? 0) >= 3;
    }

    return (this.system.health?.value ?? 1) <= 0 || (this.system.resolve?.value ?? 1) <= 0;
  }

  get activeResolutionMode() {
    try {
      return game.settings.get(YZE_CONFIG.ID, "resolutionMode") || "dicePool";
    } catch {
      return "dicePool";
    }
  }

  /**
   * Condition penalty for a given attribute according to YZE SRD v1.0 p. 21:
   * -1 per physical condition on Strength/Agility rolls
   * -1 per mental condition on Wits/Empathy rolls
   */
  getConditionModifier(attribute) {
    if (!attribute || !this.system.conditions) return 0;
    let mod = 0;
    if (YZE_CONFIG.physicalAttributes.includes(attribute)) {
      mod -= this.system.physicalConditionsCount || 0;
    } else if (YZE_CONFIG.mentalAttributes.includes(attribute)) {
      mod -= this.system.mentalConditionsCount || 0;
    }
    return mod;
  }

  /**
   * Finds an owned Skill item by key or localized/English name.
   */
  findSkill(nameOrKey) {
    if (!nameOrKey) return null;
    const norm = String(nameOrKey).trim().toLowerCase();
    const coreMatch = YZE_CONFIG.coreSkills.find(
      sk => sk.key.toLowerCase() === norm || game.i18n.localize(sk.nameKey).trim().toLowerCase() === norm
    );
    const targetKey = coreMatch?.key?.toLowerCase() ?? norm;
    return this.items.find(it =>
      it.type === "skill" &&
      (
        it.system.skillKey?.toLowerCase() === targetKey ||
        it.system.skillKey?.toLowerCase() === norm ||
        it.name.trim().toLowerCase() === norm
      )
    ) || null;
  }

  /**
   * Seeds the 12 Core Skills from YZE SRD v1.0 p. 8 as owned `skill` Items if not already present.
   */
  async seedCoreSkills() {
    if (!["character", "npc"].includes(this.type)) return;
    const existingKeys = new Set(
      this.items
        .filter(i => i.type === "skill")
        .map(i => (i.system.skillKey || i.name).toLowerCase())
    );

    const toCreate = [];
    for (const sk of YZE_CONFIG.coreSkills) {
      const locName = game.i18n.localize(sk.nameKey);
      if (existingKeys.has(sk.key.toLowerCase()) || existingKeys.has(locName.toLowerCase())) {
        continue;
      }
      toCreate.push({
        name: locName,
        type: "skill",
        img: "systems/fvtt-yze/assets/icons/skill.svg",
        system: {
          skillKey: sk.key,
          attribute: sk.attribute,
          level: 0,
          die: "none",
          xpMarked: false,
          description: `<p>${game.i18n.localize(`YZE.CoreSkillDesc.${sk.key}`)}</p>`,
        },
      });
    }

    if (toCreate.length > 0) {
      await this.createEmbeddedDocuments("Item", toCreate);
    }
  }

  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    const updates = {};
    const defaultIcons = {
      character: "systems/fvtt-yze/assets/icons/character.svg",
      npc: "systems/fvtt-yze/assets/icons/npc.svg",
      vehicle: "systems/fvtt-yze/assets/icons/vehicle.svg",
    };

    if (!data.img || data.img === "icons/svg/mystery-man.svg") {
      updates.img = defaultIcons[data.type] || "icons/svg/mystery-man.svg";
    }

    if (data.type === "character") {
      updates.prototypeToken = {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        sight: { enabled: true },
      };
    } else if (data.type === "vehicle") {
      updates.prototypeToken = {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      };
      if (!data.system?.vehicleType) {
        updates["system.vehicleType"] = game.i18n.localize("YZE.Vehicle.DefaultType");
      }
    }

    // Auto-seed the 12 core SRD skills on new character/npc if enabled and no skills provided
    let autoSeed = true;
    try {
      autoSeed = game.settings.get(YZE_CONFIG.ID, "autoSeedCoreSkills");
    } catch {
      autoSeed = true;
    }

    if (autoSeed && ["character", "npc"].includes(data.type) && !data.items?.some(i => i.type === "skill")) {
      const existingItems = Array.isArray(data.items) ? [...data.items] : [];
      for (const sk of YZE_CONFIG.coreSkills) {
        existingItems.push({
          name: game.i18n.localize(sk.nameKey),
          type: "skill",
          img: "systems/fvtt-yze/assets/icons/skill.svg",
          system: {
            skillKey: sk.key,
            attribute: sk.attribute,
            level: 0,
            die: "none",
            xpMarked: false,
            description: `<p>${game.i18n.localize(`YZE.CoreSkillDesc.${sk.key}`)}</p>`,
          },
        });
      }
      updates.items = existingItems;
    }

    this.updateSource(updates);
  }

  /**
   * Opens the YZE Roll Dialog for an Attribute, Skill, Weapon, Gear, or Armor roll.
   */
  async openRollDialog(options = {}, event = null) {
    const dialog = new YzeRollDialog({
      actor: this,
      ...options,
    });
    return dialog.wait(event);
  }

  /**
   * Opens the Spell Casting Dialog for a Spell item.
   */
  async openSpellDialog(spell) {
    const dialog = new YzeSpellDialog({
      actor: this,
      spell,
    });
    dialog.render(true);
    return dialog;
  }

  /**
   * Quick Armor Roll (SRD p. 20: cannot be pushed, does not count as an action).
   */
  async rollArmor(armorItem, event = null) {
    const mode = this.activeResolutionMode;
    const flavor = `${game.i18n.localize("YZE.ArmorRoll")}: ${armorItem.name}`;

    if (mode === "stepDice") {
      const die = armorItem.system.die || "d6";
      if (die === "none") {
        ui.notifications.warn(game.i18n.localize("YZE.Notifications.NoDiceToRoll"));
        return null;
      }
      // SRD p. 20: "or two base dice corresponding to the armor rating (step dice)"
      return executeYzeRoll(this, {
        resolutionMode: "stepDice",
        attrDie: die,
        skillDie: die,
        maxPush: 0,
        flavor,
        rollType: "armor",
      });
    } else {
      const rating = Number(armorItem.system.rating) || 0;
      if (rating <= 0) {
        ui.notifications.warn(game.i18n.localize("YZE.Notifications.NoDiceToRoll"));
        return null;
      }
      return executeYzeRoll(this, {
        resolutionMode: "dicePool",
        gear: armorItem,
        gearBonus: rating,
        maxPush: 0,
        flavor,
        rollType: "armor",
      });
    }
  }

  async rollPanic() {
    return rollPanic(this);
  }

  async rollMagicMishap() {
    return rollMagicMishap(this);
  }

  async rollCritical(category = "physical") {
    return rollCriticalTable(this, category, true);
  }
}
