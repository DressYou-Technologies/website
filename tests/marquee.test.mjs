import assert from 'node:assert/strict';
import test from 'node:test';
import { wrap } from '../dist/scroll-velocity.mjs';

test('the row offset loops within one copy width, in both directions', () => {
  assert.equal(wrap(-500, 0, 0), -500);
  assert.equal(wrap(-500, 0, -1), -1);
  assert.equal(wrap(-500, 0, 120), -380);
  assert.equal(wrap(-500, 0, -620), -120);
  assert.equal(wrap(-500, 0, 1120), -380);
});
