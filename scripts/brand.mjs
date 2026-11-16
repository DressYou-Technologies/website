// Writes the header's wordmark from the logo kit: the letters alone, cut pixel for pixel from the full logo.
// node scripts/brand.mjs <kit>
import sharp from 'sharp';

const [, , kit] = process.argv;
const SIZE = 2048;         // the kit's largest logo export
const INK_ALPHA = 24;      // alpha above this is the logo, below it the export's edge noise
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
