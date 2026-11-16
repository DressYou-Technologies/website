// Writes the site's brand images from the logo kit: the wordmark alone, cut pixel for pixel from the full logo for the
// header, and traced for the footer, which shows the name without the symbol (founder, 2026-11-16, evening).
// The kit has no vector file and its largest export blurs across a footer, so the footer's wordmark is traced from that
// export (potrace). Replace it with the designer's vector file when there is one.
// node scripts/brand.mjs <kit>      (needs potrace: brew install potrace)
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const [, , kit] = process.argv;
const SIZE = 2048;         // the kit's largest logo export
const INK_ALPHA = 24;      // alpha above this is the logo, below it the export's edge noise
const TRACE_SCALE = 4;     // the wordmark is enlarged this much before tracing, so its soft edge becomes a smooth outline
const HALF_ALPHA = 128;    // the traced outline runs where the export's edge is half opaque
const EDGE_BLUR = 3;       // sigma, in enlarged pixels: evens the export's grainy edge without moving it
const CURVE_TOLERANCE = 1; // potrace joins curve segments within this error, in enlarged pixels: fewer, longer curves
const OUT = 'src/assets/brand';

const logoFile = (tone) => `${kit}/2-logo-complet/png-transparent/dressyou-logo-${tone}-${SIZE}.png`;

// The box of everything inked between two columns.
async function pixels(file) {
  const { data, info: { width, height } } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const inked = (x, y) => data[(y * width + x) * 4 + 3] > INK_ALPHA;
  const box = (left, right) => {
    let top = height, bottom = -1, first = right, last = left;
    for (let y = 0; y < height; y++) for (let x = left; x <= right; x++) if (inked(x, y)) { top = Math.min(top, y); bottom = Math.max(bottom, y); first = Math.min(first, x); last = Math.max(last, x); }
    return { left: first, width: last - first + 1, top, height: bottom - top + 1 };
  };
  return { width, height, inked, box };
}

async function read(tone) {
  const file = logoFile(tone);
  const { width, height, inked, box } = await pixels(file);
  const column = (x) => { for (let y = 0; y < height; y++) if (inked(x, y)) return true; return false; };
  // Runs of inked columns, left to right: the symbol, then each letter.
  const runs = [];
  for (let x = 0, start = -1; x <= width; x++) {
    const on = x < width && column(x);
    if (on && start < 0) start = x;
    if (!on && start >= 0) { runs.push({ left: start, right: x - 1 }); start = -1; }
  }
  const [, first, ...rest] = runs;
  return { file, wordmark: box(first.left, rest[rest.length - 1].right) };
}

for (const tone of ['blanc', 'noir']) {
  const { file, wordmark } = await read(tone);
  const name = `${OUT}/wordmark-${tone === 'blanc' ? 'white' : 'black'}.png`;
  await sharp(file).extract(wordmark).png().toFile(name);
  console.log(name, `${wordmark.width}x${wordmark.height}`);
}

const { file, wordmark } = await read('blanc');

// The wordmark's outline: its alpha enlarged, cut at half, traced. potrace reads a bitmap whose 1 bits are the shape.
const big = { width: wordmark.width * TRACE_SCALE, height: wordmark.height * TRACE_SCALE };
const alpha = await sharp(file).extract(wordmark).extractChannel('alpha').resize({ ...big, kernel: 'cubic' }).blur(EDGE_BLUR).raw().toBuffer();
const rowBytes = Math.ceil(big.width / 8), bits = Buffer.alloc(rowBytes * big.height);
for (let y = 0; y < big.height; y++) for (let x = 0; x < big.width; x++) if (alpha[y * big.width + x] >= HALF_ALPHA) bits[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
const traced = execFileSync('potrace', ['--svg', '--opttolerance', String(CURVE_TOLERANCE), '--output', '-'], { input: Buffer.concat([Buffer.from(`P4\n${big.width} ${big.height}\n`), bits]), maxBuffer: 1 << 26 }).toString();
const outline = traced.match(/<g transform="([^"]+)"[^>]*>([\s\S]*?)<\/g>/);
if (!outline) throw new Error('potrace drew no outline');

// The wordmark keeps the logo's own size. Units are the logo's pixels.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wordmark.width} ${wordmark.height}" width="${wordmark.width}" height="${wordmark.height}">
<g transform="scale(${1 / TRACE_SCALE})" fill="#fff"><g transform="${outline[1]}">${outline[2].trim()}</g></g>
</svg>
`;
writeFileSync(`${OUT}/wordmark-white.svg`, svg);
console.log(`${OUT}/wordmark-white.svg`, `${wordmark.width}x${wordmark.height}, ${svg.length} bytes`);
