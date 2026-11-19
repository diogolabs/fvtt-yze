export class YzeChatMessage extends foundry.documents.ChatMessage {
  async renderHTML({ canDelete, canClose = false, ...rest } = {}) {
    const html = await super.renderHTML({ canDelete, canClose, ...rest });
    if (!this.rolls || !this.rolls.length) return html;

    const actor = game.actors.get(this.speaker?.actor);
    if (game.user.isGM || actor?.isOwner || this.author?.id === game.user.id) {
      return html;
    }

    html.querySelector(".dice-buttons")?.remove();
    return html;
  }
}
