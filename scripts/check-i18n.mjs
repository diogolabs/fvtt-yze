#!/usr/bin/env node
/**
 * Validates that every language file in lang/*.json has 100% key parity with lang/en.json
 * and that all static i18n keys referenced in module/ and templates/ exist in every language.
 * Usage: node scripts/check-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";

function flattenKeys(obj, prefix = "") {
  const keys = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const nested of flattenKeys(v, full)) keys.add(nested);
    } else {
      keys.add(full);
    }
  }
  return keys;
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const langFiles = fs.readdirSync("lang").filter(f => f.endsWith(".json")).sort();
const langs = {};
for (const f of langFiles) {
  langs[f] = flattenKeys(JSON.parse(fs.readFileSync(path.join("lang", f), "utf8")));
}

const baseKeys = langs["en.json"];
let errors = 0;

for (const [file, keys] of Object.entries(langs)) {
  if (file === "en.json") continue;
  const missing = [...baseKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !baseKeys.has(k));
  if (missing.length) {
    console.error(`[${file}] Missing ${missing.length} key(s):`, missing);
    errors++;
  }
  if (extra.length) {
    console.error(`[${file}] Extra ${extra.length} key(s):`, extra);
    errors++;
  }
}

// Verify static i18n keys in module/ and templates/
const usedKeys = new Set();
for (const dir of ["module", "templates"]) {
  for (const f of walk(dir)) {
    if (!/\.(mjs|js|hbs)$/.test(f)) continue;
    const txt = fs.readFileSync(f, "utf8");
    for (const m of txt.matchAll(/(?:localize|format)\s*\(\s*["']((?:YZE|TYPES|YZUR)\.[A-Za-z0-9_.]+)["']/g)) {
      usedKeys.add(m[1]);
    }
    for (const m of txt.matchAll(/\{\{localize\s+["']((?:YZE|TYPES|YZUR)\.[A-Za-z0-9_.]+)["']\}\}/g)) {
      usedKeys.add(m[1]);
    }
    for (const m of txt.matchAll(/["']((?:YZE|TYPES|YZUR)\.[A-Za-z0-9_.]+)["']/g)) {
      if (f.endsWith("config.mjs") || f.endsWith("settings.mjs") || f.endsWith("rules-config.mjs") || f.endsWith("roll-dialog.mjs") || f.endsWith("spell-dialog.mjs")) {
        usedKeys.add(m[1]);
      }
    }
  }
}

for (const [file, keys] of Object.entries(langs)) {
  const missingUsed = [...usedKeys].filter(k => !keys.has(k));
  if (missingUsed.length) {
    console.error(`[${file}] Missing referenced key(s):`, missingUsed);
    errors++;
  }
}

if (errors > 0) {
  process.exit(1);
}

console.log(`i18n check PASSED (${langFiles.join(", ")} — ${baseKeys.size} keys each, ${usedKeys.size} static references verified).`);
