// Canvas work for pad.py, with sharp from the site's worktree.
// prepare <photo> <workPrefix> <geometry>: canvas.png (photo shrunk, margins filled with a blurred edge extension) + mask.png
// finish <photo> <workPrefix> <geometry> <out.jpg>: pastes the shrunk photo back over the model's output with a feathered edge
import { createRequire } from 'node:module';
const sharp = createRequire('/Users/teddyadmin/Startup/Website-worktrees/astro-site/package.json')('sharp');
const [, , step, photo, prefix, geo, out] = process.argv;
const { canvas: [W, H], height, top, feather } = JSON.parse(geo);
const meta = await sharp(photo).metadata();
const h = Math.round(H * height), w = Math.round(meta.width * h / meta.height);
const left = Math.round((W - w) / 2);
const shrunk = await sharp(photo).resize(w, h).toBuffer();
const extended = await sharp(shrunk).extend({ top, bottom: H - top - h, left, right: W - left - w, extendWith: 'copy' }).blur(40).toBuffer();
if (step === 'prepare') {
  await sharp(extended).composite([{ input: shrunk, left, top }]).png().toFile(`${prefix}-canvas.png`);
  // Opaque where the photo stays; transparent (to be painted) in the margins and a thin band inside the photo's border.
  const keep = await sharp({ create: { width: w - 2 * feather, height: h - 2 * feather, channels: 4, background: '#fff' } }).png().toBuffer();
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: keep, left: left + feather, top: top + feather }]).png().toFile(`${prefix}-mask.png`);
} else {
  // Paste back the original with a soft alpha ramp over the feather band, so the person is pixel-identical.
  const ramp = Buffer.from(`<svg width="${w}" height="${h}"><defs><filter id="b"><feGaussianBlur stdDeviation="${feather / 2.5}"/></filter></defs><rect x="${feather}" y="${feather}" width="${w - 2 * feather}" height="${h - 2 * feather}" fill="#fff" filter="url(#b)"/></svg>`);
  const alpha = await sharp(ramp).extractChannel(0).toBuffer();
  const soft = await sharp(shrunk).joinChannel(alpha).png().toBuffer();
  await sharp(`${prefix}-model.png`).resize(W, H).composite([{ input: soft, left, top }]).jpeg({ quality: 92 }).toFile(out);
}
