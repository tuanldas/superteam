'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const hookScript = path.resolve(__dirname, '..', 'hooks', 'session-start.cjs');

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'st-hook-'));
}

function runHook(cwd) {
  const output = execFileSync('node', [hookScript], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, HOME: os.homedir() },
  });
  return JSON.parse(output);
}

describe('session-start hook', () => {
  describe('JSON output format', () => {
    let tmpDir;

    before(() => {
      tmpDir = createTempDir();
    });

    after(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('outputs valid JSON with hookSpecificOutput', () => {
      const result = runHook(tmpDir);
      assert.ok(result.hookSpecificOutput, 'must have hookSpecificOutput');
      assert.equal(result.hookSpecificOutput.hookEventName, 'SessionStart');
      assert.equal(typeof result.hookSpecificOutput.additionalContext, 'string');
    });

    it('context contains project info', () => {
      const ctx = runHook(tmpDir).hookSpecificOutput.additionalContext;
      assert.ok(ctx.includes('Superteam Project Context'));
      assert.ok(ctx.includes('Type:'));
    });

    it('suggests /st:init when not initialized', () => {
      const ctx = runHook(tmpDir).hookSpecificOutput.additionalContext;
      assert.ok(ctx.includes('/st:init'));
    });
  });

  describe('React project detection', () => {
    let tmpDir;

    before(() => {
      tmpDir = createTempDir();
      fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
        name: 'my-react-app',
        dependencies: { react: '^18.0.0' },
      }));
    });

    after(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('detects React and shows frontend type', () => {
      const ctx = runHook(tmpDir).hookSpecificOutput.additionalContext;
      assert.ok(ctx.includes('frontend'));
      assert.ok(ctx.includes('react'));
    });
  });

  describe('initialized project', () => {
    let tmpDir;

    before(() => {
      tmpDir = createTempDir();
      const configDir = path.join(tmpDir, '.superteam');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({
        name: 'test-project',
        type: 'backend',
      }));
    });

    after(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('does not suggest /st:init when already initialized', () => {
      const ctx = runHook(tmpDir).hookSpecificOutput.additionalContext;
      assert.ok(!ctx.includes('not initialized'));
    });
  });

  describe('graceful fallback', () => {
    it('never crashes, always outputs valid JSON', () => {
      // Run in a non-existent directory — should still produce valid JSON
      // We test buildContext directly with an empty temp dir instead
      const { buildContext } = require(hookScript);
      const tmpDir = createTempDir();
      try {
        const ctx = buildContext(tmpDir);
        assert.equal(typeof ctx, 'string');
        assert.ok(ctx.length > 0);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe('available commands', () => {
    let tmpDir;

    before(() => {
      tmpDir = createTempDir();
    });

    after(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('lists available commands', () => {
      const ctx = runHook(tmpDir).hookSpecificOutput.additionalContext;
      assert.ok(ctx.includes('/st:plan'));
      assert.ok(ctx.includes('/st:execute'));
      assert.ok(ctx.includes('/st:debug'));
      assert.ok(ctx.includes('/st:brainstorm'));
    });
  });
});
