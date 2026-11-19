import { YZE_CONFIG } from "./config.mjs";

export function registerSettings() {
  const ID = YZE_CONFIG.ID;

  // 1. Dice Pool vs Step Dice
  game.settings.register(ID, "resolutionMode", {
    name: "YZE.Settings.resolutionMode.name",
    hint: "YZE.Settings.resolutionMode.hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      dicePool: "YZE.Settings.resolutionMode.dicePool",
      stepDice: "YZE.Settings.resolutionMode.stepDice",
    },
    default: "dicePool",
    onChange: () => {
      for (const actor of game.actors ?? []) {
        actor.reset();
        actor.sheet?.render();
      }
    },
  });

  // 2. Step Dice Modifier Style: Standard Step Up/Down vs Advantage/Disadvantage (SRD p. 10-11)
  game.settings.register(ID, "stepModifierMode", {
    name: "YZE.Settings.stepModifierMode.name",
    hint: "YZE.Settings.stepModifierMode.hint",
    scope: "world",
    config: true,
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
    config: true,
    type: String,
    choices: {
      healthResolve: "YZE.Settings.damageMode.healthResolve",
      attributeDamage: "YZE.Settings.damageMode.attributeDamage",
      conditions: "YZE.Settings.damageMode.conditions",
    },
    default: "healthResolve",
    onChange: () => {
      for (const actor of game.actors ?? []) {
        actor.reset();
        actor.sheet?.render();
      }
    },
  });

  // 4. Cost of Pushing (SRD p. 9)
  game.settings.register(ID, "pushMode", {
    name: "YZE.Settings.pushMode.name",
    hint: "YZE.Settings.pushMode.hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      damageStress: "YZE.Settings.pushMode.damageStress",
      attributeDamage: "YZE.Settings.pushMode.attributeDamage",
      stressDice: "YZE.Settings.pushMode.stressDice",
      conditions: "YZE.Settings.pushMode.conditions",
      doomPoints: "YZE.Settings.pushMode.doomPoints",
    },
    default: "damageStress",
  });

  // 5. Enable Willpower Points (SRD p. 9 & 30)
  game.settings.register(ID, "enableWillpower", {
    name: "YZE.Settings.enableWillpower.name",
    hint: "YZE.Settings.enableWillpower.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      for (const actor of game.actors ?? []) actor.sheet?.render();
    },
  });

  // 6. Enable Stress Dice Track (SRD p. 9-10)
  game.settings.register(ID, "enableStressTrack", {
    name: "YZE.Settings.enableStressTrack.name",
    hint: "YZE.Settings.enableStressTrack.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: () => {
      for (const actor of game.actors ?? []) actor.sheet?.render();
    },
  });

  // 7. Encumbrance Rules (SRD p. 6)
  game.settings.register(ID, "enableEncumbrance", {
    name: "YZE.Settings.enableEncumbrance.name",
    hint: "YZE.Settings.enableEncumbrance.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      for (const actor of game.actors ?? []) {
        actor.reset();
        actor.sheet?.render();
      }
    },
  });

  // 8. Weapons at Hand Encumbrance Variant (SRD p. 6)
  game.settings.register(ID, "weaponsAtHandRule", {
    name: "YZE.Settings.weaponsAtHandRule.name",
    hint: "YZE.Settings.weaponsAtHandRule.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      for (const actor of game.actors ?? []) {
        actor.reset();
        actor.sheet?.render();
      }
    },
  });

  // 9. Auto-seed 12 Core SRD Skills on new Characters/NPCs
  game.settings.register(ID, "autoSeedCoreSkills", {
    name: "YZE.Settings.autoSeedCoreSkills.name",
    hint: "YZE.Settings.autoSeedCoreSkills.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  // 10. GM Doom Points tracker (SRD p. 9)
  game.settings.register(ID, "doomPoints", {
    name: "YZE.Settings.doomPoints.name",
    hint: "YZE.Settings.doomPoints.hint",
    scope: "world",
    config: true,
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
