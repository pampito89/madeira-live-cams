const fs = require('fs');
const path = require('path');

function findLocationsFile(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isFile() && entry.name === 'locations.ts') return fullPath;
    if (entry.isDirectory()) {
      const found = findLocationsFile(fullPath);
      if (found) return found;
    }
  }
  return null;
}

const filePath = findLocationsFile(process.cwd());
if (!filePath) {
  throw new Error('Could not find locations.ts below the current project folder. No changes were saved.');
}

let source = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const updates = [
  ['pico-do-arieiro', 'PR1 – Vereda do Areeiro'],
  ['pico-ruivo', 'PR1.2 – Vereda do Pico Ruivo'],
  ['ponta-de-sao-lourenco', 'PR8 – Vereda da Ponta de São Lourenço'],
  ['pico-grande', 'PR12 – Caminho Real da Encumeada (Pico Grande)'],
];

for (const [slug, newName] of updates) {
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `(slug:\\s*'${escapedSlug}'\\s*,[\\s\\S]*?name:\\s*)\\{[\\s\\S]*?\\}(\\s*,\\s*area:)`,
  );
  const match = source.match(pattern);

  if (!match) {
    throw new Error(`Could not find the name field for slug "${slug}" in ${filePath}. No changes were saved.`);
  }

  source = source.replace(
    pattern,
    `${match[1]}{\n      en: '${newName}',\n      uk: '${newName}',\n    }${match[2]}`,
  );
}

fs.writeFileSync(filePath, source, 'utf8');
console.log(`Updated ${path.relative(process.cwd(), filePath)}.`);
console.log('Renamed PR1, PR1.2, PR8, and Pico Grande via PR12 without changing slugs or URLs.');
