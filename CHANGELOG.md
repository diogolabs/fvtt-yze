# Changelog

## 1.1.0 (Foundry VTT v14)
- **Foundry VTT v14 Release**: Manifest compatibility targeting Foundry VTT v14 (`minimum: "14"`, `verified: "14"`), versioned download link, and full HTTPS metadata URLs (`license`, `readme`, `changelog`).
- Migrated sheet registration to `foundry.applications.apps.DocumentSheetConfig` without legacy V1 core sheet unregistration on v14.
- Native `core.messageMode` and `Roll#toMessage({ messageMode })` support with normalized modes (`public`, `gm`, `blind`, `self`).
- Fixed `YearZeroRoll#toMessage()` to remove deprecated `user`, invalid `type: this.rolls`, and numeric `content`.
- Fixed async race condition in `YearZeroDie#push()`, `YearZeroRoll#push()`, and `LocationDie#roll()`.
- Replaced deprecated `Array.prototype.filterJoin` with standard `.filter(Boolean).join(" ")`.
- Added `document-uuid` and `editable` attributes to `<prose-mirror>` elements on Actor and Item sheets.
- Fixed `YzeChatLog.DEFAULT_OPTIONS` mutation of base `ChatLog.DEFAULT_OPTIONS`.
- Fixed Cover preset selector triggering `submitOnChange` on the Actor sheet.
- Hid all `.dice-buttons` rows on chat roll cards from non-owners.
- Avoided overwriting Foundry core built-in Handlebars helpers.
- Added release packaging script (`scripts/package-release.mjs`) producing `system.json` and `system.zip` with the required `fvtt-yze/` root directory.

## 1.0.1 (Foundry VTT v13)
- **Foundry VTT v13 Release**: Manifest compatibility targeting Foundry VTT v13 (`minimum: "13"`, `verified: "13"`, `maximum: "13"`), versioned `manifest` and `download` URLs, and full HTTPS metadata URLs (`license`, `readme`, `changelog`).
- Fixed crash on Foundry VTT v13 caused by calling `game.settings.get("core", "messageMode")` instead of `core.rollMode`.
- Fixed `YearZeroRoll#toMessage()`, async push race condition in `lib/yzur.js`, `DocumentSheetConfig` sheet registration, `<prose-mirror>` attributes, `YzeChatLog.DEFAULT_OPTIONS`, Cover Roll dropdown reset, and Handlebars helper registration.
- Added release packaging script (`scripts/package-release.mjs`) producing `system.json` and `system.zip` with the required `fvtt-yze/` root directory.

## 1.0.0
- Initial release of the generic Year Zero Engine (YZE SRD v1.0) system for Foundry VTT.
- Dual resolution modes: **Dice Pool** (D6 pools) and **Step Dice** (D6, D8, D10, D12 + Advantage/Disadvantage option).
- Configurable Damage & Push rules: Health & Resolve, Attribute Damage (+ Willpower Points), Stress Dice (+ Panic Rolls), and Conditions.
- Item types: **Skill**, **Specialty**, **Gear/Consumable** (with Supply Rolls), **Weapon** (with Ammo Dice & degrading bonus/reliability), **Armor** (with Armor & Cover rolls), **Spell** (Willpower casting, Safe/Chance casting, Overcharge & Magic Mishaps), and **Critical Injury** (with D66 Physical/Mental & D12 Vehicle Crit generators).
- Actor types: **Character**, **NPC**, and **Vehicle**.
- Minimalist UI built on Foundry VTT ApplicationV2 / ActorSheetV2 / ItemSheetV2 and TypeDataModel.
- Bilingual support (`en` and `pt-BR`).
