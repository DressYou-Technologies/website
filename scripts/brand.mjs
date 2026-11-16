// Writes the site's brand images from the logo kit: the wordmark alone for the header, cut pixel for pixel from the full
// logo, and for the footer the symbol beside the wordmark at the height of its letters (founder, 2026-11-16).
// The kit has no vector file and its largest export blurs across a footer, so the footer's wordmark is traced from that
// export (potrace) and its symbol, which is shaded, comes from the kit's largest icon. Replace both with the designer's
// vector file when there is one.
// node scripts/brand.mjs <kit>      (needs potrace: brew install potrace)
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const [, , kit] = process.argv;
const SIZE = 2048;         // the kit's largest logo export
const ICON_SIZE = 1024;    // the kit's largest icon export
const INK_ALPHA = 24;      // alpha above this is the logo, below it the export's edge noise
const TRACE_SCALE = 4;     // the wordmark is enlarged this much before tracing, so its soft edge becomes a smooth outline
const HALF_ALPHA = 128;    // the traced outline runs where the export's edge is half opaque
const EDGE_BLUR = 3;       // sigma, in enlarged pixels: evens the export's grainy edge without moving it
const CURVE_TOLERANCE = 1; // potrace joins curve segments within this error, in enlarged pixels: fewer, longer curves
const SYMBOL_QUALITY = 90; // WebP quality of the symbol inside the footer logo
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
  const [symbol, first, ...rest] = runs;
  const last = rest[rest.length - 1];
  // The first letter, d, runs from the ascender line to the baseline: the height the footer gives the symbol.
  return { file, symbol: box(symbol.left, symbol.right), letter: box(first.left, first.right), wordmark: box(first.left, last.right), gap: first.left - symbol.right - 1 };
}

for (const tone of ['blanc', 'noir']) {
  const { file, wordmark } = await read(tone);
  const name = `${OUT}/wordmark-${tone === 'blanc' ? 'white' : 'black'}.png`;
  await sharp(file).extract(wordmark).png().toFile(name);
  console.log(name, `${wordmark.width}x${wordmark.height}`);
}

const { file, symbol, letter, wordmark, gap } = await read('blanc');
const scale = letter.height / symbol.height;
const markWidth = Math.round(symbol.width * scale), markGap = Math.round(gap * scale);

// The wordmark's outline: its alpha enlarged, cut at half, traced. potrace reads a bitmap whose 1 bits are the shape.
const big = { width: wordmark.width * TRACE_SCALE, height: wordmark.height * TRACE_SCALE };
const alpha = await sharp(file).extract(wordmark).extractChannel('alpha').resize({ ...big, kernel: 'cubic' }).blur(EDGE_BLUR).raw().toBuffer();
const rowBytes = Math.ceil(big.width / 8), bits = Buffer.alloc(rowBytes * big.height);
for (let y = 0; y < big.height; y++) for (let x = 0; x < big.width; x++) if (alpha[y * big.width + x] >= HALF_ALPHA) bits[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
const traced = execFileSync('potrace', ['--svg', '--opttolerance', String(CURVE_TOLERANCE), '--output', '-'], { input: Buffer.concat([Buffer.from(`P4\n${big.width} ${big.height}\n`), bits]), maxBuffer: 1 << 26 }).toString();
const outline = traced.match(/<g transform="([^"]+)"[^>]*>([\s\S]*?)<\/g>/);
if (!outline) throw new Error('potrace drew no outline');

// The symbol: the icon's ink, as large as the kit has it.
const iconFile = `${kit}/1-icone/png-transparent/dressyou-icone-blanc-${ICON_SIZE}.png`;
const icon = (await pixels(iconFile)).box(0, ICON_SIZE - 1);
const mark = await sharp(iconFile).extract(icon).webp({ quality: SYMBOL_QUALITY, alphaQuality: 100 }).toBuffer();

// The symbol stands on the baseline, as tall as the d; the wordmark keeps the logo's own size. Units are the logo's pixels.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${markWidth + markGap + wordmark.width} ${wordmark.height}" width="${markWidth + markGap + wordmark.width}" height="${wordmark.height}">
<image href="data:image/webp;base64,${mark.toString('base64')}" x="0" y="${letter.top - wordmark.top}" width="${markWidth}" height="${letter.height}" preserveAspectRatio="none"/>
<g transform="translate(${markWidth + markGap}) scale(${1 / TRACE_SCALE})" fill="#fff"><g transform="${outline[1]}">${outline[2].trim()}</g></g>
</svg>
`;
writeFileSync(`${OUT}/lockup-white.svg`, svg);
console.log(`${OUT}/lockup-white.svg`, `symbol ${markWidth}x${letter.height} from ${icon.width}x${icon.height}, gap ${markGap}, ${svg.length} bytes`);
