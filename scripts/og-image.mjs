// Writes public/og-image.jpg: five wall people on the night background above the white logo.
// node scripts/og-image.mjs
import sharp from 'sharp';
import { WALL } from '../src/data/site.ts';

const WIDTH = 1200, HEIGHT = 630, BACKGROUND = '#0a0a0b';
const TILE_W = 200, TILE_H = 400, GAP = 24, TOP = 56, RADIUS = 14, LOGO_W = 300;
const people = WALL.map((column) => column[0]).filter((id) => id.startsWith('wall-')).slice(0, 5);
const mask = Buffer.from(`<svg width="${TILE_W}" height="${TILE_H}"><rect width="${TILE_W}" height="${TILE_H}" rx="${RADIUS}"/></svg>`);
const left = (WIDTH - (people.length * TILE_W + (people.length - 1) * GAP)) / 2;

const tiles = await Promise.all(people.map(async (id, i) => ({
  input: await sharp(`src/assets/people/${id}.jpg`).resize(TILE_W, TILE_H, { fit: 'cover', position: 'top' })
    .composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer(),
  left: Math.round(left + i * (TILE_W + GAP)),
  top: TOP,
})));
const logo = await sharp('src/assets/brand/logo-white.png').resize({ width: LOGO_W }).toBuffer();
const logoMeta = await sharp(logo).metadata();
await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: BACKGROUND } })
  .composite([...tiles, { input: logo, left: (WIDTH - LOGO_W) / 2, top: Math.round(TOP + TILE_H + (HEIGHT - TOP - TILE_H - logoMeta.height) / 2) }])
  .jpeg({ quality: 86 }).toFile('public/og-image.jpg');
console.log('public/og-image.jpg', people.join(' '));
