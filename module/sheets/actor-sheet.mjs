import { YZE_CONFIG } from "../config.mjs";
import { executeYzeRoll } from "../helpers/rolls.mjs";

const { api, sheets } = foundry.applications;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

export class YzeActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["yze", "sheet", "actor"],
    position: {
      width: 780,
      height: 760,
    },
    window: {
      resizable: true,
    },
    form: {
      submitOnChange: true,
    },
    actions: {
      editImage: YzeActorSheet.#onEditImage,
      switchTab: YzeActorSheet.#onSwitchTab,
      rollAttribute: YzeActorSheet.#onRollAttribute,
      rollItem: YzeActorSheet.#onRollItem,
      chatItem: YzeActorSheet.#onChatItem,
      createItem: YzeActorSheet.#onCreateItem,
      editItem: YzeActorSheet.#onEditItem,
      deleteItem: YzeActorSheet.#onDeleteItem,
      toggleItemBool: YzeActorSheet.#onToggleItemBool,
      seedCoreSkills: YzeActorSheet.#onSeedCoreSkills,
      rollPanic: YzeActorSheet.#onRollPanic,
      rollMagicMishap: YzeActorSheet.#onRollMagicMishap,
      rollCritTable: YzeActorSheet.#onRollCritTable,
      rollCover: YzeActorSheet.#onRollCover,
      repairItem: YzeActorSheet.#onRepairItem,
      reloadWeapon: YzeActorSheet.#onReloadWeapon,
      toggleCondition: YzeActorSheet.#onToggleCondition,
      rollVehicleDrive: YzeActorSheet.#onRollVehicleDrive,
      rollVehicleRam: YzeActorSheet.#onRollVehicleRam,
      rollVehicleArmor: YzeActorSheet.#onRollVehicleArmor,
      createEffect: YzeActorSheet.#onCreateEffect,
      editEffect: YzeActorSheet.#onEditEffect,
      toggleEffect: YzeActorSheet.#onToggleEffect,
      deleteEffect: YzeActorSheet.#onDeleteEffect,
    },
  };

  static PARTS = {
    header: {
      template: "systems/fvtt-yze/templates/actor/header.hbs",
    },
    tabs: {
      template: "systems/fvtt-yze/templates/actor/tabs.hbs",
    },
    skills: {
      template: "systems/fvtt-yze/templates/actor/skills.hbs",
      scrollable: [""],
    },
    combat: {
      template: "systems/fvtt-yze/templates/actor/combat.hbs",
      scrollable: [""],
    },
    magic: {
      template: "systems/fvtt-yze/templates/actor/magic.hbs",
      scrollable: [""],
    },
    biography: {
      template: "systems/fvtt-yze/templates/actor/biography.hbs",
      scrollable: [""],
    },
    effects: {
      template: "systems/fvtt-yze/templates/actor/effects.hbs",
      scrollable: [""],
    },
    npc: {
      template: "systems/fvtt-yze/templates/actor/npc.hbs",
      scrollable: [""],
    },
    vehicle: {
      template: "systems/fvtt-yze/templates/actor/vehicle.hbs",
      scrollable: [""],
    },
  };

  #activeTab = "skills";

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (!this.options.classes.includes(this.document.type)) {
      this.options.classes.push(this.document.type);
    }

    if (this.document.type === "npc") {
      options.parts = ["npc"];
    } else if (this.document.type === "vehicle") {
      options.parts = ["vehicle"];
    } else {
      options.parts = ["header", "tabs", "skills", "combat", "magic", "biography", "effects"];
    }
  }

  _onRender(context, options) {
    super._onRender(context, options);

    // Inline edits for embedded Item properties (level, die, quantity, supplyRating, bonus, rating, mag.value)
    this.element.querySelectorAll("[data-item-field]").forEach(el => {
      el.addEventListener("change", async ev => {
        ev.stopPropagation();
        const row = ev.currentTarget.closest("[data-item-id]");
        const item = this.actor.items.get(row?.dataset?.itemId);
        if (!item) return;
        const field = ev.currentTarget.dataset.itemField;
        let value = ev.currentTarget.type === "checkbox"
          ? ev.currentTarget.checked
          : ev.currentTarget.dataset.dtype === "Number"
            ? Number(ev.currentTarget.value) || 0
            : ev.currentTarget.value;
        await item.update({ [field]: value });
      });
    });

    // Enable dragging items/skills to hotbar
    if (this.isEditable) {
      this.element.querySelectorAll("[data-item-id].draggable").forEach(el => {
        el.setAttribute("draggable", "true");
        el.addEventListener("dragstart", ev => {
          const item = this.actor.items.get(el.dataset.itemId);
          if (!item) return;
          ev.dataTransfer.setData("text/plain", JSON.stringify(item.toDragData()));
        });
      });
    }
  }

  async _prepareContext(options) {
    const actor = this.actor;
    const mode = actor.activeResolutionMode;
    const isStepDice = mode === "stepDice";

    const damageMode = game.settings.get(YZE_CONFIG.ID, "damageMode") || "healthResolve";
    const pushMode = game.settings.get(YZE_CONFIG.ID, "pushMode") || "damageStress";
    const enableWillpower = game.settings.get(YZE_CONFIG.ID, "enableWillpower");
    const enableStressTrack = game.settings.get(YZE_CONFIG.ID, "enableStressTrack") || pushMode === "stressDice";
    const enableEncumbrance = game.settings.get(YZE_CONFIG.ID, "enableEncumbrance");

    // Organize items by type
    const skills = [];
    const skillsByAttribute = {
      strength: [],
      agility: [],
      wits: [],
      empathy: [],
    };
    const specialties = [];
    const weapons = [];
    const armors = [];
    const gears = [];
    const spells = [];
    const criticals = [];

    for (const item of actor.items) {
      switch (item.type) {
        case "skill":
          skills.push(item);
          if (skillsByAttribute[item.system.attribute]) {
            skillsByAttribute[item.system.attribute].push(item);
          } else {
            skillsByAttribute.strength.push(item);
          }
          break;
        case "specialty":
          specialties.push(item);
          break;
        case "weapon":
          weapons.push(item);
          break;
        case "armor":
          armors.push(item);
          break;
        case "gear":
          gears.push(item);
          break;
        case "spell":
          spells.push(item);
          break;
        case "critical":
          criticals.push(item);
          break;
      }
    }

    const byName = (a, b) => a.name.localeCompare(b.name);
    skills.sort(byName);
    for (const k of Object.keys(skillsByAttribute)) skillsByAttribute[k].sort(byName);
    specialties.sort(byName);
    weapons.sort(byName);
    armors.sort(byName);
    gears.sort(byName);
    spells.sort((a, b) => (a.system.rank - b.system.rank) || a.name.localeCompare(b.name));
    criticals.sort(byName);

    const enrichedBiography = actor.system.biography
      ? await TextEditor.enrichHTML(actor.system.biography, {
          secrets: actor.isOwner,
          relativeTo: actor,
        })
      : "";

    const enrichedNotes = actor.system.notes
      ? await TextEditor.enrichHTML(actor.system.notes, {
          secrets: actor.isOwner,
          relativeTo: actor,
        })
      : "";

    const tabs = [
      { id: "skills", label: "YZE.Tabs.Skills", icon: "fa-solid fa-dice-d6", active: this.#activeTab === "skills" },
      { id: "combat", label: "YZE.Tabs.CombatGear", icon: "fa-solid fa-shield-halved", active: this.#activeTab === "combat" },
      { id: "magic", label: "YZE.Tabs.SpecialtiesMagic", icon: "fa-solid fa-wand-sparkles", active: this.#activeTab === "magic" },
      { id: "biography", label: "YZE.Tabs.Biography", icon: "fa-solid fa-book-open", active: this.#activeTab === "biography" },
      { id: "effects", label: "YZE.Tabs.Effects", icon: "fa-solid fa-bolt", active: this.#activeTab === "effects" },
    ];

    return {
      actor,
      system: actor.system,
      config: YZE_CONFIG,
      editable: this.isEditable,
      owner: actor.isOwner,
      isGM: game.user.isGM,
      isBroken: actor.isBroken,
      resolutionMode: mode,
      isStepDice,
      damageMode,
      pushMode,
      enableWillpower,
      enableStressTrack,
      enableEncumbrance,
      activeTab: this.#activeTab,
      tabs,
      skills,
      skillsByAttribute,
      specialties,
      weapons,
      armors,
      gears,
      spells,
      criticals,
      effects: Array.from(actor.effects),
      enrichedBiography,
      enrichedNotes,
    };
  }

  /* -------------------------------------------- */
  /*  Action Handlers                             */
  /* -------------------------------------------- */

  static async #onEditImage(event, target) {
    const attr = target.dataset.edit || "img";
    const current = foundry.utils.getProperty(this.document, attr);
    const fp = new foundry.applications.apps.FilePicker.implementation({
      type: "image",
      current,
      callback: path => this.document.update({ [attr]: path }),
    });
    return fp.browse();
  }

  static #onSwitchTab(event, target) {
    const tab = target.dataset.tab;
    if (!tab) return;
    this.#activeTab = tab;
    this.render();
  }

  static async #onRollAttribute(event, target) {
    const attribute = target.dataset.attribute;
    if (!attribute) return;
    await this.actor.openRollDialog({ attribute }, event);
  }

  static async #onRollItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset?.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    await item.roll(event);
  }

  static async #onChatItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset?.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    await item.sendToChat();
  }

  static async #onCreateItem(event, target) {
    const type = target.dataset.type || "gear";
    const attribute = target.dataset.attribute || "strength";
    const subtype = target.dataset.subtype || "gear";
    const name = `${game.i18n.localize("YZE.New")} ${game.i18n.localize(`TYPES.Item.${type}`)}`;

    const itemData = {
      name,
      type,
      system: {},
    };
    if (type === "skill") itemData.system.attribute = attribute;
    if (type === "gear") itemData.system.subtype = subtype;

    const created = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    created[0]?.sheet?.render(true);
  }

  static #onEditItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset?.itemId;
    const item = this.actor.items.get(itemId);
    item?.sheet?.render(true);
  }

  static async #onDeleteItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset?.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    await item.delete();
  }

  static async #onToggleItemBool(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset?.itemId;
    const field = target.dataset.field;
    const item = this.actor.items.get(itemId);
    if (!item || !field) return;
    const current = Boolean(foundry.utils.getProperty(item, field));
    await item.update({ [field]: !current });
  }

  static async #onSeedCoreSkills() {
    await this.actor.seedCoreSkills();
  }

  static async #onRollPanic() {
    await this.actor.rollPanic();
  }

  static async #onRollMagicMishap() {
    await this.actor.rollMagicMishap();
  }

  static async #onRollCritTable(event, target) {
    const category = target.dataset.category || "physical";
    await this.actor.rollCritical(category);
  }

  static async #onRollCover(event, target) {
    const select = this.element.querySelector("[name='coverPreset']");
    const key = select?.value || target.dataset.cover || "furniture";
    const preset = YZE_CONFIG.coverPresets.find(c => c.key === key);
    if (!preset || preset.key === "none") return;

    const mode = this.actor.activeResolutionMode;
    const flavor = `${game.i18n.localize("YZE.CoverRoll")}: ${game.i18n.localize(preset.label)}`;
    if (mode === "stepDice") {
      await executeYzeRoll(this.actor, {
        resolutionMode: "stepDice",
        attrDie: preset.step,
        skillDie: preset.step,
        maxPush: 0,
        flavor,
        rollType: "armor",
      });
    } else {
      await executeYzeRoll(this.actor, {
        resolutionMode: "dicePool",
        gearBonus: preset.pool,
        maxPush: 0,
        flavor,
        rollType: "armor",
      });
    }
  }

  static async #onRepairItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset?.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    if (item.type === "armor") {
      await item.update({ "system.rating": item.system.maxRating });
    } else if (item.system.maxBonus !== undefined) {
      await item.update({ "system.bonus": item.system.maxBonus });
    }
  }

  static async #onReloadWeapon(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset?.itemId;
    const item = this.actor.items.get(itemId);
    if (!item || item.type !== "weapon") return;
    await item.update({ "system.mag.value": item.system.mag.max });
  }

  static async #onToggleCondition(event, target) {
    const cond = target.dataset.condition;
    if (!cond || !this.actor.system.conditions) return;
    const current = Boolean(this.actor.system.conditions[cond]);
    await this.actor.update({ [`system.conditions.${cond}`]: !current });
  }

  static async #onRollVehicleDrive(event) {
    const driver = game.user.character || this.actor;
    const mode = driver.activeResolutionMode || "dicePool";
    const man = Number(this.actor.system.maneuverability) || 0;
    if (driver.type !== "vehicle") {
      const mobility = driver.findSkill("mobility") || driver.findSkill("driving");
      return driver.openRollDialog({
        attribute: "agility",
        skill: mobility,
        modifier: man,
        customTitle: `${this.actor.name} — ${game.i18n.localize("YZE.Vehicle.DriveRoll")}`,
      }, event);
    }
    return executeYzeRoll(this.actor, {
      resolutionMode: mode,
      attrScore: 3,
      attrDie: "d8",
      gear: this.actor,
      gearBonus: Math.max(0, man),
      flavor: `${this.actor.name} — ${game.i18n.localize("YZE.Vehicle.DriveRoll")}`,
    });
  }

  static async #onRollVehicleRam(event) {
    const driver = game.user.character || this.actor;
    const man = Number(this.actor.system.maneuverability) || 0;
    const dmg = this.actor.system.rammingDamage || Math.ceil((this.actor.system.hull.max || 1) / 2);
    const mode = driver.activeResolutionMode || "dicePool";
    return executeYzeRoll(driver, {
      resolutionMode: mode,
      attribute: "agility",
      attrScore: driver.system.attributes?.agility?.value ?? 3,
      attrDie: driver.system.attributes?.agility?.die ?? "d8",
      gear: this.actor,
      gearBonus: Math.max(0, man),
      damage: dmg,
      flavor: `${this.actor.name} — ${game.i18n.localize("YZE.Vehicle.RammingAttack")} (${game.i18n.localize("YZE.Damage")} ${dmg})`,
      rollType: "attack",
    });
  }

  static async #onRollVehicleArmor() {
    const mode = this.actor.activeResolutionMode || "dicePool";
    const flavor = `${this.actor.name} — ${game.i18n.localize("YZE.ArmorRoll")}`;
    if (mode === "stepDice") {
      const die = this.actor.system.armor?.die || "d6";
      if (die === "none") return;
      return executeYzeRoll(this.actor, {
        resolutionMode: "stepDice",
        attrDie: die,
        skillDie: die,
        maxPush: 0,
        flavor,
        rollType: "armor",
      });
    } else {
      const rating = Number(this.actor.system.armor?.rating) || 0;
      if (rating <= 0) return;
      return executeYzeRoll(this.actor, {
        resolutionMode: "dicePool",
        gearBonus: rating,
        maxPush: 0,
        flavor,
        rollType: "armor",
      });
    }
  }

  static async #onCreateEffect() {
    await this.actor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: game.i18n.localize("YZE.NewEffect"),
        img: "icons/svg/aura.svg",
        origin: this.actor.uuid,
      },
    ]);
  }

  static #onEditEffect(event, target) {
    const effectId = target.closest("[data-effect-id]")?.dataset?.effectId;
    const effect = this.actor.effects.get(effectId);
    effect?.sheet?.render(true);
  }

  static async #onToggleEffect(event, target) {
    const effectId = target.closest("[data-effect-id]")?.dataset?.effectId;
    const effect = this.actor.effects.get(effectId);
    if (effect) await effect.update({ disabled: !effect.disabled });
  }

  static async #onDeleteEffect(event, target) {
    const effectId = target.closest("[data-effect-id]")?.dataset?.effectId;
    const effect = this.actor.effects.get(effectId);
    if (effect) await effect.delete();
  }
}
