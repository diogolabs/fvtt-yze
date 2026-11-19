import { YZE_CONFIG } from "../config.mjs";
import { computeDicePool, computeStepDice, executeYzeRoll } from "../helpers/rolls.mjs";

const { HandlebarsApplicationMixin, ApplicationV2, DialogV2 } = foundry.applications.api;

export class YzeRollDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor({
    actor,
    attribute = "strength",
    skill = null,
    gear = null,
    specialty = null,
    modifier = 0,
    maxPush = undefined,
    customTitle = "",
  } = {}, options = {}) {
    super(options);
    this.actor = actor;
    this.attribute = attribute || skill?.system?.attribute || "strength";
    this.skillId = skill?.id || "";
    this.gearId = gear?.id || "";
    this.specialtyId = specialty?.id || "";
    this.difficultyMod = 0;
    this.helpDice = 0;
    this.customMod = Number(modifier) || 0;
    this.aimedShot = false;
    this.ammoDice = 0;
    this.usePride = false;
    this.passiveRoll = maxPush === 0;
    this.overrideMaxPush = maxPush;
    this.customTitle = customTitle;
    this.resolutionMode = actor?.activeResolutionMode || "dicePool";
    this.stepModifierMode = game.settings.get(YZE_CONFIG.ID, "stepModifierMode") || "step";

    this.options.window.title = customTitle || `${actor.name} — ${game.i18n.localize("YZE.RollDialog.Title")}`;
  }

  static DEFAULT_OPTIONS = {
    classes: ["yze", "yze-dialog", "yze-roll-dialog"],
    position: { width: 480 },
    window: {
      title: "Year Zero Roll",
      icon: "fa-solid fa-dice",
      resizable: false,
    },
    tag: "form",
    form: {
      handler: YzeRollDialog.#onSubmit,
      submitOnChange: false,
      closeOnSubmit: false,
    },
    actions: {
      adjustMod: YzeRollDialog.#onAdjustMod,
    },
  };

  static PARTS = {
    form: {
      template: "systems/fvtt-yze/templates/dialog/roller.hbs",
    },
  };

  get selectedSkill() {
    return this.actor.items.get(this.skillId) || null;
  }

  get selectedGear() {
    return this.actor.items.get(this.gearId) || null;
  }

  get selectedSpecialty() {
    return this.actor.items.get(this.specialtyId) || null;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const form = this.element;
    form.querySelectorAll("select, input[type='number'], input[type='checkbox']").forEach(el => {
      el.addEventListener("change", ev => this.#onFieldChange(ev));
    });
  }

  #onFieldChange(event) {
    const target = event.currentTarget;
    const name = target.name;
    if (!name) return;

    if (name === "resolutionMode") this.resolutionMode = target.value;
    else if (name === "stepModifierMode") this.stepModifierMode = target.value;
    else if (name === "attribute") this.attribute = target.value;
    else if (name === "skillId") {
      this.skillId = target.value;
      const sk = this.selectedSkill;
      if (sk?.system?.attribute) this.attribute = sk.system.attribute;
    } else if (name === "gearId") {
      this.gearId = target.value;
      this.ammoDice = 0;
    } else if (name === "specialtyId") this.specialtyId = target.value;
    else if (name === "difficultyMod") this.difficultyMod = Number(target.value) || 0;
    else if (name === "helpDice") this.helpDice = Math.clamp(Number(target.value) || 0, 0, 3);
    else if (name === "customMod") this.customMod = Number(target.value) || 0;
    else if (name === "aimedShot") this.aimedShot = target.checked;
    else if (name === "ammoDice") this.ammoDice = Math.max(0, Number(target.value) || 0);
    else if (name === "usePride") this.usePride = target.checked;
    else if (name === "passiveRoll") this.passiveRoll = target.checked;

    this.render();
  }

  static #onAdjustMod(event, target) {
    const delta = Number(target.dataset.delta) || 0;
    this.customMod += delta;
    this.render();
  }

  async _prepareContext() {
    const actor = this.actor;
    const mode = this.resolutionMode;
    const skill = this.selectedSkill;
    const gear = this.selectedGear;
    const specialty = this.selectedSpecialty;

    const attrData = actor.system.attributes?.[this.attribute] ?? { value: 3, max: 3, die: "d8", mod: 0 };
    const attrScore = Math.max(0, (Number(attrData.value) || 0) + (Number(attrData.mod) || 0));
    const attrDie = attrData.die || "d8";

    const skillScore = skill ? Number(skill.system.level) || 0 : 0;
    const skillDie = skill ? skill.system.die || "none" : "none";

    const gearBonus = gear ? Number(gear.system.bonus) || 0 : 0;
    const artifactDie = gear?.system?.artifactDie || "";

    const specialtyMod = specialty ? Number(specialty.system.modifier) || 0 : 0;
    const conditionMod = actor.getConditionModifier(this.attribute);

    // Backpack penalty: -2 on Mobility rolls when carrying a backpack (SRD p. 6)
    const isMobility = skill && (skill.system.skillKey === "mobility" || skill.name.toLowerCase() === "mobility");
    const hasBackpack = actor.system.hasBackpack || actor.items.some(i => i.type === "gear" && i.system.isBackpack && i.system.carried);
    const backpackMod = isMobility && hasBackpack ? -2 : 0;

    const aimMod = this.aimedShot ? 2 : 0;
    const totalModifier = this.difficultyMod + this.helpDice + this.customMod + specialtyMod + conditionMod + backpackMod + aimMod;

    // Stress Dice
    const enableStress = game.settings.get(YZE_CONFIG.ID, "enableStressTrack")
      || game.settings.get(YZE_CONFIG.ID, "pushMode") === "stressDice";
    const stressDice = enableStress ? Number(actor.system.stress?.value) || 0 : 0;

    // Ammo Dice limits for weapons with RoF (SRD p. 19)
    let maxAmmoDice = 0;
    if (gear?.type === "weapon" && gear.system.rof > 0) {
      maxAmmoDice = gear.system.mag?.max > 0
        ? Math.min(gear.system.rof, Math.max(0, (gear.system.mag.value || 0) - 1))
        : gear.system.rof;
    }
    const ammoDice = Math.min(this.ammoDice, maxAmmoDice);

    // Preview calculation
    let previewText = "";
    let poolPreview = { base: 0, skill: 0, gear: 0 };
    let stepPreview = [];

    if (mode === "stepDice") {
      stepPreview = computeStepDice(attrDie, skillDie, totalModifier + gearBonus, this.stepModifierMode);
      previewText = stepPreview.map(d => `${d.die.toUpperCase()} (${d.flavor})`).join(" + ");
    } else {
      poolPreview = computeDicePool(attrScore, skillScore, gearBonus, totalModifier);
      const parts = [];
      if (poolPreview.base > 0) parts.push(`${poolPreview.base} Base`);
      if (poolPreview.skill > 0) parts.push(`${poolPreview.skill} Skill`);
      if (poolPreview.gear > 0) parts.push(`${poolPreview.gear} Gear`);
      previewText = parts.join(" + ") || "0D6";
    }

    if (artifactDie) previewText += ` + ${artifactDie.toUpperCase()} (Artifact)`;
    if (stressDice > 0) previewText += ` + ${stressDice} Stress`;
    if (ammoDice > 0) previewText += ` + ${ammoDice} Ammo`;

    const skills = actor.items.filter(i => i.type === "skill").sort((a, b) => a.name.localeCompare(b.name));
    const gears = actor.items
      .filter(i => ["weapon", "gear"].includes(i.type) && i.system.carried !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
    const specialties = actor.items.filter(i => i.type === "specialty").sort((a, b) => a.name.localeCompare(b.name));

    const canUsePride = Boolean(actor.system.traits?.pride?.text) && !actor.system.traits.pride.used;

    return {
      actor,
      config: YZE_CONFIG,
      resolutionMode: mode,
      isStepDice: mode === "stepDice",
      stepModifierMode: this.stepModifierMode,
      attribute: this.attribute,
      attrScore,
      attrDie,
      skillId: this.skillId,
      skill,
      skillScore,
      skillDie,
      gearId: this.gearId,
      gear,
      gearBonus,
      artifactDie,
      specialtyId: this.specialtyId,
      specialty,
      specialtyMod,
      conditionMod,
      backpackMod,
      difficultyMod: this.difficultyMod,
      helpDice: this.helpDice,
      customMod: this.customMod,
      aimedShot: this.aimedShot,
      totalModifier,
      stressDice,
      maxAmmoDice,
      ammoDice,
      canUsePride,
      usePride: this.usePride,
      passiveRoll: this.passiveRoll,
      previewText,
      poolPreview,
      stepPreview,
      skills,
      gears,
      specialties,
    };
  }

  static async #onSubmit(event, form, formData) {
    const rollMode = event.submitter?.dataset?.rollMode || game.settings.get("core", "messageMode");
    await this._performRoll(rollMode);
  }

  async _performRoll(rollMode) {
    if (this.actor.isBroken) {
      const proceed = await DialogV2.confirm({
        window: {
          title: this.actor.name,
          icon: "fa-solid fa-heart-crack",
        },
        content: `<p>${game.i18n.format("YZE.RollDialog.ActorBrokenConfirm", { name: this.actor.name })}</p>`,
        modal: true,
      });
      if (!proceed) return null;
    }

    const ctx = await this._prepareContext();
    const attrLabel = game.i18n.localize(YZE_CONFIG.attributes[ctx.attribute] || ctx.attribute);
    const labelParts = [];
    if (this.customTitle) {
      labelParts.push(this.customTitle);
    } else {
      if (ctx.skill) labelParts.push(`${ctx.skill.name} (${attrLabel})`);
      else labelParts.push(attrLabel);
      if (ctx.gear) labelParts.push(ctx.gear.name);
      if (ctx.specialty) labelParts.push(ctx.specialty.name);
    }

    let maxPush = 1;
    if (this.passiveRoll || this.overrideMaxPush === 0) {
      maxPush = 0;
    } else if (this.overrideMaxPush !== undefined) {
      maxPush = this.overrideMaxPush;
    } else {
      const attrPush = this.actor.system.maxPushByAttribute?.[ctx.attribute] ?? 1;
      const specPush = ctx.specialty?.system?.maxPush ?? 1;
      maxPush = Math.max(attrPush, specPush);
    }

    const breakdown = [];
    if (ctx.conditionMod !== 0) breakdown.push(`${game.i18n.localize("YZE.Conditions")}: ${ctx.conditionMod}`);
    if (ctx.backpackMod !== 0) breakdown.push(`${game.i18n.localize("YZE.Backpack")}: ${ctx.backpackMod}`);
    if (ctx.specialtyMod !== 0) breakdown.push(`${ctx.specialty.name}: ${ctx.specialtyMod > 0 ? "+" : ""}${ctx.specialtyMod}`);
    if (ctx.difficultyMod !== 0) breakdown.push(`${game.i18n.localize("YZE.Difficulty.Label")}: ${ctx.difficultyMod > 0 ? "+" : ""}${ctx.difficultyMod}`);
    if (ctx.helpDice > 0) breakdown.push(`${game.i18n.localize("YZE.Help")}: +${ctx.helpDice}`);
    if (ctx.aimedShot) breakdown.push(`${game.i18n.localize("YZE.AimedShot")}: +2`);
    if (ctx.customMod !== 0) breakdown.push(`${game.i18n.localize("YZE.Modifier")}: ${ctx.customMod > 0 ? "+" : ""}${ctx.customMod}`);

    const damage = ctx.gear?.type === "weapon" ? Number(ctx.gear.system.damage) || 0 : 0;
    const critThreshold = ctx.gear?.type === "weapon" ? Number(ctx.gear.system.critThreshold) || 0 : 0;

    this.close();
    this.result = executeYzeRoll(this.actor, {
      resolutionMode: ctx.resolutionMode,
      stepModifierMode: ctx.stepModifierMode,
      attribute: ctx.attribute,
      attrScore: ctx.attrScore,
      attrDie: ctx.attrDie,
      skill: ctx.skill,
      skillScore: ctx.skillScore,
      skillDie: ctx.skillDie,
      gear: ctx.gear,
      gearBonus: ctx.gearBonus,
      artifactDie: ctx.artifactDie,
      stressDice: ctx.stressDice,
      ammoDice: ctx.ammoDice,
      modifier: ctx.totalModifier,
      maxPush,
      flavor: labelParts.join(" + "),
      damage,
      critThreshold,
      usePride: ctx.usePride,
      rollMode,
      rollType: ctx.gear?.type === "weapon" ? "attack" : "skill",
      breakdown,
    });
    return this.result;
  }

  async wait(event = null) {
    if (event?.shiftKey) {
      return this._performRoll(game.settings.get("core", "messageMode"));
    }
    return new Promise(resolve => {
      this.addEventListener("close", async () => {
        resolve(await this.result);
      }, { once: true });
      this.render(true);
    });
  }
}
