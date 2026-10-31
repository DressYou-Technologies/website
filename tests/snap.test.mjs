import assert from 'node:assert/strict';
import test from 'node:test';
import { storySnap } from '../src/lib/snap.ts';

const LABELS = [.18, .37, .56, .75, .94];

test('scrolling up above the first question lets you leave the story', () => {
  assert.equal(storySnap(LABELS, .1, -1), 0);
});

test('scrolling down past the last question lets you leave the story', () => {
  assert.equal(storySnap(LABELS, .97, 1), 1);
});

test('inside the story a scroll lands on the next question in its direction', () => {
  assert.equal(storySnap(LABELS, .2, 1), .37);
  assert.equal(storySnap(LABELS, .5, -1), .37);
  assert.equal(storySnap(LABELS, .05, 1), .18);
  assert.equal(storySnap(LABELS, .9, -1), .75);
});

test('a scroll that ends on a question stays there', () => {
  for (const label of LABELS) for (const dir of [1, -1]) assert.equal(storySnap(LABELS, label, dir), label);
});
