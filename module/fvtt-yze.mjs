import { YZE_CONFIG } from "./config.mjs";
import { registerSettings, registerStatusEffects } from "./settings.mjs";
import { YzeCharacterData, YzeNpcData, YzeVehicleData } from "./data/actors.mjs";
import {
  YzeArmorData,
  YzeCriticalData,
  YzeGearData,
  YzeSkillData,
  YzeSpecialtyData,
  YzeSpellData,
  YzeWeaponData,
} from "./data/items.mjs";
import { YzeActor } from "./documents/actor.mjs";
import { YzeItem } from "./documents/item.mjs";
import { YzeChatMessage } from "./documents/chat-message.mjs";
import { YzeChatLog } from "./applications/chat-log.mjs";
import { YzeRollDialog } from "./applications/roll-dialog.mjs";
import { YzeSpellDialog } from "./applications/spell-dialog.mjs";
import { YzeRulesConfig } from "./applications/rules-config.mjs";
import { YzeActorSheet } from "./sheets/actor-sheet.mjs";
import { YzeItemSheet } from "./sheets/item-sheet.mjs";
import { YearZeroRollManager } from "../lib/yzur.js";
import {
  executeYzeRoll,
  registerDice3D,
  rollCriticalTable,
  rollMagicMishap,
  rollPanic,
  rollSupply,
} from "./helpers/rolls.mjs";

globalThis.yze = {
  config: YZE_CONFIG,
  documents: { YzeActor, YzeItem, YzeChatMessage },
  applications: { YzeRollDialog, YzeSpellDialog, YzeRulesConfig, YzeActorSheet, YzeItemSheet },
  models: {
    YzeCharacterData,
    YzeNpcData,
    YzeVehicleData,
    YzeSkillData,
    YzeSpecialtyData,
    YzeGearData,
    YzeWeaponData,
    YzeArmorData,
    YzeSpellData,
    YzeCriticalData,
  },
  rolls: {
    executeYzeRoll,
    rollSupply,
    rollPanic,
    rollMagicMishap,
    rollCriticalTable,
  },
};

function registerHandlebarsHelpers() {
  const fallbackHelpers = {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    gt: (a, b) => Number(a) > Number(b),
    gte: (a, b) => Number(a) >= Number(b),
    lt: (a, b) => Number(a) < Number(b),
    lte: (a, b) => Number(a) <= Number(b),
    and: (...args) => args.slice(0, -1).every(Boolean),
    or: (...args) => args.slice(0, -1).some(Boolean),
    not: a => !a,
  };
  for (const [name, fn] of Object.entries(fallbackHelpers)) {
    if (!Handlebars.helpers[name]) {
      Handlebars.registerHelper(name, fn);
    }
  }

  Handlebars.registerHelper("add", (a, b) => (Number(a) || 0) + (Number(b) || 0));
  Handlebars.registerHelper("upper", str => String(str ?? "").toUpperCase());
  Handlebars.registerHelper("stepLetter", die => YZE_CONFIG.stepDice[die]?.letter ?? "—");
  Handlebars.registerHelper("stepLabel", die => {
    const key = YZE_CONFIG.stepDice[die]?.label;
    return key ? game.i18n.localize(key) : "—";
  });
}

Hooks.once("init", () => {
  console.log("fvtt-yze | Initializing Generic Year Zero Engine (YZE SRD v1.0) System");

  CONFIG.YZE = YZE_CONFIG;
  registerSettings();
  registerStatusEffects();
  registerHandlebarsHelpers();

  CONFIG.Actor.documentClass = YzeActor;
  CONFIG.Actor.dataModels = {
    character: YzeCharacterData,
    npc: YzeNpcData,
    vehicle: YzeVehicleData,
  };

  CONFIG.Item.documentClass = YzeItem;
  CONFIG.Item.dataModels = {
    skill: YzeSkillData,
    specialty: YzeSpecialtyData,
    gear: YzeGearData,
    weapon: YzeWeaponData,
    armor: YzeArmorData,
    spell: YzeSpellData,
    critical: YzeCriticalData,
  };

  CONFIG.ChatMessage.documentClass = YzeChatMessage;
  CONFIG.ui.chat = YzeChatLog;

  const DocumentSheetConfig = foundry.applications?.apps?.DocumentSheetConfig
    ?? globalThis.DocumentSheetConfig;
  const ActorDoc = foundry.documents?.Actor ?? globalThis.Actor;
  const ItemDoc = foundry.documents?.Item ?? globalThis.Item;

  // Unregister legacy V1 core sheets on Foundry v13 (v14 no longer pre-registers core V1 sheets)
  if ((game.release?.generation ?? 13) < 14) {
    const CoreActorSheet = foundry.appv1?.sheets?.ActorSheet;
    const CoreItemSheet = foundry.appv1?.sheets?.ItemSheet;
    if (CoreActorSheet) {
      DocumentSheetConfig.unregisterSheet(ActorDoc, "core", CoreActorSheet);
    }
    if (CoreItemSheet) {
      DocumentSheetConfig.unregisterSheet(ItemDoc, "core", CoreItemSheet);
    }
  }

  DocumentSheetConfig.registerSheet(ActorDoc, YZE_CONFIG.ID, YzeActorSheet, {
    types: ["character", "npc", "vehicle"],
    makeDefault: true,
    label: "YZE.Sheet.Actor",
  });

  DocumentSheetConfig.registerSheet(ItemDoc, YZE_CONFIG.ID, YzeItemSheet, {
    types: ["skill", "specialty", "gear", "weapon", "armor", "spell", "critical"],
    makeDefault: true,
    label: "YZE.Sheet.Item",
  });

  YearZeroRollManager.register("yze", {
    Roll: {
      baseTemplate: `systems/${YZE_CONFIG.ID}/templates/dice/broll.hbs`,
      chatTemplate: `systems/${YZE_CONFIG.ID}/templates/dice/roll.hbs`,
      tooltipTemplate: `systems/${YZE_CONFIG.ID}/templates/dice/tooltip.hbs`,
      infosTemplate: `systems/${YZE_CONFIG.ID}/templates/dice/infos.hbs`,
    },
  });
});

Hooks.once("diceSoNiceReady", registerDice3D);

Hooks.once("ready", () => {
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type === "Item" && data.uuid) {
      createItemMacro(data, slot);
      return false;
    }
  });
});

async function createItemMacro(data, slot) {
  const item = await Item.fromDropData(data);
  if (!item || !item.actor) {
    return ui.notifications.warn(game.i18n.localize("YZE.Notifications.MacroOwnedItemsOnly"));
  }
  const macroName = `${item.actor.name}: ${item.name}`;
  const command = `(await fromUuid("${data.uuid}"))?.roll();`;
  let macro = game.macros.find(m => m.name === macroName && m.command === command);
  if (!macro) {
    macro = await Macro.create({
      name: macroName,
      type: "script",
      img: item.img,
      command,
      flags: { "fvtt-yze.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
}
