import assert from 'node:assert/strict';
import test from 'node:test';
import { cylinder } from '../src/lib/cylinder.ts';

// The export placed its 9 columns at a 160 px tile width with these values.
const EXPORT_WIDTH = 160;
const near = (actual, expected, digits) => assert.equal(Number(actual.toFixed(digits)), expected);

test('the outer columns sit where the export put them', () => {
  const [first] = cylinder(9);
  near(first.x * EXPORT_WIDTH, -608.4, 1);
  near(first.z * EXPORT_WIDTH, 280.5, 1);
  near(first.rotateY, 49.5, 2);
  near(first.opacity, .95, 2);
});

test('the middle column faces the viewer, deepest and darkest', () => {
  const middle = cylinder(9)[4];
  near(middle.x, 0, 6);
  near(middle.z, 0, 6);
  near(middle.rotateY, 0, 6);
  near(middle.opacity, .45, 2);
});

test('the wall is symmetric', () => {
  const cols = cylinder(9);
  cols.forEach((col, i) => {
    const mirror = cols[cols.length - 1 - i];
    near(col.x + mirror.x, 0, 6);
    near(col.z - mirror.z, 0, 6);
    near(col.rotateY + mirror.rotateY, 0, 6);
  });
});
