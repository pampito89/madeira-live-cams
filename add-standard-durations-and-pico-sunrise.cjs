const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'pages', 'trip-plan.tsx');
let source = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    throw new Error(`Could not find ${label}. No changes were saved.`);
  }
  source = source.replace(before, after);
}

replaceOnce(
  'const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240];',
  `const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240];

const standardLocationDurations: Record<string, number> = {
  'pico-do-arieiro': 150,
  'fanal-forest': 120,
  'praia-do-porto-do-seixal': 120,
  'machico-beach': 150,
  'faja-dos-padres': 240,
  'calheta-beach': 180,
  'prainha-do-canical': 180,
  'porto-moniz-natural-pools': 150,
  'ribeira-da-janela': 30,
  funchal: 90,
  'mercado-dos-lavradores': 30,
  'cristo-rei': 45,
  'pico-do-facho': 30,
  'cabo-girao-skywalk': 30,
  'anjos-waterfall': 30,
  'miradouro-do-guindaste': 30,
  'levada-nova-levada-do-moinho': 150,
  'monte-palace-tropical-garden': 120,
  'santana-typical-houses': 15,
  'ponta-de-sao-lourenco': 180,
};`,
  'the duration options',
);

replaceOnce(
  '        durationMinutes: isMadeiraAirport ? 15 : 90,',
  `        durationMinutes: isMadeiraAirport
          ? 15
          : standardLocationDurations[selectedSlug] ?? 90,`,
  'the default location duration',
);

replaceOnce(
  '    stops.forEach((stop) => {',
  '    stops.forEach((stop, index) => {',
  'the programme stop loop',
);

const oldLocationOutput = "      const icon = location.tags.includes('Beaches') ? '🏖️' : location.tags.includes('Hiking') ? '🌿' : '📍';\n      lines.push(`${icon} ${stop.arrivalTime}–${endTime} — ${location.name}.`, `https://madeiralivecams.com/${locale}/explore/${location.slug}`, '');";
const newLocationOutput = `      const icon = location.tags.includes('Beaches') ? '🏖️' : location.tags.includes('Hiking') ? '🌿' : '📍';
      const sunriseSuffix =
        index === 0 && location.slug === 'pico-do-arieiro'
          ? locale === 'uk'
            ? ' Зустрічаємо схід сонця + прогулянка по маршруту PR1 – Vereda do Areeiro до Miradouro da Pedra Rija.'
            : ' Sunrise viewing plus a walk on PR1 – Vereda do Areeiro to Miradouro da Pedra Rija.'
          : '';
      lines.push(
        \`${'${icon}'} ${'${stop.arrivalTime}'}–${'${endTime}'} — ${'${location.name}'}.\${sunriseSuffix}\`,
        \`https://madeiralivecams.com/${'${locale}'}/explore/${'${location.slug}'}\`,
        '',
      );`;
replaceOnce(oldLocationOutput, newLocationOutput, 'the normal location programme output');

fs.writeFileSync(filePath, source, 'utf8');
console.log('Updated pages/trip-plan.tsx.');
console.log('Standard durations are active, and the Pico do Arieiro sunrise note appears only when it is route stop number 1.');
