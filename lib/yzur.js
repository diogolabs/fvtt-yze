/**
 * ===============================================================================
 * YZUR: YEAR ZERO UNIVERSAL DICE ROLLER FOR FOUNDRY VTT (Adapted for fvtt-yze)
 * ===============================================================================
 * Original Author: @Stefouch (MIT License)
 * Adapted for Generic YZE SRD v1.0 (Dice Pool + Step Dice + Artifact/Stress/Ammo)
 * ===============================================================================
 */

class YearZeroDie extends foundry.dice.terms.Die {
  constructor(termData = {}) {
    termData.faces = Number.isInteger(termData.faces) ? termData.faces : 6;
    super(termData);
    if (this.maxPush == undefined) {
      this.maxPush = termData.maxPush ?? 1;
    }
  }

  get denomination() {
    return this.constructor.DENOMINATION;
  }

  get type() {
    return this.constructor.TYPE;
  }

  get pushable() {
    if (this.pushCount >= this.maxPush) return false;
    for (const r of this.results) {
      if (!r.active || r.discarded) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        return true;
      }
    }
    return false;
  }

  get pushCount() {
    return this.results.reduce((c, r) => Math.max(c, r.indexPush || 0), 0);
  }

  get pushed() {
    return this.pushCount > 0;
  }

  get isYearZeroDie() {
    return true;
  }

  get success() {
    if (!this._evaluated) return undefined;
    const s = this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      if (r.count !== undefined) return tot + r.count;
      if (this.constructor.SUCCESS_TABLE) {
        return tot + (this.constructor.SUCCESS_TABLE[r.result] ?? 0);
      }
      return tot + (r.result >= 6 ? 1 : 0);
    }, 0);
    return this.type === 'neg' ? -s : s;
  }

  get failure() {
    if (!this._evaluated) return undefined;
    return this.results.reduce((tot, r) => {
      if (!r.active) return tot;
      return tot + (r.result <= 1 ? 1 : 0);
    }, 0);
  }

  async roll(options = {}) {
    const roll = await super.roll(options);
    roll.indexResult = options.indexResult;
    if (roll.indexResult == undefined) {
      roll.indexResult = 1 + this.results.reduce((c, r) => {
        let i = r.indexResult;
        if (i == undefined) i = -1;
        return Math.max(c, i);
      }, -1);
    }
    roll.indexPush = options.indexPush ?? this.pushCount;
    this.results[this.results.length - 1] = roll;
    return roll;
  }

  count(n) {
    return this.values.filter(v => v === n).length;
  }

  push() {
    if (!this.pushable) return this;
    const indexPush = this.pushCount + 1;
    const indexesResult = [];
    let currentIndex = -1;
    for (const r of this.results) {
      currentIndex++;
      r.indexResult ??= currentIndex % this.number;
      if (!r.active || r.locked) continue;
      if (!this.constructor.LOCKED_VALUES.includes(r.result)) {
        r.active = false;
        r.discarded = true;
        r.pushed = true;
        r.hidden = true;
        indexesResult.push(r.indexResult);
      } else {
        r.hidden = true;
      }
    }
    for (let i = 0; i < indexesResult.length; i++) {
      this.roll({
        indexResult: indexesResult[i],
        indexPush,
      });
    }
    return this;
  }

  nopush() {
    this.maxPush = 0;
  }

  setpush(modifier) {
    const rgx = /p([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [, max] = match;
    max = parseInt(max) ?? 1;
    this.maxPush = max;
  }

  getResultLabel(result) {
    return CONFIG.YZUR.Icons.getLabel(
      this.constructor.TYPE,
      result.result,
    );
  }

  getResultCSS(result) {
    const hasSuccess = result.success !== undefined;
    const hasFailure = result.failure !== undefined;
    let isMax = false, isMin = false;
    if (this.type === 'neg') {
      isMax = false;
      isMin = result.result === 6;
    } else if (this instanceof YearZeroDie) {
      const noMin = ['skill', 'arto', 'loc'];
      const isSkillFlavor = this.options?.flavor === 'Skill' || this.options?.flavor === 'Artifact';
      isMax = result.result === this.faces || result.result >= 6;
      isMin = result.result === 1 && !noMin.includes(this.type) && !isSkillFlavor;
    } else {
      isMax = result.result === this.faces;
      isMin = result.result === 1;
    }
    return [
      this.constructor.name.toLowerCase(),
      'd' + this.faces,
      hasSuccess ? 'success' : null,
      hasFailure ? 'failure' : null,
      result.rerolled ? 'rerolled' : null,
      result.exploded ? 'exploded' : null,
      result.discarded ? 'discarded' : null,
      result.pushed ? 'pushed' : null,
      !(hasSuccess || hasFailure) && isMin ? 'min' : null,
      !(hasSuccess || hasFailure) && isMax ? 'max' : null,
    ];
  }

  getTooltipData() {
    return {
      formula: this.expression,
      total: this.success,
      banes: this.failure,
      faces: this.faces,
      number: this.number,
      type: this.type,
      isYearZeroDie: this.isYearZeroDie,
      flavor: this.options.flavor ?? (
        CONFIG.YZUR?.Dice?.localizeDieTerms
          ? game.i18n.localize(`YZUR.DIETERMS.${this.constructor.name}`)
          : null
      ),
      rolls: this.results.map(r => {
        return {
          result: this.getResultLabel(r),
          classes: this.getResultCSS(r).filterJoin(' '),
          row: r.indexPush,
          col: r.indexResult,
        };
      }),
    };
  }
}

YearZeroDie.TYPE = 'blank';
YearZeroDie.LOCKED_VALUES = [6];
YearZeroDie.SERIALIZE_ATTRIBUTES.push('maxPush');
YearZeroDie.MODIFIERS = foundry.utils.mergeObject(
  {
    'p': 'setpush',
    'np': 'nopush',
  },
  foundry.dice.terms.Die.MODIFIERS,
);

class BaseDie extends YearZeroDie {}
BaseDie.TYPE = 'base';
BaseDie.DENOMINATION = 'b';
BaseDie.LOCKED_VALUES = [1, 6];

class SkillDie extends YearZeroDie {}
SkillDie.TYPE = 'skill';
SkillDie.DENOMINATION = 's';
SkillDie.LOCKED_VALUES = [6];

class GearDie extends YearZeroDie {}
GearDie.TYPE = 'gear';
GearDie.DENOMINATION = 'g';
GearDie.LOCKED_VALUES = [1, 6];

class NegativeDie extends SkillDie {}
NegativeDie.TYPE = 'neg';
NegativeDie.DENOMINATION = 'n';

class StressDie extends YearZeroDie {}
StressDie.TYPE = 'stress';
StressDie.DENOMINATION = 'z';
StressDie.LOCKED_VALUES = [1, 6];

class ArtifactDie extends SkillDie {
  getResultLabel(result) {
    return CONFIG.YZUR.Icons.getLabel(
      `d${this.constructor.DENOMINATION}`,
      result.result,
    );
  }
}
ArtifactDie.TYPE = 'arto';
// YZE SRD v1.0 p. 8 & 12: 6-9 = 1 success, 10-12 = 2 successes
ArtifactDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
ArtifactDie.LOCKED_VALUES = [6, 7, 8, 9, 10, 11, 12];

class D8ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 8;
    super(termData);
  }
}
D8ArtifactDie.DENOMINATION = '8';

class D10ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 10;
    super(termData);
  }
}
D10ArtifactDie.DENOMINATION = '10';

class D12ArtifactDie extends ArtifactDie {
  constructor(termData = {}) {
    termData.faces = 12;
    super(termData);
  }
}
D12ArtifactDie.DENOMINATION = '12';

class TwilightDie extends ArtifactDie {
  getResultLabel(result) {
    return CONFIG.YZUR.Icons.getLabel('base', result.result);
  }
}
TwilightDie.TYPE = 'base';
TwilightDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
TwilightDie.LOCKED_VALUES = [1, 6, 7, 8, 9, 10, 11, 12];

class D6TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
}
D6TwilightDie.DENOMINATION = '6';

class D8TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 8;
    super(termData);
  }
}
D8TwilightDie.DENOMINATION = '8';

class D10TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 10;
    super(termData);
  }
}
D10TwilightDie.DENOMINATION = '10';

class D12TwilightDie extends TwilightDie {
  constructor(termData = {}) {
    termData.faces = 12;
    super(termData);
  }
}
D12TwilightDie.DENOMINATION = '12';

class AmmoDie extends YearZeroDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
}
AmmoDie.TYPE = 'ammo';
AmmoDie.DENOMINATION = 'm';
AmmoDie.LOCKED_VALUES = [1, 6];

class LocationDie extends YearZeroDie {
  constructor(termData = {}) {
    termData.faces = 6;
    super(termData);
  }
  get pushable() { return false; }
  roll(options) {
    const roll = super.roll(options);
    roll.count = 0;
    this.results[this.results.length - 1] = roll;
    return roll;
  }
}
LocationDie.TYPE = 'loc';
LocationDie.DENOMINATION = 'l';
LocationDie.SUCCESS_TABLE = [null, 0, 0, 0, 0, 0, 0];
LocationDie.LOCKED_VALUES = [1, 2, 3, 4, 5, 6];

const YearZeroDice = Object.freeze({
  AmmoDie,
  ArtifactDie,
  BaseDie,
  D10ArtifactDie,
  D10TwilightDie,
  D12ArtifactDie,
  D12TwilightDie,
  D6TwilightDie,
  D8ArtifactDie,
  D8TwilightDie,
  GearDie,
  LocationDie,
  NegativeDie,
  SkillDie,
  StressDie,
  TwilightDie,
  YearZeroDie
});

const YZUR = {
  game: 'yze',
  Chat: {
    showInfos: true,
    diceSorting: ['base', 'skill', 'neg', 'gear', 'stress', 'arto', 'ammo', 'loc'],
  },
  Roll: {
    baseTemplate: 'systems/fvtt-yze/templates/dice/broll.hbs',
    chatTemplate: 'systems/fvtt-yze/templates/dice/roll.hbs',
    tooltipTemplate: 'systems/fvtt-yze/templates/dice/tooltip.hbs',
    infosTemplate: 'systems/fvtt-yze/templates/dice/infos.hbs',
  },
  Dice: {
    localizeDieTerms: true,
    DIE_TYPES: ['base', 'skill', 'neg', 'gear', 'stress', 'arto', 'ammo', 'loc'],
    DIE_TERMS: {
      'base': BaseDie,
      'skill': SkillDie,
      'neg': NegativeDie,
      'gear': GearDie,
      'stress': StressDie,
      'artoD8': D8ArtifactDie,
      'artoD10': D10ArtifactDie,
      'artoD12': D12ArtifactDie,
      'a': D12TwilightDie,
      'b': D10TwilightDie,
      'c': D8TwilightDie,
      'd': D6TwilightDie,
      'ammo': AmmoDie,
      'loc': LocationDie,
    },
  },
  Icons: {
    getLabel: function (type, result) {
      const arto = ['d8', 'd10', 'd12'];
      if (arto.includes(type)) type = 'arto';
      const gameIcons = CONFIG.YZUR.Icons[CONFIG.YZUR.game] ?? CONFIG.YZUR.Icons.yze;
      return String(gameIcons?.[type]?.[result] ?? result);
    },
    yze: {
      base: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '10': '10',
        '11': '11',
        '12': '12',
      },
      skill: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
      },
      neg: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '−1',
      },
      gear: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
      },
      stress: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
      },
      ammo: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
      },
      arto: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '10': '10',
        '11': '11',
        '12': '12',
      },
    },
  },
};

class GameTypeError extends TypeError {
  constructor(msg) {
    super(`Unknown game: "${msg}". Allowed games are: ${YearZeroRollManager.GAMES.join(', ')}.`);
    this.name = 'YZUR | GameType Error';
  }
}

class DieTermError extends TypeError {
  constructor(msg) {
    super(`Unknown die term: "${msg}". Allowed terms are: ${Object.keys(CONFIG.YZUR.Dice.DIE_TERMS).join(', ')}.`);
    this.name = 'YZUR | DieTerm Error';
  }
}

class YearZeroRoll extends Roll {
  constructor(formula, data = {}, options = {}) {
    if (options.name == undefined) options.name = data.name;
    if (options.game == undefined) options.game = data.game;
    if (options.maxPush == undefined) options.maxPush = data.maxPush;

    super(formula, data, options);

    if (!this.game) this.game = CONFIG.YZUR.game ?? 'yze';
    if (options.maxPush != undefined) this.maxPush = options.maxPush;
  }

  get game() { return this.options.game; }
  set game(yzGame) { this.options.game = yzGame; }

  get name() { return this.options.name; }
  set name(str) { this.options.name = str; }

  set maxPush(n) {
    this.options.maxPush = n;
    for (const t of this.terms) {
      if (t instanceof YearZeroDie) {
        t.maxPush = n;
      }
    }
  }
  get maxPush() {
    if (this.options.isTableRoll) return 0;
    return this.terms.reduce((max, t) => t instanceof YearZeroDie ? Math.max(max, t.maxPush) : max, null);
  }

  get size() {
    return this.terms.reduce((s, t) => t instanceof YearZeroDie ? s + t.number : s, 0);
  }

  get pushCount() {
    return this.terms.reduce((c, t) => Math.max(c, t.pushCount || 0), 0);
  }

  get pushed() {
    return this.pushCount > 0;
  }

  get pushable() {
    if (this.options.isTableRoll) return false;
    return (
      this.pushCount < this.maxPush
      && this.terms.some(t => t.pushable)
    );
  }

  get successCount() {
    return this.terms.reduce((sc, t) => sc + (t.success ?? 0), 0);
  }

  get baneCount() {
    const banableTypes = ['base', 'gear', 'stress', 'ammo'];
    let count = 0;
    for (const bt of banableTypes) {
      count += this.count(bt, 1);
    }
    return count;
  }

  /**
   * Banes ("1") rolled on Attribute / Base dice.
   * For Step Dice, ifoptions.onlyAttributeBanes is set, only counts terms not flavored as Skill or Artifact.
   */
  get attributeTrauma() {
    return this.terms.reduce((c, t) => {
      if (t.type !== 'base') return c;
      if (t.options?.flavor === 'Artifact') return c;
      if (this.options.onlyAttributeBanes && t.options?.flavor === 'Skill') return c;
      for (const r of t.results) {
        if (r.active && r.result === 1) c++;
      }
      return c;
    }, 0);
  }

  get gearDamage() {
    return this.count('gear', 1);
  }

  get stress() {
    return this.count('stress');
  }

  get panic() {
    return this.count('stress', 1);
  }

  get ammoSpent() {
    const mt = this.getTerms('ammo');
    if (!mt.length) return 0;
    return mt.reduce((tot, t) => tot + t.values.reduce((a, b) => a + b, 0), 0);
  }

  get hitCount() {
    return this.count('ammo', 6);
  }

  get baseSuccessQty() {
    return this.successCount - this.hitCount;
  }

  get attackDamage() {
    if (!this.options.damage) return undefined;
    if (this.baseSuccessQty <= 0) return 0;
    return Number(this.options.damage) + (this.baseSuccessQty - 1) + this.hitCount;
  }

  get isSimpleRoll() {
    if (this.options.isTableRoll) return true;
    return !this.terms.some(t => t instanceof YearZeroDie);
  }

  static create(formula, data = {}, options = {}) {
    return new YearZeroRoll(formula, data, options);
  }

  getTerms(search) {
    if (typeof search === 'string') return this.terms.filter(t => t.type === search);
    return this.terms.filter(t => {
      let f = true;
      if (search.type != undefined) f = f && search.type === t.type;
      if (search.number != undefined) f = f && search.number === t.number;
      if (search.faces != undefined) f = f && search.faces === t.faces;
      if (search.options) {
        for (const key in search.options) {
          f = f && search.options[key] === t.options[key];
        }
      }
      if (search.results) {
        for (const key in search.results) {
          f = f && t.results.some(r => r[key] === search.results[key]);
        }
      }
      return f;
    });
  }

  count(type, seed = null, comparison = '=') {
    return this.terms.reduce((c, t) => {
      if (t.type === type) {
        if (t.results.length) {
          for (const r of t.results) {
            if (!r.active) continue;
            if (seed != null) {
              if (comparison === '>') { if (r.result > seed) c++; }
              else if (comparison === '>=') { if (r.result >= seed) c++; }
              else if (comparison === '<') { if (r.result < seed) c++; }
              else if (comparison === '<=') { if (r.result <= seed) c++; }
              else if (r.result === seed) { c++; }
            } else {
              c++;
            }
          }
        } else if (seed != null) {
          c += 0;
        } else {
          c += t.number;
        }
      }
      return c;
    }, 0);
  }

  async addDice(qty, type, { range = 6, value = null, options } = {}) {
    if (!qty) return this;
    const search = { type, faces: range, options };
    if (qty < 0) return this.removeDice(-qty, search);
    if (value != undefined && !this._evaluated) await this.roll();

    let term = this.getTerms(search)[0];
    if (term) {
      for (; qty > 0; qty--) {
        term.number++;
        if (this._evaluated) {
          await term.roll();
          if (value != undefined) {
            term.results[term.results.length - 1].result = value;
          }
        }
      }
    } else {
      const cls = CONFIG.YZUR.Dice.DIE_TERMS[type];
      term = new cls({
        number: qty,
        faces: range,
        maxPush: this.maxPush ?? 1,
        options,
      });
      if (this._evaluated) {
        await term.evaluate();
        if (value != undefined) {
          term.results.forEach(r => r.result = value);
        }
      }
      if (this.terms.length > 0) {
        this.terms.push(new foundry.dice.terms.OperatorTerm({ operator: type === 'neg' ? '-' : '+' }));
      }
      this.terms.push(term);
    }
    this._formula = this.constructor.getFormula(this.terms);
    if (this._evaluated) this._total = this._evaluateTotal();
    return this;
  }

  removeDice(qty, search, { discard = false, disable = false } = {}) {
    if (!qty) return this;
    for (; qty > 0; qty--) {
      const term = this.getTerms(search)[0];
      if (term) {
        term.number--;
        if (term.number <= 0) {
          const type = search.type ?? search;
          const index = this.terms.findIndex(t => t.type === type && t.number === 0);
          this.terms.splice(index, 1);
          if (this.terms[index - 1]?.operator) {
            this.terms.splice(index - 1, 1);
          }
        } else if (this._evaluated) {
          const index = term.results.findIndex(r => r.active);
          if (index < 0) break;
          if (discard || disable) {
            if (discard) term.results[index].discarded = discard;
            if (disable) term.results[index].active = !disable;
          } else {
            term.results.splice(index, 1);
          }
        }
      } else {
        break;
      }
    }
    const terms = this.terms;
    if (terms[0] instanceof foundry.dice.terms.OperatorTerm) {
      terms.shift();
    }
    this._formula = this.constructor.getFormula(this.terms);
    if (this._evaluated) {
      if (this.terms.length) this._total = this._evaluateTotal();
      else this._total = 0;
    }
    return this;
  }

  async push() {
    if (!this._evaluated) await this.evaluate();
    if (!this.pushable) return this;
    this.terms.forEach(t => t instanceof YearZeroDie ? t.push() : t);
    this._evaluated = false;
    await this.evaluate();
    return this;
  }

  async getTooltip() {
    const parts = this.dice.map(d => d.getTooltipData())
      .sort((a, b) => {
        const sorts = CONFIG?.YZUR?.Chat?.diceSorting || YZUR.Chat.diceSorting || [];
        if (!sorts.length) return 0;
        const at = sorts.indexOf(a.type);
        const bt = sorts.indexOf(b.type);
        return at - bt;
      });

    if (this.pushed) {
      for (const part of parts) {
        const matrix = [];
        const n = part.number;
        let p = this.pushCount;
        for (; p >= 0; p--) matrix[p] = new Array(n).fill(undefined);

        let currentIndex = -1;
        for (const r of part.rolls) {
          currentIndex++;
          const row = r.row || 0;
          const col = r.col ?? (currentIndex % n);
          matrix[row][col] = r;
        }
        part.rolls = matrix;
      }
    }
    return foundry.applications.handlebars.renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
      parts,
      pushed: this.pushed,
      pushCounts: this.pushed
        ? [...Array(this.pushCount + 1).keys()].sort((a, b) => b - a)
        : undefined,
      config: CONFIG.YZUR ?? {},
      options: this.options,
    });
  }

  async getRollInfos(template = null) {
    template = template ?? CONFIG.YZUR?.Roll?.infosTemplate;
    const context = { roll: this };
    return foundry.applications.handlebars.renderTemplate(template, context);
  }

  async render(chatOptions = {}) {
    chatOptions = foundry.utils.mergeObject({
      user: game.user.id,
      flavor: this.name,
      template: this.constructor.CHAT_TEMPLATE,
      blind: false,
    }, chatOptions);
    const isPrivate = chatOptions.isPrivate;

    if (!this._evaluated) await this.evaluate();

    if (this.options.description && isPrivate) {
      this.options.description = null;
    }

    const chatData = {
      formula: isPrivate ? '???' : this._formula,
      flavor: isPrivate ? null : chatOptions.flavor,
      user: chatOptions.user,
      tooltip: isPrivate ? '' : await this.getTooltip(),
      total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
      success: isPrivate ? '?' : this.successCount,
      baseSuccessQty: isPrivate ? '?' : this.baseSuccessQty,
      showInfos: isPrivate ? false : CONFIG.YZUR?.Chat?.showInfos,
      infos: isPrivate ? null : await this.getRollInfos(chatOptions.infosTemplate),
      pushable: isPrivate ? false : this.pushable,
      options: chatOptions,
      isPrivate,
      roll: this,
    };

    return foundry.applications.handlebars.renderTemplate(chatOptions.template, chatData);
  }

  async toMessage(messageData = {}, { rollMode = null, create = true } = {}) {
    messageData = foundry.utils.mergeObject({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: this.total,
      type: this.rolls,
    }, messageData);
    return await super.toMessage(messageData, { rollMode, create });
  }

  duplicate() {
    return this.constructor.fromData(this.toJSON());
  }
}

class YearZeroRollManager {
  constructor() {
    throw new SyntaxError(`YZUR | ${this.constructor.name} cannot be instanciated!`);
  }

  static register(yzGame, config, options = {}) {
    YearZeroRollManager._overrideDiceTermFromData();
    YearZeroRollManager.registerConfig(config);
    YearZeroRollManager._initialize(yzGame);
    YearZeroRollManager.registerDice(yzGame, options?.index);
    console.log('YZUR | Registration complete!');
  }

  static registerConfig(config) {
    CONFIG.YZUR = foundry.utils.mergeObject(YZUR, config);
  }

  static registerDice(yzGame, i) {
    if (!yzGame || typeof yzGame !== 'string') {
      throw new SyntaxError('YZUR | A game must be specified for the registration.');
    }
    if (!YearZeroRollManager.GAMES.includes(yzGame)) {
      if (!YearZeroRollManager.DIE_TERMS_MAP[yzGame]) {
        YearZeroRollManager.DIE_TERMS_MAP[yzGame] = [];
      }
    }
    const diceTypes = YearZeroRollManager.DIE_TERMS_MAP[yzGame];
    for (const type of diceTypes) YearZeroRollManager.registerDie(type);
    YearZeroRollManager.registerRoll(undefined, i);
  }

  static registerRoll(cls = YearZeroRoll, i = 0) {
    CONFIG.Dice.rolls[i] = cls;
    CONFIG.Dice.rolls[i].CHAT_TEMPLATE = CONFIG.YZUR.Roll.chatTemplate;
    CONFIG.Dice.rolls[i].TOOLTIP_TEMPLATE = CONFIG.YZUR.Roll.tooltipTemplate;
    CONFIG.YZUR.Roll.index = i;
    if (i > 0) YearZeroRollManager._overrideRollCreate(i);
  }

  static registerDie(term) {
    const cls = CONFIG.YZUR.Dice.DIE_TERMS[term];
    if (!cls) throw new DieTermError(term);
    const deno = cls.DENOMINATION;
    if (!deno) {
      throw new SyntaxError(`YZUR | Undefined DENOMINATION for "${cls.name}".`);
    }
    CONFIG.Dice.terms[deno] = cls;
    if (CONFIG.Dice.fulfillment?.dice) {
      CONFIG.Dice.fulfillment.dice[deno] = { label: `d${deno}`, icon: '<i class="fa-solid fa-dice"></i>' };
    }
  }

  static _initialize(yzGame) {
    if (!CONFIG.YZUR) throw new ReferenceError('YZUR | CONFIG.YZUR does not exists!');
    CONFIG.YZUR.game = yzGame;
  }

  static _overrideDiceTermFromData() {
    foundry.dice.terms.DiceTerm.prototype.constructor.fromData = function (data) {
      let cls = CONFIG.Dice.termTypes?.[data.class];
      if (!cls) {
        const termkeys = Object.keys(CONFIG.Dice.terms);
        const stringifiedFaces = String(data.faces);
        if (data.class === 'Die' && termkeys.includes(stringifiedFaces)) {
          cls = CONFIG.Dice.terms[stringifiedFaces];
          data.class = cls.name;
        } else {
          cls = Object.values(CONFIG.Dice.terms).find(c => c.name === data.class) || foundry.dice.terms.Die;
        }
      }
      return cls._fromData(data);
    };
  }

  static _overrideRollCreate(index = 1) {
    Roll.prototype.constructor.create = function (formula, data = {}, options = {}) {
      const isYZURFormula = options.yzur ?? (
        'game' in data ||
        'maxPush' in data ||
        'game' in options ||
        'maxPush' in options ||
        formula.match(/\d*d(:?[bsngzml]|6|8|10|12)/i)
      );
      const n = isYZURFormula ? index : 0;
      const cls = CONFIG.Dice.rolls[n];
      return new cls(formula, data, options);
    };
  }
}

YearZeroRollManager.DIE_TERMS_MAP = {
  'yze': ['base', 'skill', 'gear', 'neg', 'stress', 'ammo', 'a', 'b', 'c', 'd'],
};

Object.defineProperty(YearZeroRollManager, 'GAMES', {
  get: () => Object.keys(YearZeroRollManager.DIE_TERMS_MAP),
});

export { YZUR, YearZeroDice, YearZeroRoll, YearZeroRollManager };
