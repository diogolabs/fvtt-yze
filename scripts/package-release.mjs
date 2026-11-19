#!/usr/bin/env node
/**
 * Builds Foundry VTT release artifacts (system.json + system.zip) for a given tag.
 * Usage: node scripts/package-release.mjs <tag> [outDir]
 * Example: node scripts/package-release.mjs v1.1.0 dist-release
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const tag = process.argv[2];
const outDir = path.resolve(process.argv[3] || "dist-release");

if (!tag) {
  console.error("Usage: node scripts/package-release.mjs <tag> [outDir]");
  process.exit(1);
}

const version = tag.replace(/^v/, "");
const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const repoUrl = manifest.url.replace(/\/+$/, "");

manifest.version = version;
manifest.download = `${repoUrl}/releases/download/${tag}/system.zip`;
manifest.flags = {};

const stageRoot = path.join(outDir, "_stage", manifest.id);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(stageRoot, { recursive: true });

const entries = [
  "LICENSE.txt",
  "README.md",
  "CHANGELOG.md",
  "assets",
  "css",
  "lang",
  "lib",
  "module",
  "templates",
];

for (const entry of entries) {
  fs.cpSync(entry, path.join(stageRoot, entry), { recursive: true });
}

const manifestText = JSON.stringify(manifest, null, 2) + "\n";
fs.writeFileSync(path.join(stageRoot, "system.json"), manifestText);
fs.writeFileSync(path.join(outDir, "system.json"), manifestText);

execFileSync("zip", ["-rq", path.join(outDir, "system.zip"), manifest.id], {
  cwd: path.join(outDir, "_stage"),
  stdio: "inherit",
});

fs.rmSync(path.join(outDir, "_stage"), { recursive: true, force: true });
console.log(`Built ${path.join(outDir, "system.json")} and ${path.join(outDir, "system.zip")} (${version})`);
