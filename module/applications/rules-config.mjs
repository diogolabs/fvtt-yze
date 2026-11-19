import { YZE_CONFIG } from "../config.mjs";

const { HandlebarsApplicationMixin, ApplicationV2, DialogV2 } = foundry.applications.api;

/**
 * GM-only World Rules Configuration menu for Year Zero Engine (fvtt-yze).
 * Houses the core Dice Pool vs Step Dice selection with explicit balance warnings
 * and confirmation when changed on an existing world.
 */
export class YzeRulesConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "yze-rules-config",
    classes: ["yze", "yze-dialog", "yze-rules-config"],
    position: {
      width: 560,
      height: "auto",
    },
    window: {
      title: "YZE.Settings.Menu.title",
      icon: "fa-solid fa-sliders",
      resizable: false,
    },
    tag: "form",
    form: {
      handler: YzeRulesConfig.#onSubmit,
      submitOnChange: false,
      closeOnSubmit: false,
    },
  };

  static PARTS = {
    form: {
      template: "systems/fvtt-yze/templates/dialog/rules-config.hbs",
    },
  };

  _onRender(context, options) {
    super._onRender(context, options);
    const modeSelect = this.element.querySelector("[name='resolutionMode']");
    const stepRow = this.element.querySelector("[data-step-modifier-row]");
    const changedWarn = this.element.querySelector("[data-mode-changed-warning]");
    const savedMode = game.settings.get(YZE_CONFIG.ID, "resolutionMode");

    if (modeSelect) {
      const syncVisibility = () => {
        const isStep = modeSelect.value === "stepDice";
        if (stepRow) stepRow.hidden = !isStep;
        if (changedWarn) changedWarn.hidden = modeSelect.value === savedMode;
      };
      modeSelect.addEventListener("change", syncVisibility);
      syncVisibility();
    }
  }

  async _prepareContext() {
    const ID = YZE_CONFIG.ID;
    const resolutionMode = game.settings.get(ID, "resolutionMode");
    const stepModifierMode = game.settings.get(ID, "stepModifierMode");
    const damageMode = game.settings.get(ID, "damageMode");
    const pushMode = game.settings.get(ID, "pushMode");

    return {
      isGM: game.user.isGM,
      resolutionMode,
      isStepDice: resolutionMode === "stepDice",
      stepModifierMode,
      damageMode,
      pushMode,
      enableWillpower: game.settings.get(ID, "enableWillpower"),
      enableStressTrack: game.settings.get(ID, "enableStressTrack"),
      enableEncumbrance: game.settings.get(ID, "enableEncumbrance"),
      weaponsAtHandRule: game.settings.get(ID, "weaponsAtHandRule"),
      autoSeedCoreSkills: game.settings.get(ID, "autoSeedCoreSkills"),
      doomPoints: game.settings.get(ID, "doomPoints"),
      resolutionChoices: {
        dicePool: "YZE.Settings.resolutionMode.dicePool",
        stepDice: "YZE.Settings.resolutionMode.stepDice",
      },
      stepModifierChoices: {
        step: "YZE.Settings.stepModifierMode.step",
        advDisadv: "YZE.Settings.stepModifierMode.advDisadv",
      },
      damageChoices: {
        healthResolve: "YZE.Settings.damageMode.healthResolve",
        attributeDamage: "YZE.Settings.damageMode.attributeDamage",
        conditions: "YZE.Settings.damageMode.conditions",
      },
      pushChoices: {
        damageStress: "YZE.Settings.pushMode.damageStress",
        attributeDamage: "YZE.Settings.pushMode.attributeDamage",
        stressDice: "YZE.Settings.pushMode.stressDice",
        conditions: "YZE.Settings.pushMode.conditions",
        doomPoints: "YZE.Settings.pushMode.doomPoints",
      },
    };
  }

  static async #onSubmit(event, form, formData) {
    if (!game.user.isGM) {
      ui.notifications.error(game.i18n.localize("YZE.Settings.Menu.GMOnlyError"));
      return;
    }

    const ID = YZE_CONFIG.ID;
    const data = formData.object;
    const currentMode = game.settings.get(ID, "resolutionMode");
    const nextMode = data.resolutionMode === "stepDice" ? "stepDice" : "dicePool";

    if (nextMode !== currentMode) {
      const fromLabel = game.i18n.localize(`YZE.Settings.resolutionMode.${currentMode}`);
      const toLabel = game.i18n.localize(`YZE.Settings.resolutionMode.${nextMode}`);
      const confirmed = await DialogV2.confirm({
        window: {
          title: game.i18n.localize("YZE.Settings.Menu.ConfirmModeChangeTitle"),
          icon: "fa-solid fa-triangle-exclamation",
        },
        content: `<p>${game.i18n.format("YZE.Settings.Menu.ConfirmModeChangeBody", {
          from: fromLabel,
          to: toLabel,
        })}</p>`,
        modal: true,
      });
      if (!confirmed) return;
    }

    await game.settings.set(ID, "resolutionMode", nextMode);
    await game.settings.set(ID, "stepModifierMode", data.stepModifierMode || "step");
    await game.settings.set(ID, "damageMode", data.damageMode || "healthResolve");
    await game.settings.set(ID, "pushMode", data.pushMode || "damageStress");
    await game.settings.set(ID, "enableWillpower", Boolean(data.enableWillpower));
    await game.settings.set(ID, "enableStressTrack", Boolean(data.enableStressTrack));
    await game.settings.set(ID, "enableEncumbrance", Boolean(data.enableEncumbrance));
    await game.settings.set(ID, "weaponsAtHandRule", Boolean(data.weaponsAtHandRule));
    await game.settings.set(ID, "autoSeedCoreSkills", Boolean(data.autoSeedCoreSkills));
    await game.settings.set(ID, "doomPoints", Math.max(0, Number(data.doomPoints) || 0));

    ui.notifications.info(game.i18n.localize("YZE.Settings.Menu.Saved"));
    await this.close();
  }
}
