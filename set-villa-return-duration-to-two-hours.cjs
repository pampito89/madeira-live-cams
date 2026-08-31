const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'pages', 'trip-plan.tsx');
let source = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const before = `        id: \`villa-\${Date.now()}\`,
        type: 'villa',
        arrivalTime: getNextArrivalTime(),
        durationMinutes: 30,`;

const after = `        id: \`villa-\${Date.now()}\`,
        type: 'villa',
        arrivalTime: getNextArrivalTime(),
        durationMinutes: 120,`;

if (!source.includes(before)) {
  throw new Error('Could not find the scheduled villa-return duration. No changes were saved.');
}

source = source.replace(before, after);
fs.writeFileSync(filePath, source, 'utf8');
console.log('Updated pages/trip-plan.tsx.');
console.log('A newly added villa-return stop now defaults to 2 hours.');
