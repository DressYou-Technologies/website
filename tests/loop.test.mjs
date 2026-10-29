import assert from 'node:assert/strict';
import test from 'node:test';
import { visibleLoop } from '../src/lib/loop.ts';

// A fake pass finishes only when the test says so; a fake delay runs its callback immediately.
function harness() {
  const passes = [];
  const pass = (done) => { const p = { done, killed: false, kill() { this.killed = true; } }; passes.push(p); return p; };
  const delay = (_s, fn) => { fn(); return { kill() {} }; };
  return { passes, loop: visibleLoop(pass, .35, delay) };
}

test('scrolling back while a pass is running starts one chain, not two', () => {
  const { passes, loop } = harness();
  loop.start();
  loop.stop();
  loop.start();
  passes[0].done(); // the stale pass reports in late
  passes[1].done();
  assert.equal(passes.length, 3, 'the stale pass must not schedule its own next pass');
});

test('stopping kills the pass in flight', () => {
  const { passes, loop } = harness();
  loop.start();
  loop.stop();
  assert.equal(passes[0].killed, true);
});

test('starting twice while live runs one pass', () => {
  const { passes, loop } = harness();
  loop.start();
  loop.start();
  assert.equal(passes.length, 1);
});
