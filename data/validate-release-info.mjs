import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../src/release-info.json', import.meta.url), 'utf8'));
const history = manifest.history;
if (!manifest.version || !manifest.commit || !manifest.releaseUrl || !manifest.codeName || !manifest.photoUrl) throw new Error('Current release metadata is incomplete.');
if (!Array.isArray(history) || history.length < 2) throw new Error('Release history is incomplete.');
const versions = history.map((entry) => entry.version);
if (new Set(versions).size !== versions.length) throw new Error('Release history contains duplicate versions.');
const codeNames = history.map((entry) => entry.codeName).filter(Boolean);
if (new Set(codeNames).size !== codeNames.length) throw new Error('Release history reuses a dim-sum code name.');
for (const entry of [{ ...manifest }, ...history]) {
  if (!/^[0-9a-f]{40}$/i.test(entry.commit)) throw new Error(`Invalid commit SHA for ${entry.version}.`);
  if (!/^https:\/\/github\.com\/Ding-Ding-Projects\/dim-sum-atlas\/releases\/tag\/v/.test(entry.releaseUrl)) throw new Error(`Invalid release URL for ${entry.version}.`);
  if (entry.codeName && !/^.+ · .+$/.test(entry.codeName)) throw new Error(`Code name is not bilingual for ${entry.version}.`);
}
if (manifest.version !== history.at(-1).version || manifest.commit !== history.at(-1).commit) throw new Error('Current release does not match the newest history entry.');
console.log(`Validated ${history.length} release entries with unique bilingual code names.`);
