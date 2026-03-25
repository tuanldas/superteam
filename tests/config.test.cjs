'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  loadConfig,
  saveConfig,
  getConfigValue,
  setConfigValue,
  ensureConfigDir,
  buildDefaultConfig,
  validateConfig,
  CONFIG_DEFAULTS,
} = require('../core/config.cjs');

// ---------------------------------------------------------------------------
// Helper: temp directory management
// ---------------------------------------------------------------------------

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'superteam-test-'));
}

function rmTmpDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('loadConfig', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns defaults when no file exists', () => {
    const config = loadConfig(tmpDir);
    assert.deepStrictEqual(config.name, CONFIG_DEFAULTS.name);
    assert.deepStrictEqual(config.type, CONFIG_DEFAULTS.type);
    assert.deepStrictEqual(config.preferences, CONFIG_DEFAULTS.preferences);
    assert.deepStrictEqual(config.workflow, CONFIG_DEFAULTS.workflow);
    assert.strictEqual(config.granularity, 'standard');
    assert.strictEqual(config.parallelization, true);
  });

  it('merges a partial file with defaults', () => {
    const dir = makeTmpDir();
    try {
      fs.mkdirSync(path.join(dir, '.superteam'), { recursive: true });
      fs.writeFileSync(
        path.join(dir, '.superteam', 'config.json'),
        JSON.stringify({ name: 'my-project', type: 'backend' }),
      );
      const config = loadConfig(dir);
      assert.strictEqual(config.name, 'my-project');
      assert.strictEqual(config.type, 'backend');
      // Defaults still present for unset keys.
      assert.strictEqual(config.granularity, 'standard');
      assert.deepStrictEqual(config.preferences, CONFIG_DEFAULTS.preferences);
      assert.deepStrictEqual(config.workflow, CONFIG_DEFAULTS.workflow);
    } finally {
      rmTmpDir(dir);
    }
  });
});

describe('saveConfig + loadConfig round-trip', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('persists and retrieves identical values', () => {
    const original = {
      name: 'roundtrip',
      type: 'fullstack',
      workspaces: ['packages/a', 'packages/b'],
      preferences: { defaultBranch: 'develop', commitStyle: 'simple' },
      granularity: 'fine',
      parallelization: false,
      research_auto_approve: false,
      commit_docs: false,
      model_profile: 'quality',
      workflow: { research: false, plan_check: true, verifier: false },
    };
    saveConfig(tmpDir, original);
    const loaded = loadConfig(tmpDir);
    assert.deepStrictEqual(loaded, original);
  });
});

describe('saveConfig with invalid config', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('throws when config has invalid enum value', () => {
    const bad = { ...CONFIG_DEFAULTS, type: 'invalid-type' };
    assert.throws(() => saveConfig(tmpDir, bad), /Invalid config/);
  });

  it('throws when config has wrong type', () => {
    const bad = { ...CONFIG_DEFAULTS, parallelization: 'yes' };
    assert.throws(() => saveConfig(tmpDir, bad), /Invalid config/);
  });
});

describe('getConfigValue', () => {
  const config = {
    name: 'test',
    preferences: { defaultBranch: 'main', commitStyle: 'conventional' },
    workflow: { research: true },
  };

  it('reads top-level keys', () => {
    assert.strictEqual(getConfigValue(config, 'name'), 'test');
  });

  it('reads nested keys with dot notation', () => {
    assert.strictEqual(getConfigValue(config, 'workflow.research'), true);
    assert.strictEqual(getConfigValue(config, 'preferences.defaultBranch'), 'main');
  });

  it('returns undefined for missing paths', () => {
    assert.strictEqual(getConfigValue(config, 'does.not.exist'), undefined);
    assert.strictEqual(getConfigValue(config, 'preferences.missing'), undefined);
  });
});

describe('setConfigValue', () => {
  it('creates intermediate objects when needed', () => {
    const config = { name: 'test' };
    const updated = setConfigValue(config, 'a.b.c', 42);
    assert.strictEqual(getConfigValue(updated, 'a.b.c'), 42);
    assert.strictEqual(updated.name, 'test');
  });

  it('does not mutate the input config', () => {
    const config = { name: 'original', workflow: { research: true } };
    const updated = setConfigValue(config, 'workflow.research', false);
    // Updated has the new value.
    assert.strictEqual(getConfigValue(updated, 'workflow.research'), false);
    // Original is unchanged.
    assert.strictEqual(config.workflow.research, true);
  });
});

describe('buildDefaultConfig', () => {
  it('applies 3-level merge: defaults < detection < choices', () => {
    const detection = { type: 'frontend', frameworks: ['react'], workspaces: ['ui'] };
    const choices = { granularity: 'fine', model_profile: 'quality' };
    const result = buildDefaultConfig(detection, choices);

    // From detection
    assert.strictEqual(result.type, 'frontend');
    assert.deepStrictEqual(result.workspaces, ['ui']);

    // From choices (overrides defaults)
    assert.strictEqual(result.granularity, 'fine');
    assert.strictEqual(result.model_profile, 'quality');

    // Still from defaults (untouched by detection or choices)
    assert.strictEqual(result.parallelization, true);
    assert.deepStrictEqual(result.preferences, CONFIG_DEFAULTS.preferences);
  });

  it('choices override detection values', () => {
    const detection = { type: 'backend', workspaces: ['server'] };
    const choices = { type: 'fullstack' };
    const result = buildDefaultConfig(detection, choices);
    assert.strictEqual(result.type, 'fullstack');
    assert.deepStrictEqual(result.workspaces, ['server']);
  });
});

describe('validateConfig', () => {
  it('returns valid for a correct config', () => {
    const result = validateConfig(CONFIG_DEFAULTS);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it('reports invalid enum value', () => {
    const config = { ...CONFIG_DEFAULTS, type: 'java' };
    const result = validateConfig(config);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].includes('type'));
  });

  it('reports wrong type', () => {
    const config = { ...CONFIG_DEFAULTS, parallelization: 'yes' };
    const result = validateConfig(config);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
    assert.ok(result.errors[0].includes('parallelization'));
  });

  it('allows unknown keys (extensible)', () => {
    const config = { ...CONFIG_DEFAULTS, customField: 123 };
    const result = validateConfig(config);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

describe('ensureConfigDir', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('creates the .superteam directory', () => {
    const target = path.join(tmpDir, '.superteam');
    assert.ok(!fs.existsSync(target));
    ensureConfigDir(tmpDir);
    assert.ok(fs.existsSync(target));
    assert.ok(fs.statSync(target).isDirectory());
  });

  it('is idempotent (no error if already exists)', () => {
    ensureConfigDir(tmpDir);
    assert.doesNotThrow(() => ensureConfigDir(tmpDir));
  });
});
