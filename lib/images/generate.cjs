const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getMetadata, processBuffer } = require('next/dist/server/lib/squoosh/main');
// Run from the project root. Originals stay intact; hashes keep URLs cache-safe.
async function main() {
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const name = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walk(name) : [name];
  });
  const files = walk('public/images').filter(name => /\.(jpg|jpeg|png|webp)$/i.test(name)
    && !name.includes('/optimized/') && !name.includes('/car-rental/')
    && name !== 'public/images/locations-sao-lourenco.png');
  const manifest = {};
  const report = [];
  for (const file of files) {
    const input = fs.readFileSync(file);
    const meta = await getMetadata(input);
    const source = file.slice('public'.length);
    const relative = file.slice('public/images/'.length).replace(/\.[^.]+$/, '');
    const hash = crypto.createHash('sha256').update(input).update('webp-80-v1').digest('hex').slice(0, 10);
    const widths = [...new Set([320, 640, 960, 1440].map(w => Math.min(w, meta.width)))];
    const variants = [];
    const sizes = [];
    for (const width of widths) {
      const output = await processBuffer(input, [{ type: 'resize', width }], 'webp', 80);
      const url = `/images/optimized/${relative}-${hash}-${width}.webp`;
      fs.mkdirSync(path.dirname(`public${url}`), { recursive: true });
      fs.writeFileSync(`public${url}`, output);
      variants.push({ width, src: url });
      sizes.push(output.length);
    }
    // Original photo URLs also appear in social metadata: keep at least 640px
    // where available. Detail pages select larger files through the loader.
    const defaultWidth = source.includes('/explore/') ? 640 : source.includes('/events/') ? 960 : 1440;
    const index = variants.findIndex(v => v.width >= Math.min(defaultWidth, meta.width));
    manifest[source] = { src: variants[index].src, variants };
    report.push({ source, original: input.length, optimized: sizes[index], width: variants[index].width });
  }
  fs.writeFileSync('data/optimized-images.json', JSON.stringify(manifest, null, 2) + '\n');
  fs.mkdirSync('backups/site-image-optimization', { recursive: true });
  fs.writeFileSync('backups/site-image-optimization/report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ count: report.length, original: report.reduce((n, r) => n + r.original, 0), optimized: report.reduce((n, r) => n + r.optimized, 0) }, null, 2));
}
main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
