import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import * as site from '../src/data/site.ts';

const ASSETS = new URL('../src/assets/', import.meta.url);
const GROUPS = ['people', 'feed', 'garments'];
const MODEL = 'gpt-image-2.5-sunburst';
const WALL_COLUMNS = 9;
const WALL_ROWS = 3;
const WALL_MIN_REPEAT_GAP = 3;

const masters = new Map();
for (const group of GROUPS) {
  for (const file of await readdir(new URL(`${group}/`, ASSETS))) {
    const id = file.replace(/\.jpg$/, '');
    assert.ok(!masters.has(id), `${id} is in two groups`);
    masters.set(id, group);
  }
}
const manifest = JSON.parse(await readFile(new URL('manifest.json', ASSETS), 'utf8'));

// Every string in the data that names an image: anything shaped like an asset id.
const ids = (value) => typeof value === 'string'
  ? (/^(twin|wall-|feed-|g-|shop-)/.test(value) ? [value] : [])
  : Array.isArray(value) || (value && typeof value === 'object') ? Object.values(value).flatMap(ids) : [];

test('every image id in the data exists as a master', () => {
  const used = ids(site);
  assert.ok(used.length > 50);
  for (const id of used) assert.ok(masters.has(id), `${id} has no master`);
});

test('every master has a manifest entry with its model', () => {
  for (const id of masters.keys()) assert.equal(manifest[id]?.model, MODEL, id);
});

test('the wall is 9 columns of 3 with no repeat close by', () => {
  assert.equal(site.WALL.length, WALL_COLUMNS);
  const seen = new Map();
  site.WALL.forEach((column, c) => {
    assert.equal(column.length, WALL_ROWS);
    assert.equal(new Set(column).size, WALL_ROWS, `column ${c} repeats an image`);
    for (const id of column) {
      if (seen.has(id)) assert.ok(c - seen.get(id) >= WALL_MIN_REPEAT_GAP, `${id} repeats ${c - seen.get(id)} columns apart`);
      seen.set(id, c);
    }
  });
  const wallPeople = [...masters.keys()].filter((id) => id.startsWith('wall-'));
  assert.equal(wallPeople.length, 16);
  for (const id of wallPeople) assert.ok(seen.has(id), `${id} is not on the wall`);
});

test('each outfit piece comes from its row', () => {
  assert.deepEqual(site.WARDROBE_ROWS.map((row) => row.length), [4, 4, 4, 3]);
  for (const row of site.WARDROBE_ROWS) assert.equal(new Set(row).size, row.length);
  for (const outfit of site.OUTFITS) {
    outfit.pieces.forEach((piece, i) => assert.ok(site.WARDROBE_ROWS[i].includes(piece), `${piece} is not in row ${i}`));
  }
});

test("the feed story's render wears the post's look", () => {
  assert.equal(site.HOW.feed.post.image, 'feed-w-trench');
  assert.equal(site.HOW.feed.render, 'twin-cap-trench');
  assert.deepEqual(site.LOOK_PIECES, ['g-black-cap', 'g-trench', 'g-white-tank', 'g-barrel-jeans', 'g-brown-boots']);
});
