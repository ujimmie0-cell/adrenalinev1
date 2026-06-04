/**
 * ARCVAULT — Manifest Generator
 * ─────────────────────────────
 * Run this from the root of your site (where index.html lives):
 *
 *   node generate-manifest.js
 *
 * It will scan every subfolder inside ./games/, read data.json,
 * and write games/manifest.json that the site reads automatically.
 *
 * Requirements: Node.js 14+
 */

const fs   = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, 'games');
const OUT_FILE  = path.join(GAMES_DIR, 'manifest.json');

if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR);
  console.log('Created games/ directory.');
}

const entries = [];
const folders = fs.readdirSync(GAMES_DIR).filter(f => {
  const full = path.join(GAMES_DIR, f);
  return fs.statSync(full).isDirectory();
});

for (const folder of folders) {
  const dataPath = path.join(GAMES_DIR, folder, 'data.json');
  if (!fs.existsSync(dataPath)) {
    console.warn(`  ⚠ Skipping "${folder}" — no data.json found`);
    continue;
  }
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    // Ensure the id matches the folder name
    data.id = folder;
    entries.push(data);
    console.log(`  ✓ ${folder} — "${data.title}"`);
  } catch (e) {
    console.error(`  ✗ Error reading ${folder}/data.json:`, e.message);
  }
}

// Sort newest first by default
entries.sort((a, b) => (b.added || '').localeCompare(a.added || ''));

fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2));
console.log(`\nWrote manifest.json with ${entries.length} game(s).`);