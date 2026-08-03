const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { pathToFileURL } = require('url');
const { spawn, spawnSync } = require('child_process');
const https = require('https');

const PUBLIC_CATALOG_URL = 'https://raw.githubusercontent.com/Ding-Ding-Projects/dim-sum-photos/main/catalog/index.json';
const PUBLIC_RELEASES_URL = 'https://api.github.com/repos/Ding-Ding-Projects/dim-sum-photos/releases?per_page=100';
const PUBLIC_ASSET_PREFIX = 'https://github.com/Ding-Ding-Projects/dim-sum-photos/releases/download/';
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 680,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#101414',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Dim-Sum-Atlas/0.1', Accept: 'application/vnd.github+json' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) return getJson(response.headers.location).then(resolve, reject);
      if (response.statusCode !== 200) return reject(new Error(`Public dim-sum source returned HTTP ${response.statusCode}.`));
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
    }).on('error', reject);
  });
}

function cachePath(name) { return path.join(app.getPath('userData'), name); }
function readJsonFile(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJsonFile(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }

ipcMain.handle('catalog:read', async () => {
  const catalogCache = cachePath('catalog-cache.json');
  try {
    const [catalog, releases] = await Promise.all([getJson(PUBLIC_CATALOG_URL), getJson(PUBLIC_RELEASES_URL)]);
    const assets = new Map();
    for (const release of releases) {
      if (release.draft || !/^catalog-v1(?:-part-\d+)?$/u.test(release.tag_name)) continue;
      for (const asset of release.assets || []) if (/\.png$/iu.test(asset.name)) assets.set(asset.name, asset.browser_download_url);
    }
    const prepared = { ...catalog, sourceUrl: PUBLIC_CATALOG_URL, sourceMode: 'public-catalog', dishes: (catalog.dishes || []).map((dish) => ({ ...dish, image: dish.image ? { ...dish.image, releaseUrl: assets.get(path.basename(dish.image.path)) || null } : dish.image })) };
    writeJsonFile(catalogCache, prepared);
    return prepared;
  } catch (error) {
    if (fs.existsSync(catalogCache)) return { ...readJsonFile(catalogCache), sourceMode: 'offline-cache', warning: error.message };
    throw error;
  }
});

function download(url, destination) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Dim-Sum-Atlas/0.1' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) return download(response.headers.location, destination).then(resolve, reject);
      if (response.statusCode !== 200) return reject(new Error(`Image release returned HTTP ${response.statusCode}.`));
      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

ipcMain.handle('image:ensure', async (_event, { releaseUrl, relativePath }) => {
  if (!releaseUrl || !releaseUrl.startsWith(PUBLIC_ASSET_PREFIX)) throw new Error('Image source is not an approved public catalog release URL.');
  const destination = path.join(cachePath('image-cache'), path.basename(relativePath));
  if (fs.existsSync(destination)) return pathToFileURL(destination).toString();
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.download`;
  try { await download(releaseUrl, temporary); fs.renameSync(temporary, destination); return pathToFileURL(destination).toString(); }
  finally { if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true }); }
});

ipcMain.handle('window:action', (_event, action) => { if (!mainWindow) return; if (action === 'minimize') mainWindow.minimize(); else if (action === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); else if (action === 'close') mainWindow.close(); });
ipcMain.handle('history:append', (_event, entry) => { const file = cachePath('history.jsonl'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8'); return { ok: true }; });
ipcMain.handle('export:text', async (_event, { name, content }) => { const result = await dialog.showSaveDialog({ defaultPath: name || 'atlas-export.txt', filters: [{ name: 'Text', extensions: ['txt', 'json', 'md'] }] }); if (result.canceled || !result.filePath) return { canceled: true }; fs.writeFileSync(result.filePath, content, 'utf8'); return { path: result.filePath }; });
ipcMain.handle('open:vscode', async () => { const target = process.cwd(); const candidates = ['code', path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'), path.join(process.env.ProgramFiles || '', 'Microsoft VS Code', 'bin', 'code.cmd')]; for (const candidate of candidates) { try { const child = spawn(candidate, ['--new-window', target], { detached: true, windowsHide: true, stdio: 'ignore', shell: candidate.endsWith('.cmd') }); child.unref(); return { ok: true, message: 'Opened the workspace in VS Code.' }; } catch { /* try the next installed route */ } } return { ok: false, message: 'VS Code was not found. Install it or add code to PATH.' }; });

function find7z() { const candidates = [path.join(__dirname, '..', 'portable', '7z', '7z.exe'), path.join(process.env.ProgramFiles || '', '7-Zip', '7z.exe'), path.join(process.env['ProgramFiles(x86)'] || '', '7-Zip', '7z.exe'), '7z.exe']; return candidates.find((candidate) => candidate === '7z.exe' || fs.existsSync(candidate)) || null; }
function csvEscape(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
function serialize(records, format) {
  if (format === 'json') return JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2);
  if (format === 'csv') { const headers = ['id', 'name', 'cantonese', 'category', 'description', 'ingredients', 'allergens', 'fictionalOrigin', 'fictionalFacts']; return [headers.join(','), ...records.map((dish) => [dish.id, dish.name?.en, dish.name?.zhHant, dish.category, dish.description?.en, dish.ingredients?.join('; '), dish.allergens?.join('; '), dish.fiction?.origin, dish.fiction?.facts?.join(' | ')].map(csvEscape).join(','))].join('\n'); }
  if (format === 'html') return `<!doctype html><meta charset="utf-8"><title>Dim Sum Atlas export</title><h1>Dim Sum Atlas export</h1>${records.map((dish) => `<article><h2>${dish.name?.en || ''} ${dish.name?.zhHant || ''}</h2><p>${dish.description?.en || ''}</p><h3>Fictional catalog lore</h3><p>${dish.fiction?.origin || ''}</p><ul>${(dish.fiction?.facts || []).map((fact) => `<li>${fact}</li>`).join('')}</ul></article>`).join('')}`;
  if (format === 'markdown') return records.map((dish) => `## ${dish.name?.en || ''} · ${dish.name?.zhHant || ''}\n\n${dish.description?.en || ''}\n\n### Fictional catalog lore\n\n- ${dish.fiction?.origin || ''}\n${(dish.fiction?.facts || []).map((fact) => `- ${fact}`).join('\n')}\n`).join('\n');
  return records.map((dish) => `${dish.name?.en || ''} · ${dish.name?.zhHant || ''}\n${dish.description?.en || ''}\nFictional catalog lore: ${dish.fiction?.origin || ''}\n${(dish.fiction?.facts || []).join('\n')}\n`).join('\n');
}

ipcMain.handle('export:records', async (_event, { records, format = 'json', archive = null, password = '', imagesOnly = false }) => {
  if (process.platform !== 'win32') throw new Error('Exports are supported on Windows only.');
  const extension = archive === '7z' ? '7z' : archive === 'zip' ? 'zip' : format === 'markdown' ? 'md' : format;
  const chosen = await dialog.showSaveDialog({ defaultPath: `dim-sum-atlas-export.${extension}`, filters: [{ name: 'Export', extensions: [extension] }] });
  if (chosen.canceled || !chosen.filePath) return { canceled: true };
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dim-sum-atlas-'));
  try {
    const content = imagesOnly ? JSON.stringify({ exportedAt: new Date().toISOString(), imageCount: records.length, images: records.map((dish) => ({ id: dish.id, name: dish.name, image: dish.image?.path })) }, null, 2) : serialize(records, format);
    const dataFile = path.join(temporaryRoot, `dim-sum-atlas.${format === 'markdown' ? 'md' : format}`);
    fs.writeFileSync(dataFile, content, 'utf8');
    if (imagesOnly) { const imageDir = path.join(temporaryRoot, 'images'); fs.mkdirSync(imageDir); for (const record of records) if (record.image?.releaseUrl) await download(record.image.releaseUrl, path.join(imageDir, path.basename(record.image.path))); }
    if (!archive) { fs.copyFileSync(dataFile, chosen.filePath); return { path: chosen.filePath, format }; }
    if (archive === 'zip') { const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', `Compress-Archive -Path '${temporaryRoot.replaceAll("'", "''")}\\*' -DestinationPath '${chosen.filePath.replaceAll("'", "''")}' -Force`], { encoding: 'utf8' }); if (result.status !== 0) throw new Error(result.stderr || 'ZIP export failed.'); }
    else { const sevenZip = find7z(); if (!sevenZip) throw new Error('7z.exe was not found. Install 7-Zip to enable 7z exports.'); const args = ['a', chosen.filePath, path.join(temporaryRoot, '*'), '-r', '-y']; if (password) args.push(`-p${password}`, '-mhe=on'); const result = spawnSync(sevenZip, args, { encoding: 'utf8' }); if (result.status !== 0) throw new Error(result.stderr || '7z export failed.'); }
    return { path: chosen.filePath, archive, encrypted: Boolean(password) };
  } finally { fs.rmSync(temporaryRoot, { recursive: true, force: true }); }
});
ipcMain.handle('archive:capabilities', () => ({ platform: process.platform, sevenZip: Boolean(find7z()), operations: ['add', 'extract', 'list', 'test', 'update', 'delete', 'benchmark'], encryption: Boolean(find7z()) }));
ipcMain.handle('archive:run', (_event, { operation, archivePath, inputPath, outputPath, password }) => { const sevenZip = find7z(); const allowed = new Set(['add', 'extract', 'list', 'test', 'update', 'delete', 'benchmark']); if (process.platform !== 'win32' || !sevenZip || !allowed.has(operation)) throw new Error('Unsupported 7z operation or 7z.exe is unavailable.'); if (operation !== 'benchmark' && !archivePath) throw new Error('An archive path is required.'); const command = { add: 'a', extract: 'x', list: 'l', test: 't', update: 'u', delete: 'd', benchmark: 'b' }[operation]; const args = [command]; if (operation !== 'benchmark') args.push(archivePath); if (inputPath) args.push(inputPath); if (operation === 'extract' && outputPath) args.push(`-o${outputPath}`); if (password) args.push(`-p${password}`, '-mhe=on'); args.push('-y'); const result = spawnSync(sevenZip, args, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }); if (result.status !== 0) throw new Error(result.stderr || result.stdout || `7z ${operation} failed.`); return { operation, output: result.stdout, exitCode: result.status }; });

app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
