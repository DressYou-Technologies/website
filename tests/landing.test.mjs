import assert from 'node:assert/strict';
import test from 'node:test';
import { landing } from '../src/lib/landing.ts';

// A row repeats its n garments; child j shows garment j % n.
const N = 4, MIN = 6, MAX = 33;

test('a row lands on the asked garment', () => {
  for (let garment = 0; garment < N; garment++) {
    for (const dir of [1, -1]) {
      for (const laps of [5, 9, 13]) assert.equal(landing({ base: 20, dir, laps, n: N, garment, min: MIN, max: MAX }) % N, garment);
    }
  }
});

test('a row stays inside the span that keeps garments on both sides', () => {
  for (let base = MIN; base <= MAX; base++) {
    for (const dir of [1, -1]) {
      const i = landing({ base, dir, laps: 12, n: N, garment: 3, min: MIN, max: MAX });
      assert.ok(i >= MIN && i <= MAX, `${base} ${dir} → ${i}`);
    }
  }
});

test('a row moves at least its laps in its direction when there is room', () => {
  assert.ok(landing({ base: 12, dir: 1, laps: 5, n: N, garment: 1, min: MIN, max: MAX }) >= 17);
  assert.ok(landing({ base: 28, dir: -1, laps: 5, n: N, garment: 2, min: MIN, max: MAX }) <= 23);
});
