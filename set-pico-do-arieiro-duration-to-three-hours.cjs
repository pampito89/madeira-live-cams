const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'pages', 'trip-plan.tsx');
let source = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const before = "  'pico-do-arieiro': 150,";
const after = "  'pico-do-arieiro': 180,";

if (!source.includes(before)) {
  throw new Error('Could not find the Pico do Arieiro standard duration. No changes were saved.');
}

source = source.replace(before, after);
fs.writeFileSync(filePath, source, 'utf8');
console.log('Updated pages/trip-plan.tsx.');
console.log('Pico do Arieiro now defaults to 3 hours.');
