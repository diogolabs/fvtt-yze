import { YearZeroRoll } from "../../lib/yzur.js";
import { YZE_CONFIG } from "../config.mjs";

const STEP_LADDER = ["none", "d6", "d8", "d10", "d12"];

export function registerDice3D(dice3d) {
  const ID = YZE_CONFIG.ID;
  dice3d.addSystem({ id: ID, name: "Year Zero Engine (SRD)" }, "preferred");

  dice3d.addColorset({
    name: "YZEBase",
    description: "YZE Base Dice",
    category: "Year Zero Engine",
    foreground: ["#111111"],
    background: ["#e2c044"],
    outline: "#b89628",
    texture: "none",
  }, "preferred");

  dice3d.addColorset({
    name: "YZESkill",
    description: "YZE Skill Dice",
    category: "Year Zero Engine",
    foreground: ["#ffffff"],
    background: ["#2b5b84"],
    outline: "#1d3f5c",
    texture: "none",
  }, "preferred");

  dice3d.addColorset({
    name: "YZEGear",
    description: "YZE Gear Dice",
    category: "Year Zero Engine",
    foreground: ["#ffffff"],
    background: ["#222222"],
    outline: "#000000",
    texture: "none",
  }, "preferred");

  dice3d.addColorset({
    name: "YZEStress",
    description: "YZE Stress Dice",
    category: "Year Zero Engine",
    foreground: ["#111111"],
    background: ["#c94a38"],
    outline: "#8f2d1f",
    texture: "none",
  }, "preferred");
}

/**
 * Step a die key ("none", "d6", "d8", "d10", "d12") up or down by `delta` steps.
 */
export function stepDieBy(dieKey, delta) {
  const idx = Math.max(0, STEP_LADDER.indexOf(dieKey || "none"));
  const nextIdx = Math.clamp(idx + delta, 0, STEP_LADDER.length - 1);
  return STEP_LADDER[nextIdx];
}

/**
 * Computes the final Step Dice array according to YZE SRD v1.0 p. 10-11:
 * - Balances dice by stepping up the lower die first, stepping down the higher die first.
 * - Never exceeds two D12s.
 * - Downstepping past two D6s removes one die; never goes below one D6.
 * - Also supports Advantage/Disadvantage variant (SRD p. 11).
 */
export function computeStepDice(attrDie, skillDie, totalMod = 0, mode = "step") {
  const validAttr = STEP_LADDER.includes(attrDie) && attrDie !== "none" ? attrDie : "d6";
  const validSkill = STEP_LADDER.includes(skillDie) ? skillDie : "none";

  // Represent each active die as its index in STEP_LADDER (1=d6, 2=d8, 3=d10, 4=d12)
  const dice = [
    { step: Math.max(1, STEP_LADDER.indexOf(validAttr)), flavor: "Attribute" },
  ];
  if (validSkill !== "none") {
    dice.push({ step: STEP_LADDER.indexOf(validSkill), flavor: "Skill" });
  }

  if (mode === "advDisadv") {
    // SRD p. 11: Advantage adds a 3rd die equal to the lower die; Disadvantage removes the lower die.
    if (totalMod > 0) {
      const minStep = Math.min(...dice.map(d => d.step));
      dice.push({ step: minStep, flavor: "Advantage" });
    } else if (totalMod < 0 && dice.length > 1) {
      let minIdx = 0;
      for (let i = 1; i < dice.length; i++) {
        if (dice[i].step < dice[minIdx].step) minIdx = i;
      }
      dice.splice(minIdx, 1);
    }
    return dice.map(d => ({
      die: STEP_LADDER[d.step],
      deno: String(YZE_CONFIG.stepDice[STEP_LADDER[d.step]].faces),
      flavor: d.flavor,
    }));
  }

  // Standard Step Dice Modifier balancing (SRD p. 10)
  let mod = totalMod;
  while (mod > 0) {
    if (dice.length === 1) {
      // Unskilled: first +1 adds a D6 skill die
      dice.push({ step: 1, flavor: "Skill" });
      mod--;
      continue;
    }
    // Step up the lower die first
    let lowestIdx = 0;
    for (let i = 1; i < dice.length; i++) {
      if (dice[i].step < dice[lowestIdx].step) lowestIdx = i;
    }
    if (dice[lowestIdx].step >= 4) {
      // Both at D12 (cap)
      break;
    }
    dice[lowestIdx].step++;
    mod--;
  }

  while (mod < 0) {
    if (dice.length === 1) {
      if (dice[0].step > 1) {
        dice[0].step--;
      } else {
        // Cannot go below a single D6
        break;
      }
      mod++;
      continue;
    }
    // Downstep the higher die first
    let highestIdx = 0;
    for (let i = 1; i < dice.length; i++) {
      if (dice[i].step >= dice[highestIdx].step) highestIdx = i;
    }
    if (dice[highestIdx].step > 1) {
      dice[highestIdx].step--;
    } else {
      // Both are D6: downstepping past two D6s removes one die
      dice.pop();
    }
    mod++;
  }

  return dice.map(d => ({
    die: STEP_LADDER[d.step],
    deno: String(YZE_CONFIG.stepDice[STEP_LADDER[d.step]].faces),
    flavor: d.flavor,
  }));
}

/**
 * Computes the Dice Pool breakdown according to YZE SRD v1.0 p. 10:
 * "Always add and remove base dice from your skills, if you can (not from attributes or gear).
 * If you don't have enough dice from skills, remove base dice from gear.
 * If you run out of gear dice as well, remove base dice from attributes."
 */
export function computeDicePool(attrDice = 0, skillDice = 0, gearDice = 0, totalMod = 0) {
  let base = Math.max(0, Number(attrDice) || 0);
  let skill = Math.max(0, Number(skillDice) || 0);
  let gear = Math.max(0, Number(gearDice) || 0);
  let mod = Number(totalMod) || 0;

  if (mod > 0) {
    skill += mod;
  } else if (mod < 0) {
    let rem = Math.abs(mod);
    const fromSkill = Math.min(skill, rem);
    skill -= fromSkill;
    rem -= fromSkill;

    const fromGear = Math.min(gear, rem);
    gear -= fromGear;
    rem -= fromGear;

    const fromBase = Math.min(base, rem);
    base -= fromBase;
  }

  return { base, skill, gear };
}

/**
 * Executes a Year Zero Engine roll (Dice Pool or Step Dice) and posts to Chat.
 */
export async function executeYzeRoll(actor, {
  resolutionMode = "dicePool",
  stepModifierMode = "step",
  attribute = "",
  attrScore = 0,
  attrDie = "d8",
  skill = null,
  skillScore = 0,
  skillDie = "none",
  gear = null,
  gearBonus = 0,
  artifactDie = "",
  stressDice = 0,
  ammoDice = 0,
  modifier = 0,
  maxPush = 1,
  flavor = "",
  damage = 0,
  critThreshold = 0,
  usePride = false,
  rollMode = null,
  rollType = "skill",
  breakdown = [],
} = {}) {
  const formulaParts = [];

  if (resolutionMode === "stepDice") {
    const totalStepMod = (Number(modifier) || 0) + (Number(gearBonus) || 0);
    const stepped = computeStepDice(attrDie, skillDie, totalStepMod, stepModifierMode);
    for (const d of stepped) {
      formulaParts.push(`1d${d.deno}[${d.flavor}]`);
    }
  } else {
    const pool = computeDicePool(attrScore, skillScore, gearBonus, modifier);
    if (pool.base > 0) formulaParts.push(`${pool.base}db`);
    if (pool.skill > 0) formulaParts.push(`${pool.skill}ds`);
    if (pool.gear > 0) formulaParts.push(`${pool.gear}dg`);
  }

  if (artifactDie && ["d8", "d10", "d12"].includes(artifactDie)) {
    const deno = artifactDie.replace("d", "");
    formulaParts.push(`1d${deno}[Artifact]`);
  }

  if (stressDice > 0) {
    formulaParts.push(`${stressDice}dz`);
  }

  if (ammoDice > 0) {
    formulaParts.push(`${ammoDice}dm`);
  }

  if (!formulaParts.length) {
    ui.notifications.warn(game.i18n.localize("YZE.Notifications.NoDiceToRoll"));
    return null;
  }

  const damageMode = game.settings.get(YZE_CONFIG.ID, "damageMode");
  const pushMode = game.settings.get(YZE_CONFIG.ID, "pushMode");

  const rollOptions = {
    game: "yze",
    maxPush,
    damage: damage > 0 ? damage : undefined,
    critical: critThreshold > 0 ? critThreshold : undefined,
    breakdown,
    rollMode: rollMode || game.settings.get("core", "messageMode"),
    resolutionMode,
    rollType,
    attribute,
    onlyAttributeBanes: pushMode === "attributeDamage" || damageMode === "attributeDamage",
    prideBonus: usePride ? 1 : 0,
  };

  const roll = await new YearZeroRoll(formulaParts.join(" + "), { maxPush }, rollOptions).evaluate();

  // Pride grants 1 automatic success (SRD p. 6) and marks Pride as used
  if (usePride && actor?.system?.traits?.pride) {
    await actor.update({ "system.traits.pride.used": true });
  }

  // Ammo consumption for weapons with magazines (SRD p. 19)
  let totalAmmoUsed = 0;
  if (gear?.type === "weapon" && gear.system.mag?.max > 0) {
    totalAmmoUsed = ammoDice > 0 ? roll.ammoSpent + 1 : 1;
    const remaining = Math.max(0, (gear.system.mag.value || 0) - totalAmmoUsed);
    await gear.update({ "system.mag.value": remaining });
    roll.options.totalAmmoUsed = totalAmmoUsed;
    roll.options.magRemaining = remaining;
  }

  // Mark skill XP checkbox automatically on meaningful success (SRD p. 7)
  if (skill && (roll.successCount + (usePride ? 1 : 0)) > 0 && !skill.system.xpMarked) {
    await skill.update({ "system.xpMarked": true });
  }

  const speaker = ChatMessage.getSpeaker({ actor });
  const message = await roll.toMessage(
    {
      speaker,
      flavor,
      flags: {
        [YZE_CONFIG.ID]: {
          actorUuid: actor?.uuid ?? "",
          attribute,
          skillUuid: skill?.uuid ?? "",
          gearUuid: gear?.uuid ?? "",
          resolutionMode,
          rollType,
          prideBonus: usePride ? 1 : 0,
        },
      },
    },
    { rollMode: rollOptions.rollMode }
  );

  await game.dice3d?.waitFor3DAnimationByMessageID(message.id);
  return message;
}

/**
 * Push a Year Zero roll from a ChatMessage and apply the configured Cost of Pushing (SRD p. 9).
 */
export async function pushYzeRoll(event) {
  const messageId = event.target.closest("[data-message-id]")?.dataset?.messageId;
  const message = game.messages.get(messageId);
  if (!message || !message.rolls?.length) return null;

  const flags = message.flags?.[YZE_CONFIG.ID] ?? {};
  const actor = flags.actorUuid ? await fromUuid(flags.actorUuid) : game.actors.get(message.speaker?.actor);
  const gear = flags.gearUuid ? await fromUuid(flags.gearUuid) : null;
  const attribute = flags.attribute || message.rolls[0].options?.attribute || "strength";

  const roll = message.rolls[0].duplicate();
  const pushMode = game.settings.get(YZE_CONFIG.ID, "pushMode");
  const enableStress = game.settings.get(YZE_CONFIG.ID, "enableStressTrack");

  // If Stress Dice push mode is enabled, pushing immediately adds +1 Stress and +1 Stress Die to the push (SRD p. 9)
  if ((pushMode === "stressDice" || enableStress) && actor?.system?.stress !== undefined) {
    const newStress = (actor.system.stress.value || 0) + 1;
    await actor.update({ "system.stress.value": newStress });
    await roll.addDice(1, "stress");
  }

  await message.delete();
  await roll.push();

  // Apply Cost of Pushing after roll is pushed (SRD p. 9)
  const trauma = roll.attributeTrauma || 0;
  const gearDmg = roll.gearDamage || 0;
  let pushSummary = [];

  if (actor) {
    if (pushMode === "damageStress") {
      if (trauma > 0) {
        const isPhysical = YZE_CONFIG.physicalAttributes.includes(attribute);
        if (isPhysical && actor.system.health) {
          const nextHp = Math.max(0, actor.system.health.value - trauma);
          await actor.update({ "system.health.value": nextHp });
          pushSummary.push(`${game.i18n.localize("YZE.Health")}: -${trauma}`);
        } else if (!isPhysical && actor.system.resolve) {
          const nextRes = Math.max(0, actor.system.resolve.value - trauma);
          await actor.update({ "system.resolve.value": nextRes });
          pushSummary.push(`${game.i18n.localize("YZE.Resolve")}: -${trauma}`);
        }
      }
    } else if (pushMode === "attributeDamage") {
      if (trauma > 0 && actor.system.attributes?.[attribute]) {
        const cur = actor.system.attributes[attribute].value;
        const nextVal = Math.max(0, cur - trauma);
        const updates = { [`system.attributes.${attribute}.value`]: nextVal };
        // SRD p. 9: Gain 1 Willpower Point (WP) for every point of attribute damage from pushing
        if (actor.system.willpower !== undefined) {
          const nextWp = Math.min(actor.system.willpower.max || 10, (actor.system.willpower.value || 0) + trauma);
          updates["system.willpower.value"] = nextWp;
          pushSummary.push(`+${trauma} WP`);
        }
        await actor.update(updates);
        pushSummary.push(`${game.i18n.localize(YZE_CONFIG.attributes[attribute])}: -${trauma}`);
      }
    } else if (pushMode === "conditions") {
      // SRD p. 9 & 21: Pushing inflicts a physical or mental condition
      if (actor.system.conditions) {
        const isPhysical = YZE_CONFIG.physicalAttributes.includes(attribute);
        const list = isPhysical ? YZE_CONFIG.conditions.physical : YZE_CONFIG.conditions.mental;
        const freeCond = list.find(c => !actor.system.conditions[c.id]);
        if (freeCond) {
          await actor.update({ [`system.conditions.${freeCond.id}`]: true });
          pushSummary.push(`${game.i18n.localize(freeCond.label)}`);
        }
      }
    } else if (pushMode === "doomPoints") {
      const curDoom = game.settings.get(YZE_CONFIG.ID, "doomPoints") || 0;
      if (game.user.isGM) {
        await game.settings.set(YZE_CONFIG.ID, "doomPoints", curDoom + 1);
      }
      pushSummary.push(`+1 ${game.i18n.localize("YZE.DoomPoint")}`);
    }
  }

  // Degrading Gear Bonus on pushed Gear Banes (SRD p. 12)
  if (gear && gearDmg > 0 && gear.system.bonus !== undefined) {
    const nextBonus = Math.max(0, gear.system.bonus - gearDmg);
    await gear.update({ "system.bonus": nextBonus });
    pushSummary.push(`${gear.name}: -${gearDmg} ${game.i18n.localize("YZE.Bonus")}`);
  } else if (gear?.documentName === "Actor" && gear.type === "vehicle" && gearDmg > 0) {
    const nextMan = Math.max(0, gear.system.maneuverability - gearDmg);
    await gear.update({ "system.maneuverability": nextMan });
  }

  if (pushSummary.length) {
    roll.options.pushCostSummary = pushSummary.join(" | ");
  }

  const newMessage = await roll.toMessage(
    {
      speaker: message.speaker,
      flavor: message.flavor,
      flags: message.flags,
    },
    { rollMode: roll.options.rollMode ?? game.settings.get("core", "messageMode") }
  );
  await game.dice3d?.waitFor3DAnimationByMessageID(newMessage.id);
  return newMessage;
}

/**
 * Accept a roll without pushing (locks out further pushes).
 */
export async function acceptYzeRoll(event) {
  const messageId = event.target.closest("[data-message-id]")?.dataset?.messageId;
  const message = game.messages.get(messageId);
  if (!message || !message.rolls?.length) return null;

  const roll = message.rolls[0].duplicate();
  roll.maxPush = 0;
  await message.update({ rolls: [roll.toJSON()] });
  return message;
}

/**
 * Executes a Spell Casting Roll according to YZE SRD Chapter 5 (p. 30).
 */
export async function executeSpellRoll(actor, spell, {
  wpSpent = 1,
  extraWp = 0,
  safeCastingReduction = 0,
  chanceCast = false,
  useGrimoire = false,
  carvedSymbol = false,
} = {}) {
  const totalWp = Math.max(1, Number(wpSpent) + Number(extraWp));
  if (actor?.type === "character" && actor.system.willpower) {
    if (actor.system.willpower.value < totalWp) {
      ui.notifications.warn(game.i18n.localize("YZE.Notifications.NotEnoughWillpower"));
      return null;
    }
    await actor.update({ "system.willpower.value": actor.system.willpower.value - totalWp });
  }

  const diceCount = Math.max(0, totalWp - Math.max(0, Number(safeCastingReduction) || 0));
  let successes = 0;
  let banes = 0;
  let roll = null;

  if (diceCount > 0) {
    roll = await new YearZeroRoll(`${diceCount}db`, { maxPush: 0 }, {
      game: "yze",
      maxPush: 0,
      rollType: "spell",
    }).evaluate();
    successes = roll.successCount;
    banes = roll.attributeTrauma;
  }

  const basePowerLevel = Number(wpSpent) + (carvedSymbol ? 1 : 0);
  const finalPowerLevel = basePowerLevel + successes;
  const hasMishap = banes > 0 || chanceCast;

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/fvtt-yze/templates/chat/spell-cast.hbs",
    {
      actor,
      spell,
      wpSpent,
      extraWp,
      totalWp,
      diceCount,
      safeCastingReduction,
      chanceCast,
      useGrimoire,
      carvedSymbol,
      basePowerLevel,
      overcharge: successes,
      finalPowerLevel,
      banes,
      hasMishap,
      rollHtml: roll ? await roll.render() : null,
    }
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${game.i18n.localize("YZE.Magic.CastSpell")}: ${spell.name}`,
    content,
    rolls: roll ? [roll] : [],
  });
}

/**
 * Supply Roll (YZE SRD v1.0 p. 7):
 * Roll a number of D6 equal to current Supply rating (max 6). For each 1 rolled, Supply decreases by 1.
 */
export async function rollSupply(actor, item) {
  const currentSupply = Number(item.system.supplyRating) || 0;
  if (currentSupply <= 0) {
    ui.notifications.warn(game.i18n.format("YZE.Notifications.SupplyDepleted", { name: item.name }));
    return null;
  }

  const diceToRoll = Math.min(6, currentSupply);
  const roll = await new YearZeroRoll(`${diceToRoll}db`, { maxPush: 0 }, {
    game: "yze",
    maxPush: 0,
    rollType: "supply",
  }).evaluate();

  const lost = roll.attributeTrauma || 0;
  const newSupply = Math.max(0, currentSupply - lost);
  if (lost > 0) {
    await item.update({ "system.supplyRating": newSupply });
  }

  roll.options.supplyBefore = currentSupply;
  roll.options.supplyLost = lost;
  roll.options.supplyAfter = newSupply;

  return roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${game.i18n.localize("YZE.SupplyRoll")}: ${item.name} (${currentSupply} → ${newSupply})`,
  });
}

/**
 * Panic Roll (YZE SRD v1.0 p. 10): 1D6 + current Stress points
 */
export async function rollPanic(actor) {
  const stress = Number(actor?.system?.stress?.value) || 0;
  const dieRoll = await new Roll("1d6", {}, { isTableRoll: true }).evaluate();
  const dieVal = dieRoll.dice[0]?.total ?? Math.ceil(Math.random() * 6);
  const total = dieVal + stress;

  const entry = YZE_CONFIG.panicTable.find(e => total >= e.min && total <= e.max)
    || YZE_CONFIG.panicTable[YZE_CONFIG.panicTable.length - 1];

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/fvtt-yze/templates/chat/table-result.hbs",
    {
      tableTitle: game.i18n.localize("YZE.PanicRoll"),
      rollLabel: `1D6 (${dieVal}) + ${game.i18n.localize("YZE.Stress")} (${stress}) = ${total}`,
      resultTitle: entry.title,
      resultText: entry.effect,
      isAlert: total >= 7,
    }
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
  });
}

/**
 * Magic Mishap Roll (YZE SRD v1.0 p. 31): D12
 */
export async function rollMagicMishap(actor) {
  const d12 = Math.floor(Math.random() * 12) + 1;
  const entry = YZE_CONFIG.magicMishapTable.find(e => e.roll === d12) || YZE_CONFIG.magicMishapTable[0];

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/fvtt-yze/templates/chat/table-result.hbs",
    {
      tableTitle: game.i18n.localize("YZE.Magic.MishapRoll"),
      rollLabel: `D12 = ${d12}`,
      resultTitle: `${game.i18n.localize("YZE.Magic.Mishap")} #${d12}`,
      resultText: entry.effect,
      isAlert: true,
    }
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
  });
}

/**
 * Critical Injury Table Roll (YZE SRD v1.0 p. 22–24 & 27):
 * Supports "physical" (D66), "mental" (D66), and "vehicle" (D12).
 */
export async function rollCriticalTable(actor, category = "physical", addToActor = true) {
  if (category === "vehicle") {
    const d12 = Math.floor(Math.random() * 12) + 1;
    const entry = YZE_CONFIG.vehicleCritTable.find(e => e.roll === d12) || YZE_CONFIG.vehicleCritTable[0];
    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/fvtt-yze/templates/chat/table-result.hbs",
      {
        tableTitle: game.i18n.localize("YZE.Vehicle.ComponentDamage"),
        rollLabel: `D12 = ${d12}`,
        resultTitle: entry.name,
        resultText: entry.effects,
        isAlert: true,
      }
    );
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
    });
  }

  const tens = Math.floor(Math.random() * 6) + 1;
  const ones = Math.floor(Math.random() * 6) + 1;
  const d66 = tens * 10 + ones;

  const table = category === "mental" ? YZE_CONFIG.mentalCritTable : YZE_CONFIG.physicalCritTable;
  const entry = table.find(e => e.d66.includes(d66)) || table[0];

  if (addToActor && actor && ["character", "npc"].includes(actor.type)) {
    await actor.createEmbeddedDocuments("Item", [
      {
        name: `${entry.name} (D66: ${d66})`,
        type: "critical",
        img: "systems/fvtt-yze/assets/icons/critical.svg",
        system: {
          category,
          d66: String(d66),
          lethal: Boolean(entry.lethal),
          timeLimit: entry.timeLimit || "none",
          deathSaveModifier: entry.mod || 0,
          healingTime: entry.healingTime || "—",
          effectsSummary: entry.effects,
          description: `<p><strong>D66 (${d66}) — ${entry.name}:</strong> ${entry.effects}</p>`,
        },
      },
    ]);
  }

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/fvtt-yze/templates/chat/table-result.hbs",
    {
      tableTitle: category === "mental"
        ? game.i18n.localize("YZE.Critical.MentalTable")
        : game.i18n.localize("YZE.Critical.PhysicalTable"),
      rollLabel: `D66 = ${d66}`,
      resultTitle: entry.name,
      resultText: entry.effects,
      metaLine: entry.lethal
        ? `${game.i18n.localize("YZE.Critical.Lethal")}: ${game.i18n.localize("YZE.Yes")} (${entry.timeLimit}) | ${game.i18n.localize("YZE.Critical.HealingTime")}: ${entry.healingTime}`
        : `${game.i18n.localize("YZE.Critical.HealingTime")}: ${entry.healingTime}`,
      isAlert: true,
    }
  );

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
  });
}

/**
 * Apply attack damage from a chat card to all currently controlled tokens (GM / Owner).
 */
export async function applyTargetDamage(event) {
  const messageId = event.target.closest("[data-message-id]")?.dataset?.messageId;
  const message = game.messages.get(messageId);
  const roll = message?.rolls?.[0];
  if (!roll || !roll.attackDamage) return;

  const controlled = canvas?.tokens?.controlled ?? [];
  if (!controlled.length) {
    ui.notifications.warn(game.i18n.localize("YZE.Notifications.SelectTargetToken"));
    return;
  }

  const dmg = Number(roll.attackDamage) || 0;
  const damageMode = game.settings.get(YZE_CONFIG.ID, "damageMode");

  for (const token of controlled) {
    const targetActor = token.actor;
    if (!targetActor) continue;

    if (targetActor.type === "vehicle") {
      const nextHull = Math.max(0, targetActor.system.hull.value - dmg);
      await targetActor.update({
        "system.hull.value": nextHull,
        "system.wrecked": nextHull === 0,
      });
    } else if (damageMode === "attributeDamage" && targetActor.system.attributes?.strength) {
      const nextStr = Math.max(0, targetActor.system.attributes.strength.value - dmg);
      await targetActor.update({ "system.attributes.strength.value": nextStr });
    } else if (targetActor.system.health) {
      const nextHp = Math.max(0, targetActor.system.health.value - dmg);
      await targetActor.update({ "system.health.value": nextHp });
    }
  }
  ui.notifications.info(game.i18n.format("YZE.Notifications.AppliedDamage", { dmg }));
}
