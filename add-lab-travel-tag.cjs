const fs = require('fs');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'data', 'locations.ts');
let source = fs.readFileSync(filePath, 'utf8');
const recordPattern = /slug:\s*'([^']+)'[\s\S]*?tags:\s*\[([^\]]*)\],/g;
const records = [...source.matchAll(recordPattern)];

if (records.length === 0) {
  throw new Error('No location records with tags were found in data/locations.ts.');
}

let updated = 0;
let picoRuivoFound = false;

source = source.replace(recordPattern, (record, slug, tagsText) => {
  if (slug === 'pico-ruivo') {
    picoRuivoFound = true;
    return record;
  }

  const tags = tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!tags.includes("'Lab Travel'")) {
    tags.push("'Lab Travel'");
    updated += 1;
  }

  return record.replace(/tags:\s*\[[^\]]*\],/, `tags: [${tags.join(', ')}],`);
});

if (!picoRuivoFound) {
  throw new Error('The pico-ruivo record was not found. No file was written.');
}

fs.writeFileSync(filePath, source, 'utf8');
console.log(`Done: added Lab Travel to ${updated} location tag lists. Pico Ruivo was left unchanged.`);
