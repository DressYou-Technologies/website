// Walks a page top to bottom in real time, one screenshot per step, over CDP.
// node scripts/shots.mjs <url> <outDir> <desktop|mobile> [reduce|noscript] [stepFraction]
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [, , url, outDir, device, mode, stepArg] = process.argv;
const PORT = 9334;
const SETTLE_MS = 1800;
const STEP = Number(stepArg ?? 0.85);
const VIEWPORTS = { desktop: { width: 1440, height: 900, mobile: false }, mobile: { width: 390, height: 844, mobile: true } };
mkdirSync(outDir, { recursive: true });

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let pages;
  for (let i = 0; i < 50 && !pages; i++) {
    await sleep(100);
    pages = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => null);
  }
  const ws = new WebSocket(pages.find((p) => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else events.push(msg);
  });
  const send = (method, params = {}) => new Promise((resolve) => { pending.set(++id, resolve); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.result.value;

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { ...VIEWPORTS[device], deviceScaleFactor: 1 });
  if (mode === 'reduce') await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  if (mode === 'noscript') await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url });
  await sleep(4000);

  const height = VIEWPORTS[device].height;
  for (let n = 0, y = 0; ; n++, y += Math.round(height * STEP)) {
    const max = await evaluate('document.documentElement.scrollHeight - innerHeight');
    // Step in small increments so scroll-driven timelines see a real scroll.
    await evaluate(`(async () => { const to = Math.min(${y}, ${max}); for (let p = scrollY; Math.abs(to - p) > 1; ) { p += Math.sign(to - p) * Math.min(120, Math.abs(to - p)); scrollTo(0, p); await new Promise((r) => requestAnimationFrame(r)); } })()`);
    await sleep(SETTLE_MS);
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
    writeFileSync(join(outDir, `${device}${mode ? `-${mode}` : ''}-${String(n).padStart(2, '0')}.jpg`), Buffer.from(shot.result.data, 'base64'));
    if (y >= max) {
      const overflow = mode === 'noscript' ? 'unknown (scripts off)' : (await evaluate('document.documentElement.scrollWidth > innerWidth')) ? 'yes' : 'no';
      console.log('steps', n + 1, 'height', max + height, 'overflow:', overflow);
      break;
    }
  }
  const errors = events.filter((e) => e.method === 'Runtime.exceptionThrown');
  console.log('page errors:', errors.length ? JSON.stringify(errors.map((e) => e.params.exceptionDetails?.exception?.description ?? e.params.exceptionDetails?.text)) : 'none');
  ws.close();
} finally {
  chrome.kill();
}
