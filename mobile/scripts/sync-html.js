const fs = require('fs');
const path = require('path');

const rootHtml = path.resolve(__dirname, '..', '..', 'index.html');
const outFile = path.resolve(__dirname, '..', 'src', 'simulatorHtml.js');

if (!fs.existsSync(rootHtml)) {
  if (fs.existsSync(outFile)) {
    console.warn('[sync-html] Root index.html not found; keeping existing src/simulatorHtml.js');
    process.exit(0);
  }
  console.error('[sync-html] Root index.html not found and no generated module exists.');
  process.exit(1);
}

const html = fs.readFileSync(rootHtml, 'utf8');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `export default ${JSON.stringify(html)};\n`, 'utf8');
console.log(
  `[sync-html] Wrote ${path.relative(process.cwd(), outFile)} from ${path.relative(
    process.cwd(),
    rootHtml,
  )} (${html.length} chars)`,
);
