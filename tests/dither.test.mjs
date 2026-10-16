import assert from 'node:assert/strict';
import test from 'node:test';
import { diffuse, gradeFor } from '../dist/dither-veil.mjs';

const flat = (value, cols, rows) => new Uint8Array(cols * rows * 4).fill(value);
const whiteShare = out => out.filter((v, i) => i % 4 === 0 && v === 255).length / (out.length / 4);

test('error diffusion keeps the average tone in 1-bit cells', () => {
  const out = diffuse(flat(128, 64, 64), 64, 64, 2, v => v);
  assert.ok(out.every((v, i) => (i % 4 === 3 ? v === 255 : v === 0 || v === 255)));
  assert.ok(Math.abs(whiteShare(out) - 128 / 255) < 0.02);
});

test('black and white stay solid', () => {
  assert.equal(whiteShare(diffuse(flat(0, 16, 16), 16, 16, 2, v => v)), 0);
  assert.equal(whiteShare(diffuse(flat(255, 16, 16), 16, 16, 2, v => v)), 1);
});

test('the site grade breaks solid white into dots', () => {
  const grade = gradeFor({ contrast: 1.15, brightness: -0.2 });
  const share = whiteShare(diffuse(flat(255, 64, 64), 64, 64, 2, grade));
  assert.ok(share > 0.4 && share < 0.9, `white share ${share}`);
});
