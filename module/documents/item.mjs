import { rollSupply } from "../helpers/rolls.mjs";

export class YzeItem extends foundry.documents.Item {
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    const defaultIcons = {
      skill: "systems/fvtt-yze/assets/icons/skill.svg",
      specialty: "systems/fvtt-yze/assets/icons/specialty.svg",
      gear: "systems/fvtt-yze/assets/icons/gear.svg",
      weapon: "systems/fvtt-yze/assets/icons/weapon.svg",
      armor: "systems/fvtt-yze/assets/icons/armor.svg",
      spell: "systems/fvtt-yze/assets/icons/spell.svg",
      critical: "systems/fvtt-yze/assets/icons/critical.svg",
    };

    const updates = {};
    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      updates.img = defaultIcons[data.type] || "icons/svg/item-bag.svg";
    }
    if (data.type === "weapon" && !data.system?.skill) {
      updates["system.skill"] = game.i18n.localize("YZE.CoreSkill.melee");
    }
    if (Object.keys(updates).length > 0) {
      this.updateSource(updates);
    }
  }

  /**
   * Primary action when clicking Roll/Use on an owned Item.
   */
  async roll(event = null) {
    const actor = this.actor;
    if (!actor) return this.sendToChat();

    switch (this.type) {
      case "skill":
        return actor.openRollDialog(
          {
            attribute: this.system.attribute,
            skill: this,
          },
          event
        );

      case "weapon": {
        const linkedSkill = actor.findSkill(this.system.skill);
        const attribute = linkedSkill?.system?.attribute || this.system.attribute || "strength";
        return actor.openRollDialog(
          {
            attribute,
            skill: linkedSkill,
            gear: this,
          },
          event
        );
      }

      case "armor":
        return actor.rollArmor(this, event);

      case "gear": {
        if (this.system.subtype === "consumable" && this.system.supplyRating > 0) {
          return this.rollSupply();
        }
        const linkedSkill = actor.findSkill(this.system.associatedSkill);
        const attribute = linkedSkill?.system?.attribute || "wits";
        return actor.openRollDialog(
          {
            attribute,
            skill: linkedSkill,
            gear: this,
          },
          event
        );
      }

      case "specialty": {
        if (this.system.willpowerCost > 0 && actor.system.willpower) {
          if (actor.system.willpower.value < this.system.willpowerCost) {
            ui.notifications.warn(game.i18n.localize("YZE.Notifications.NotEnoughWillpower"));
            return null;
          }
          await actor.update({
            "system.willpower.value": actor.system.willpower.value - this.system.willpowerCost,
          });
        }
        if (this.system.associatedSkill || this.system.attribute) {
          const linkedSkill = actor.findSkill(this.system.associatedSkill);
          const attribute = linkedSkill?.system?.attribute || this.system.attribute || "strength";
          return actor.openRollDialog(
            {
              attribute,
              skill: linkedSkill,
              specialty: this,
            },
            event
          );
        }
        return this.sendToChat();
      }

      case "spell":
        return actor.openSpellDialog(this);

      case "critical": {
        // If lethal and not stabilized, roll a Death Save (Stamina roll, cannot be pushed, SRD p. 22)
        if (this.system.lethal && !this.system.stabilized) {
          const stamina = actor.findSkill("stamina") || actor.findSkill(game.i18n.localize("YZE.CoreSkill.stamina"));
          return actor.openRollDialog(
            {
              attribute: "strength",
              skill: stamina,
              modifier: this.system.deathSaveModifier || 0,
              maxPush: 0,
              customTitle: `${game.i18n.localize("YZE.Critical.DeathSave")}: ${this.name}`,
            },
            event
          );
        }
        return this.sendToChat();
      }

      default:
        return this.sendToChat();
    }
  }

  async rollSupply() {
    if (!this.actor) return null;
    return rollSupply(this.actor, this);
  }

  async sendToChat() {
    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/fvtt-yze/templates/chat/item-card.hbs",
      {
        item: this,
        system: this.system,
        actor: this.actor,
      }
    );
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content,
    });
  }
}
