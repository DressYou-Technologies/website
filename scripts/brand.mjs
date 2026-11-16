// Writes the site's brand images from the logo kit's full logo, cut pixel for pixel (the kit forbids redrawing the symbol
// or retyping the wordmark): the wordmark alone for the header, and for the footer the symbol beside the wordmark at the
// height of its letters (founder, 2026-11-16).
// node scripts/brand.mjs <kit>/2-logo-complet/png-transparent
import sharp from 'sharp';

const [, , kit] = process.argv;
const SIZE = 2048;         // the kit's largest export
const INK_ALPHA = 24;      // alpha above this is the logo, below it the export's edge noise
const OUT = 'src/assets/brand';

async function read(tone) {
  const file = `${kit}/dressyou-logo-${tone}-${SIZE}.png`;
  const { data, info: { width, height } } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const inked = (x, y) => data[(y * width + x) * 4 + 3] > INK_ALPHA;
  const column = (x) => { for (let y = 0; y < height; y++) if (inked(x, y)) return true; return false; };
  // Runs of inked columns, left to right: the symbol, then each letter.
  const runs = [];
  for (let x = 0, start = -1; x <= width; x++) {
    const on = x < width && column(x);
    if (on && start < 0) start = x;
    if (!on && start >= 0) { runs.push({ left: start, right: x - 1 }); start = -1; }
  }
  const rows = ({ left, right }) => {
    let top = height, bottom = -1;
    for (let y = 0; y < height; y++) for (let x = left; x <= right; x++) if (inked(x, y)) { top = Math.min(top, y); bottom = Math.max(bottom, y); }
    return { left, width: right - left + 1, top, height: bottom - top + 1 };
  };
  const [symbol, first, ...rest] = runs;
  const last = rest[rest.length - 1];
  // The first letter, d, runs from the ascender line to the baseline: the height the footer gives the symbol.
  return { file, symbol: rows(symbol), letter: rows(first), wordmark: rows({ left: first.left, right: last.right }), gap: first.left - symbol.right - 1 };
}

for (const tone of ['blanc', 'noir']) {
  const { file, wordmark } = await read(tone);
  const name = `${OUT}/wordmark-${tone === 'blanc' ? 'white' : 'black'}.png`;
  await sharp(file).extract(wordmark).png().toFile(name);
  console.log(name, `${wordmark.width}x${wordmark.height}`);
}

const { file, symbol, letter, wordmark, gap } = await read('blanc');
const scale = letter.height / symbol.height;
const mark = await sharp(file).extract(symbol).resize({ height: letter.height }).png().toBuffer();
const markWidth = (await sharp(mark).metadata()).width, markGap = Math.round(gap * scale);
const word = await sharp(file).extract(wordmark).png().toBuffer();
// The symbol stands on the baseline, as tall as the d; the wordmark keeps its own size.
await sharp({ create: { width: markWidth + markGap + wordmark.width, height: wordmark.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: mark, left: 0, top: letter.top - wordmark.top }, { input: word, left: markWidth + markGap, top: 0 }])
  .png().toFile(`${OUT}/lockup-white.png`);
console.log(`${OUT}/lockup-white.png`, `symbol ${markWidth}x${letter.height}, gap ${markGap}`);
