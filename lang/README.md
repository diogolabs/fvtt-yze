# Localization / Traduções (`fvtt-yze`)

All user-facing text in `fvtt-yze` (sheets, dialogs, GM settings menu, dice previews, core skills, and roll tables: Panic, Physical/Mental Critical Injuries, Vehicle Critical Damage, and Magic Mishaps) is stored in `lang/*.json`.

## Built-in Languages
- `en.json` — English (base reference)
- `pt-BR.json` — Português (Brasil), aligned with the Brazilian Portuguese YZE SRD translation

## Option 1: Contribute a New Language Directly to `fvtt-yze`
1. Copy `lang/en.json` to `lang/<lang-code>.json` (e.g., `lang/es.json`, `lang/fr.json`, `lang/de.json`).
2. Translate all string values (preserving placeholders such as `{name}`, `{dmg}`, `{from}`, `{to}`).
3. Register the new language in `system.json` under `"languages"`:
   ```json
   {
     "lang": "es",
     "name": "Español",
     "path": "lang/es.json"
   }
   ```
4. Validate 100% key parity before opening a Pull Request:
   ```bash
   node scripts/check-i18n.mjs
   ```

## Option 2: Ship an External Translation Module (No Fork Needed)
Third-party developers can add any language to Foundry VTT without modifying `fvtt-yze` by creating a lightweight translation module (`module.json`):

```json
{
  "id": "fvtt-yze-es",
  "title": "Year Zero Engine (Generic SRD) — Español",
  "version": "1.0.0",
  "compatibility": { "minimum": "13", "verified": "14" },
  "relationships": {
    "systems": [{ "id": "fvtt-yze", "type": "system" }]
  },
  "languages": [
    {
      "lang": "es",
      "name": "Español",
      "path": "lang/es.json"
    }
  ]
}
```
Foundry VTT automatically merges the module's translation keys on top of `fvtt-yze`.
