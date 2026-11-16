import assert from 'node:assert/strict';
import test from 'node:test';
import { barsMoved } from '../src/lib/steady.ts';

const HELD = { width: 390, height: 664 };

test('on a touch screen, bars sliding away or back leave the held size alone', () => {
  assert.equal(barsMoved(HELD, { width: 390, height: 764 }, true), true);
  assert.equal(barsMoved({ width: 390, height: 764 }, HELD, true), true);
});

test('a turned phone, a keyboard-sized change and the first measure are a new size', () => {
  assert.equal(barsMoved(HELD, { width: 664, height: 390 }, true), false);
  assert.equal(barsMoved(HELD, { width: 390, height: 380 }, true), false);
  assert.equal(barsMoved({ width: 0, height: 0 }, HELD, true), false);
});

test('a desktop window follows every resize', () => {
  assert.equal(barsMoved(HELD, { width: 390, height: 700 }, false), false);
});
