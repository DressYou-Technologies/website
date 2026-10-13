import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { timing, taglineTimesFor } from '../dist/sequence.mjs';
import { parse, select, textOf } from './support/html.mjs';

const SELECTORS = ['.experience', '.progress', '.progress-fill', '.loading-scene', '.identity', '.replay', '.skip', '.status', '.wordmark', '.tagline'];
const landing = (url) => parse(readFileSync(new URL(`../dist${url}index.html`, import.meta.url), 'utf8')).root;

// Runs the real entry point against a landing page's own wordmark and tagline.
let runs = 0;
async function load(url, { reducedMotion }) {
  const root = landing(url);
  const text = { '.wordmark': textOf(select(root, '.wordmark')), '.tagline': textOf(select(root, '.tagline')) };
  const element = (extra = {}) => ({ style: { props: {}, setProperty(name, value) { this.props[name] = value; } }, dataset: {}, textContent: '', setAttribute() {}, addEventListener() {}, focus() {}, replaceChildren(...children) { this.children = children; }, ...extra });
  const elements = Object.fromEntries(SELECTORS.map((selector) => [selector, element({ textContent: text[selector] ?? '' })]));
  const image = { naturalWidth: 1122, decode: () => Promise.resolve() };
  const shot = { querySelector: () => image, classList: { remove() {}, toggle() {} } };
  const frames = [];
  Object.assign(globalThis, {
    document: {
      querySelector: (selector) => elements[selector], querySelectorAll: () => [shot], createElement: () => element(), images: [image],
      fonts: { ready: Promise.resolve() }, addEventListener() {}, hidden: false, activeElement: null,
    },
    matchMedia: () => ({ matches: reducedMotion, addEventListener() {} }),
    requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {},
  });
  Object.defineProperty(globalThis, 'performance', { value: { now: () => 0 }, configurable: true });
  await import(`../dist/app.mjs?run=${++runs}`);
  return { elements, frames, text };
}

for (const [url, language] of [['/', 'French'], ['/en/', 'English']]) {
  test(`${language}: the tagline is the page's own text, and it finishes typing inside its phase`, async () => {
    const { elements, text } = await load(url, { reducedMotion: false });
    const tagline = text['.tagline'];
    assert.ok(tagline.length > 10);
    const spans = elements['.tagline'].children;
    assert.equal(spans.length, Array.from(tagline).length, 'one span per character of the page\'s tagline');
    assert.equal(spans.map((span) => span.textContent).join(''), tagline);
    const delays = taglineTimesFor(tagline);
    assert.deepEqual(spans.map((span) => span.style.props['--letter-delay']), delays.map((delay) => `${delay}ms`));
    assert.ok(delays.at(-1) <= timing.tagline, 'the typing must end before the identity rests');
  });

  test(`${language}: reduced motion skips straight to the final identity and announces it`, async () => {
    const { elements, frames, text } = await load(url, { reducedMotion: true });
    assert.equal(elements['.experience'].dataset.phase, 'rest');
    assert.equal(frames.length, 0, 'nothing is animated');
    assert.equal(elements['.status'].textContent, `${text['.wordmark']}. ${text['.tagline']}`);
  });

  test(`${language}: without the preference the intro plays from the first frame`, async () => {
    const { elements, frames } = await load(url, { reducedMotion: false });
    assert.equal(elements['.experience'].dataset.phase, 'loading');
    assert.equal(frames.length, 1, 'one frame is waiting');
  });
}
