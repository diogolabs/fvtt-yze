import {
  acceptYzeRoll,
  applyTargetDamage,
  pushYzeRoll,
  rollCriticalTable,
  rollMagicMishap,
  rollPanic,
} from "../helpers/rolls.mjs";

export class YzeChatLog extends foundry.applications.sidebar.tabs.ChatLog {
  static DEFAULT_OPTIONS = {
    actions: {
      pushRoll: YzeChatLog.#pushRoll,
      acceptRoll: YzeChatLog.#acceptRoll,
      applyTargetDamage: YzeChatLog.#applyTargetDamage,
      rollPanic: YzeChatLog.#rollPanic,
      rollMagicMishap: YzeChatLog.#rollMagicMishap,
      rollCritTable: YzeChatLog.#rollCritTable,
    },
  };

  static async #pushRoll(event) {
    await pushYzeRoll(event);
  }

  static async #acceptRoll(event) {
    await acceptYzeRoll(event);
  }

  static async #applyTargetDamage(event) {
    await applyTargetDamage(event);
  }

  static async #rollPanic(event) {
    const messageId = event.target.closest("[data-message-id]")?.dataset?.messageId;
    const message = game.messages.get(messageId);
    const actor = game.actors.get(message?.speaker?.actor) || game.user.character;
    await rollPanic(actor);
  }

  static async #rollMagicMishap(event) {
    const messageId = event.target.closest("[data-message-id]")?.dataset?.messageId;
    const message = game.messages.get(messageId);
    const actor = game.actors.get(message?.speaker?.actor) || game.user.character;
    await rollMagicMishap(actor);
  }

  static async #rollCritTable(event, target) {
    const category = target?.dataset?.category || "physical";
    const messageId = event.target.closest("[data-message-id]")?.dataset?.messageId;
    const message = game.messages.get(messageId);
    const actor = canvas?.tokens?.controlled?.[0]?.actor
      || game.actors.get(message?.speaker?.actor)
      || game.user.character;
    await rollCriticalTable(actor, category, false);
  }
}
