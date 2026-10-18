// Menjaga import relatif tetap cocok persis dengan nama file.
// Windows tidak peduli huruf besar/kecil, Linux (Vercel) peduli — ini penjaganya.

const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || '.');
const dirs = ['pages', 'components', 'lib', 'scripts'];
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
}

for (const dir of dirs) {
  const full = path.join(root, dir);
  if (fs.existsSync(full)) walk(full);
}

function exactExists(target) {
  const dir = path.dirname(target);
  const base = path.basename(target);
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch (e) {
    return false;
  }
  return entries.includes(base);
}

function resolves(request, fromFile) {
  const base = path.resolve(path.dirname(fromFile), request);
  const candidates = [base, base + '.js', base + '.js.js', path.join(base, 'index.js')];
  for (const candidate of candidates) {
    if (exactExists(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

let problems = 0;
const pattern = /(?:from|require\()\s*'(\.[^']+)'/g;

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = pattern.exec(source))) {
    const request = match[1];
    if (resolves(request, file)) continue;

    problems += 1;
    const dir = path.dirname(path.resolve(path.dirname(file), request));
    const base = path.basename(request);
    let entries = [];
    try {
      entries = fs.readdirSync(dir);
    } catch (e) {}
    const near = entries.filter(name => name.toLowerCase() === base.toLowerCase());

    console.log(`MASALAH  ${path.relative(root, file)}  ->  ${request}`);
    console.log(`         nama mirip di folder: ${near.length ? near.join(', ') : '(tidak ada)'}`);
  }
}

console.log(
  problems === 0
    ? 'OK: semua import relatif cocok persis dengan nama file.'
    : `Total masalah: ${problems}`
);
process.exit(problems === 0 ? 0 : 1);
