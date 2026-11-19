import { YZE_CONFIG } from "../config.mjs";

const { api, sheets } = foundry.applications;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

export class YzeItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["yze", "sheet", "item"],
    position: {
      width: 480,
      height: 540,
    },
    window: {
      resizable: true,
    },
    form: {
      submitOnChange: true,
    },
    actions: {
      editImage: YzeItemSheet.#onEditImage,
      rollItem: YzeItemSheet.#onRollItem,
      chatItem: YzeItemSheet.#onChatItem,
    },
  };

  static PARTS = {
    sheet: {
      template: "systems/fvtt-yze/templates/item/item-sheet.hbs",
      scrollable: [".yze-item-body"],
    },
  };

  async _prepareContext(options) {
    const item = this.document;
    const enrichedDescription = item.system.description
      ? await TextEditor.enrichHTML(item.system.description, {
          secrets: item.isOwner,
          relativeTo: item,
        })
      : "";

    let resolutionMode = "dicePool";
    try {
      resolutionMode = item.actor?.activeResolutionMode
        || game.settings.get(YZE_CONFIG.ID, "resolutionMode")
        || "dicePool";
    } catch {
      resolutionMode = "dicePool";
    }

    return {
      item,
      system: item.system,
      config: YZE_CONFIG,
      editable: this.isEditable,
      owner: item.isOwner,
      resolutionMode,
      isStepDice: resolutionMode === "stepDice",
      enrichedDescription,
    };
  }

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

  static async #onRollItem(event) {
    await this.document.roll(event);
  }

  static async #onChatItem() {
    await this.document.sendToChat();
  }
}
