import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { DIST, distFiles } from './support/site.mjs';

const check = (path) => execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' });

test('every module the site ships parses', () => {
  const modules = distFiles().filter((file) => file.endsWith('.mjs'));
  assert.ok(modules.includes('app.mjs') && modules.includes('auth/link.mjs') && modules.includes('auth/page.mjs'));
  for (const file of modules) assert.doesNotThrow(() => check(join(DIST, file)), file);
});

test('a module with a syntax error is refused', () => {
  const directory = mkdtempSync(join(tmpdir(), 'dressyou-syntax-'));
  try {
    const broken = join(directory, 'broken.mjs');
    writeFileSync(broken, 'export const x = ;\n');
    assert.throws(() => check(broken), /SyntaxError/);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
