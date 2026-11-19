import { YZE_CONFIG } from "./config.mjs";
import { YzeRulesConfig } from "./applications/rules-config.mjs";

function refreshOpenSheets() {
  for (const actor of game.actors ?? []) {
    actor.reset();
    actor.sheet?.render();
  }
  for (const item of game.items ?? []) {
    item.sheet?.render();
  }
}

export function registerSettings() {
  const ID = YZE_CONFIG.ID;

  // Dedicated GM-only YZE Rules Configuration menu
  game.settings.registerMenu(ID, "rulesConfig", {
    name: "YZE.Settings.Menu.name",
    label: "YZE.Settings.Menu.label",
    hint: "YZE.Settings.Menu.hint",
    icon: "fa-solid fa-sliders",
    type: YzeRulesConfig,
    restricted: true,
  });

  // 1. Dice Pool vs Step Dice (world-only, managed exclusively via GM Rules Config menu)
  game.settings.register(ID, "resolutionMode", {
    name: "YZE.Settings.resolutionMode.name",
    hint: "YZE.Settings.resolutionMode.hint",
    scope: "world",
    config: false,
    type: String,
    choices: {
      dicePool: "YZE.Settings.resolutionMode.dicePool",
      stepDice: "YZE.Settings.resolutionMode.stepDice",
    },
    default: "dicePool",
    onChange: refreshOpenSheets,
  });

  // 2. Step Dice Modifier Style: Standard Step Up/Down vs Advantage/Disadvantage (SRD p. 10-11)
  game.settings.register(ID, "stepModifierMode", {
    name: "YZE.Settings.stepModifierMode.name",
    hint: "YZE.Settings.stepModifierMode.hint",
    scope: "world",
    config: false,
    type: String,
    choices: {
      step: "YZE.Settings.stepModifierMode.step",
      advDisadv: "YZE.Settings.stepModifierMode.advDisadv",
    },
    default: "step",
  });

  // 3. Damage & Trauma System (SRD p. 5 & 20-21)
  game.settings.register(ID, "damageMode", {
    name: "YZE.Settings.damageMode.name",
    hint: "YZE.Settings.damageMode.hint",
    scope: "world",
    config: false,
    type: String,
    choices: {
      healthResolve: "YZE.Settings.damageMode.healthResolve",
      attributeDamage: "YZE.Settings.damageMode.attributeDamage",
      conditions: "YZE.Settings.damageMode.conditions",
    },
    default: "healthResolve",
    onChange: refreshOpenSheets,
  });

  // 4. Cost of Pushing (SRD p. 9)
  game.settings.register(ID, "pushMode", {
    name: "YZE.Settings.pushMode.name",
    hint: "YZE.Settings.pushMode.hint",
    scope: "world",
    config: false,
    type: String,
    choices: {
      damageStress: "YZE.Settings.pushMode.damageStress",
      attributeDamage: "YZE.Settings.pushMode.attributeDamage",
      stressDice: "YZE.Settings.pushMode.stressDice",
      conditions: "YZE.Settings.pushMode.conditions",
      doomPoints: "YZE.Settings.pushMode.doomPoints",
    },
    default: "damageStress",
    onChange: refreshOpenSheets,
  });

  // 5. Enable Willpower Points (SRD p. 9 & 30)
  game.settings.register(ID, "enableWillpower", {
    name: "YZE.Settings.enableWillpower.name",
    hint: "YZE.Settings.enableWillpower.hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
    onChange: refreshOpenSheets,
  });

  // 6. Enable Stress Dice Track (SRD p. 9-10)
  game.settings.register(ID, "enableStressTrack", {
    name: "YZE.Settings.enableStressTrack.name",
    hint: "YZE.Settings.enableStressTrack.hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
    onChange: refreshOpenSheets,
  });

  // 7. Encumbrance Rules (SRD p. 6)
  game.settings.register(ID, "enableEncumbrance", {
    name: "YZE.Settings.enableEncumbrance.name",
    hint: "YZE.Settings.enableEncumbrance.hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
    onChange: refreshOpenSheets,
  });

  // 8. Weapons at Hand Encumbrance Variant (SRD p. 6)
  game.settings.register(ID, "weaponsAtHandRule", {
    name: "YZE.Settings.weaponsAtHandRule.name",
    hint: "YZE.Settings.weaponsAtHandRule.hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
    onChange: refreshOpenSheets,
  });

  // 9. Auto-seed 12 Core SRD Skills on new Characters/NPCs
  game.settings.register(ID, "autoSeedCoreSkills", {
    name: "YZE.Settings.autoSeedCoreSkills.name",
    hint: "YZE.Settings.autoSeedCoreSkills.hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
  });

  // 10. GM Doom Points tracker (SRD p. 9)
  game.settings.register(ID, "doomPoints", {
    name: "YZE.Settings.doomPoints.name",
    hint: "YZE.Settings.doomPoints.hint",
    scope: "world",
    config: false,
    type: Number,
    default: 0,
  });
}

export function registerStatusEffects() {
  const allConditions = [
    ...YZE_CONFIG.conditions.physical,
    ...YZE_CONFIG.conditions.mental,
  ];
  CONFIG.statusEffects = [
    {
      id: "dead",
      name: "EFFECT.StatusDead",
      img: "icons/svg/skull.svg",
    },
    ...allConditions.map(c => ({
      id: c.id,
      name: c.label,
      img: c.type === "physical" ? "icons/svg/blood.svg" : "icons/svg/daze.svg",
    })),
  ];
}
