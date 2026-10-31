import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import * as site from '../src/data/site.ts';

const ASSETS = new URL('../src/assets/', import.meta.url);
const GROUPS = ['people', 'feed', 'garments'];
const MODEL = 'gpt-image-2.5-sunburst';
const WALL_COLUMNS = 9;
const WALL_ROWS = 3;
// Founder, 2026-10-30: the hero shows studio renders of 27 different people, women and men within one of each other,
// and men and women share the rest of the site.
const WALL_PEOPLE = 27;
const BALANCE_SLACK = 1;
const WEBP_ALPHA_FLAG = 0x10; // VP8X header flag: the image carries an alpha channel

const masters = new Map();
for (const group of GROUPS) {
  for (const file of await readdir(new URL(`${group}/`, ASSETS))) {
    const id = file.replace(/\.(jpg|webp)$/, '');
    assert.ok(!masters.has(id), `${id} is in two groups`);
    masters.set(id, group);
  }
}
const cutout = async (id) => {
  const bytes = await readFile(new URL(`${masters.get(id)}/${id}.webp`, ASSETS)).catch(() => null);
  return bytes !== null && bytes.toString('ascii', 12, 16) === 'VP8X' && (bytes[20] & WEBP_ALPHA_FLAG) !== 0;
};
const manifest = JSON.parse(await readFile(new URL('manifest.json', ASSETS), 'utf8'));

// Every string in the data that names an image: anything shaped like an asset id.
const ids = (value) => typeof value === 'string'
  ? (/^(twin|render-|wall-|feed-|g-)/.test(value) ? [value] : [])
  : Array.isArray(value) || (value && typeof value === 'object') ? Object.values(value).flatMap(ids) : [];

test('every image id in the data exists as a master', () => {
  const used = ids(site);
  assert.ok(used.length > 50);
  for (const id of used) assert.ok(masters.has(id), `${id} has no master`);
});

test('every master has a manifest entry with its model', () => {
  for (const id of masters.keys()) assert.equal(manifest[id]?.model, MODEL, id);
});

test('the wall is 9 columns of 3 different people, none repeated', () => {
  assert.equal(site.WALL.length, WALL_COLUMNS);
  const seen = new Set(site.WALL.flat());
  for (const column of site.WALL) assert.equal(column.length, WALL_ROWS);
  const wallPeople = [...masters.keys()].filter((id) => id.startsWith('wall-'));
  assert.equal(wallPeople.length, WALL_PEOPLE);
  for (const id of wallPeople) assert.ok(seen.has(id), `${id} is not on the wall`);
});

test('every master is used somewhere on the site', () => {
  const used = new Set(ids(site));
  for (const id of masters.keys()) assert.ok(used.has(id), `${id} is not used`);
});

test('men and women share the feed and the try-ons', () => {
  const posts = site.FEED_TRACKS.flat().map((post) => post.image);
  const men = posts.filter((id) => id.startsWith('feed-m-')).length;
  assert.ok(Math.abs(men - (posts.length - men)) <= BALANCE_SLACK, `${men} of ${posts.length} posts are men`);
  const renders = [site.HOW.shop.render, site.HOW.wardrobe.render, site.HOW.feed.render, ...site.OUTFITS.map((o) => o.render), ...site.FRIEND_ROUNDS.flatMap((round) => round.looks)];
  const male = renders.filter((id) => /^(twin|render)-m-/.test(id)).length;
  assert.ok(male > 0 && Math.abs(male - (renders.length - male)) <= BALANCE_SLACK, `${male} of ${renders.length} try-ons are the male twin`);
});

test('the wall is studio renders, as many women as men within one', () => {
  for (const id of site.WALL.flat()) assert.match(id, /^wall-[wm]-/, `${id} is not a wall render`);
  assert.equal(new Set(site.WALL.flat()).size, WALL_PEOPLE, 'a person appears twice');
  const women = [...masters.keys()].filter((id) => id.startsWith('wall-w-')).length;
  assert.ok(Math.abs(women - (WALL_PEOPLE - women)) <= BALANCE_SLACK, `${women} of ${WALL_PEOPLE} are women`);
});

test('every garment is a transparent cutout', async () => {
  const ids = [...masters.keys()].filter((id) => /^g-/.test(id));
  assert.ok(ids.length > 15);
  for (const id of ids) assert.ok(await cutout(id), `${id} is not a transparent WebP`);
});

test('each outfit piece comes from its row', () => {
  assert.deepEqual(site.WARDROBE_ROWS.map((row) => row.length), [4, 4, 4, 3]);
  for (const row of site.WARDROBE_ROWS) assert.equal(new Set(row).size, row.length);
  for (const outfit of site.OUTFITS) {
    outfit.pieces.forEach((piece, i) => assert.ok(site.WARDROBE_ROWS[i].includes(piece), `${piece} is not in row ${i}`));
  }
});

test("the feed story's render wears the post's look", () => {
  assert.equal(site.HOW.feed.post.image, 'feed-w-shirt');
  assert.equal(site.HOW.feed.render, 'render-w-shirt');
  assert.deepEqual(site.LOOK_PIECES, ['g-black-cap', 'g-trench', 'g-white-tank', 'g-barrel-jeans', 'g-brown-boots']);
});

test("every try-on is a studio photo in the hero's recipe, not a cutout", () => {
  for (const id of [site.HOW.shop.render, site.HOW.wardrobe.render, site.HOW.feed.render, ...site.OUTFITS.map((o) => o.render), ...site.FRIEND_ROUNDS.flatMap((round) => round.looks)]) {
    assert.match(id, /^render-[wm]-/, id);
    assert.equal(masters.get(id), 'people', id);
  }
});

test('every shop page in the share story shows a flat garment', () => {
  for (const page of site.HOW.shop.pages) assert.match(page.image, /^g-/, page.domain);
});

test('each friend has a name and a photo', async () => {
  assert.equal(site.FRIENDS.length, 3);
  for (const friend of site.FRIENDS) {
    assert.ok(friend.name.length > 1, friend.name);
    await readFile(new URL(`friends/${friend.photo}.jpg`, ASSETS)).catch(() => assert.fail(`${friend.photo} has no photo`));
  }
});

test('each round offers several looks, the person picks two, and every friend votes for one: a woman\'s round, then a man\'s', () => {
  const [first, second] = site.FRIEND_ROUNDS;
  assert.equal(site.FRIEND_ROUNDS.length, 2);
  for (const id of first.looks) assert.match(id, /^render-w-/, id);
  for (const id of second.looks) assert.match(id, /^render-m-/, id);
  for (const round of site.FRIEND_ROUNDS) {
    assert.ok(round.looks.length >= 3, 'more looks than the two picked');
    assert.equal(new Set(round.looks).size, round.looks.length);
    const [a, b] = round.picked;
    assert.ok(a !== b && round.looks[a] && round.looks[b], 'two different looks are picked');
    assert.equal(round.votes.length, site.FRIENDS.length, 'every friend votes');
    for (const vote of round.votes) assert.ok(vote === 0 || vote === 1, 'a vote is for one of the two');
    const forFirst = round.votes.filter((v) => v === 0).length;
    assert.notEqual(forFirst * 2, round.votes.length, 'the friends reach a majority');
  }
});
