import { YZE_CONFIG } from "../config.mjs";
import { executeSpellRoll } from "../helpers/rolls.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class YzeSpellDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor({ actor, spell }, options = {}) {
    super(options);
    this.actor = actor;
    this.spell = spell;
    this.wpSpent = 1;
    this.extraWp = 0;
    this.safeCastingReduction = 0;
    this.useGrimoire = Boolean(spell.system.inGrimoire);
    this.carvedSymbol = false;

    this.options.window.title = `${actor.name} — ${spell.name}`;
  }

  static DEFAULT_OPTIONS = {
    classes: ["yze", "yze-dialog", "yze-spell-dialog"],
    position: { width: 440 },
    window: {
      title: "Cast Spell",
      icon: "fa-solid fa-wand-sparkles",
      resizable: false,
    },
    tag: "form",
    form: {
      handler: YzeSpellDialog.#onSubmit,
      submitOnChange: false,
      closeOnSubmit: true,
    },
  };

  static PARTS = {
    form: {
      template: "systems/fvtt-yze/templates/dialog/spell-roller.hbs",
    },
  };

  _onRender(context, options) {
    super._onRender(context, options);
    this.element.querySelectorAll("select, input").forEach(el => {
      el.addEventListener("change", ev => this.#onFieldChange(ev));
    });
  }

  #onFieldChange(event) {
    const target = event.currentTarget;
    const name = target.name;
    if (name === "wpSpent") this.wpSpent = Math.max(1, Number(target.value) || 1);
    else if (name === "extraWp") this.extraWp = Math.max(0, Number(target.value) || 0);
    else if (name === "safeCastingReduction") this.safeCastingReduction = Math.max(0, Number(target.value) || 0);
    else if (name === "useGrimoire") this.useGrimoire = target.checked;
    else if (name === "carvedSymbol") this.carvedSymbol = target.checked;
    this.render();
  }

  /**
   * Finds the highest rank in the matching magic discipline specialty on the actor.
   */
  getDisciplineRank() {
    const discipline = this.spell.system.discipline;
    const magicSpecs = this.actor.items.filter(i => i.type === "specialty" && i.system.category === "magic");
    if (!magicSpecs.length) return this.spell.system.rank; // Default fallback if no specialty item created

    if (discipline === "general") {
      return Math.max(1, ...magicSpecs.map(s => Number(s.system.rank) || 1));
    }
    const match = magicSpecs.find(
      s => s.system.discipline === discipline || s.name.toLowerCase().includes(discipline.toLowerCase())
    );
    return match ? Number(match.system.rank) || 1 : 0;
  }

  async _prepareContext() {
    const spell = this.spell;
    const talentRank = this.getDisciplineRank();
    const effectiveSpellRank = Math.max(1, (Number(spell.system.rank) || 1) - (this.useGrimoire ? 1 : 0));

    // SRD p. 30: Safe Casting allows reducing dice rolled by 1 per point of difference below talentRank
    const maxSafeReduction = Math.max(0, talentRank - effectiveSpellRank);
    const safeReduction = Math.min(this.safeCastingReduction, maxSafeReduction);

    // SRD p. 30: Chance Casting (1 rank above talentRank) automatically causes a Magic Mishap
    const chanceCast = talentRank > 0 && effectiveSpellRank === talentRank + 1;
    const tooHighRank = talentRank > 0 && effectiveSpellRank > talentRank + 1;

    const totalWp = this.wpSpent + this.extraWp;
    const diceCount = Math.max(0, totalWp - safeReduction);
    const basePowerLevel = this.wpSpent + (this.carvedSymbol ? 1 : 0);

    return {
      actor: this.actor,
      spell,
      config: YZE_CONFIG,
      availableWp: this.actor.system.willpower?.value ?? 10,
      talentRank,
      effectiveSpellRank,
      maxSafeReduction,
      safeCastingReduction: safeReduction,
      chanceCast,
      tooHighRank,
      wpSpent: this.wpSpent,
      extraWp: this.extraWp,
      totalWp,
      diceCount,
      basePowerLevel,
      useGrimoire: this.useGrimoire,
      carvedSymbol: this.carvedSymbol,
      isSymbolism: spell.system.discipline === "symbolism",
    };
  }

  static async #onSubmit(event, form, formData) {
    const ctx = await this._prepareContext();
    if (ctx.tooHighRank) {
      ui.notifications.error(game.i18n.localize("YZE.Magic.RankTooHighWarning"));
      return;
    }
    await executeSpellRoll(this.actor, this.spell, {
      wpSpent: ctx.wpSpent,
      extraWp: ctx.extraWp,
      safeCastingReduction: ctx.safeCastingReduction,
      chanceCast: ctx.chanceCast,
      useGrimoire: ctx.useGrimoire,
      carvedSymbol: ctx.carvedSymbol,
    });
  }
}
