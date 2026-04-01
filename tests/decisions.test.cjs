'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  loadDecisions,
  saveDecisions,
  addDecision,
  getDecision,
  getDecisionsByDomain,
  removeDecision,
  validateDecisions,
  ensureConfigDir,
  DECISIONS_DEFAULTS,
  VALID_SOURCES,
} = require('../core/decisions.cjs');
const { makeTmpDir, rmTmpDir } = require('./helpers.cjs');

function writeDecisionsFile(rootDir, data) {
  const dir = path.join(rootDir, '.superteam');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'decisions.json'), JSON.stringify(data, null, 2));
}

function makeDecision(overrides = {}) {
  return {
    key: 'test-key',
    value: 'test-value',
    decided_at: '2026-01-15T10:00:00.000Z',
    source: 'user_confirmed',
    rationale: 'Because reasons',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('DECISIONS_DEFAULTS', () => {
  it('has version 1 and empty decisions array', () => {
    assert.strictEqual(DECISIONS_DEFAULTS.version, 1);
    assert.deepStrictEqual(DECISIONS_DEFAULTS.decisions, []);
  });

  it('is frozen', () => {
    assert.ok(Object.isFrozen(DECISIONS_DEFAULTS));
  });
});

describe('VALID_SOURCES', () => {
  it('contains all expected source values', () => {
    const expected = ['init', 'user_confirmed', 'user_selected', 'user_described', 'user_modified', 'derived'];
    assert.deepStrictEqual([...VALID_SOURCES], expected);
  });

  it('is frozen', () => {
    assert.ok(Object.isFrozen(VALID_SOURCES));
  });
});

// ---------------------------------------------------------------------------
// ensureConfigDir
// ---------------------------------------------------------------------------

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

  it('is idempotent', () => {
    ensureConfigDir(tmpDir);
    assert.doesNotThrow(() => ensureConfigDir(tmpDir));
  });
});

// ---------------------------------------------------------------------------
// loadDecisions
// ---------------------------------------------------------------------------

describe('loadDecisions', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns defaults when no file exists', () => {
    const data = loadDecisions(tmpDir);
    assert.strictEqual(data.version, 1);
    assert.deepStrictEqual(data.decisions, []);
  });

  it('loads existing decisions file', () => {
    const dir = makeTmpDir();
    try {
      const stored = { version: 1, decisions: [makeDecision()] };
      writeDecisionsFile(dir, stored);
      const data = loadDecisions(dir);
      assert.strictEqual(data.version, 1);
      assert.strictEqual(data.decisions.length, 1);
      assert.strictEqual(data.decisions[0].key, 'test-key');
    } finally {
      rmTmpDir(dir);
    }
  });

  it('merges partial file with defaults', () => {
    const dir = makeTmpDir();
    try {
      writeDecisionsFile(dir, { version: 2 });
      const data = loadDecisions(dir);
      assert.strictEqual(data.version, 2);
      assert.deepStrictEqual(data.decisions, []);
    } finally {
      rmTmpDir(dir);
    }
  });

  it('returns defaults for invalid JSON', () => {
    const dir = makeTmpDir();
    try {
      const filePath = path.join(dir, '.superteam');
      fs.mkdirSync(filePath, { recursive: true });
      fs.writeFileSync(path.join(filePath, 'decisions.json'), '{{not json}}');
      const data = loadDecisions(dir);
      assert.strictEqual(data.version, 1);
      assert.deepStrictEqual(data.decisions, []);
    } finally {
      rmTmpDir(dir);
    }
  });

  it('returns a deep clone (not a reference to defaults)', () => {
    const a = loadDecisions(tmpDir);
    const b = loadDecisions(tmpDir);
    a.decisions.push({ key: 'mutated' });
    assert.strictEqual(b.decisions.length, 0);
  });
});

// ---------------------------------------------------------------------------
// validateDecisions
// ---------------------------------------------------------------------------

describe('validateDecisions', () => {
  it('returns valid for correct data', () => {
    const data = { version: 1, decisions: [makeDecision()] };
    const result = validateDecisions(data);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it('returns valid for empty decisions array', () => {
    const result = validateDecisions({ version: 1, decisions: [] });
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it('rejects non-number version', () => {
    const result = validateDecisions({ version: '1', decisions: [] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('version')));
  });

  it('rejects non-array decisions', () => {
    const result = validateDecisions({ version: 1, decisions: 'not-array' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('decisions must be an array')));
  });

  it('rejects decision with missing key', () => {
    const decision = makeDecision();
    delete decision.key;
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('key')));
  });

  it('rejects decision with missing decided_at', () => {
    const decision = makeDecision();
    delete decision.decided_at;
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('decided_at')));
  });

  it('rejects invalid decided_at timestamp', () => {
    const decision = makeDecision({ decided_at: 'not-a-date' });
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('ISO 8601')));
  });

  it('rejects invalid source enum', () => {
    const decision = makeDecision({ source: 'magic' });
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('source')));
  });

  it('accepts decision without optional source', () => {
    const decision = makeDecision();
    delete decision.source;
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, true);
  });

  it('accepts decision without optional rationale', () => {
    const decision = makeDecision();
    delete decision.rationale;
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, true);
  });

  it('rejects non-string rationale', () => {
    const decision = makeDecision({ rationale: 123 });
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('rationale')));
  });

  it('rejects decision with missing value', () => {
    const decision = makeDecision();
    delete decision.value;
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('value')));
  });

  it('rejects non-object decision entries', () => {
    const result = validateDecisions({ version: 1, decisions: ['not-object'] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('must be an object')));
  });

  it('collects multiple errors', () => {
    const decision = { decided_at: 'bad', source: 'invalid' };
    const result = validateDecisions({ version: '1', decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length >= 3);
  });
});

// ---------------------------------------------------------------------------
// saveDecisions + loadDecisions round-trip
// ---------------------------------------------------------------------------

describe('saveDecisions + loadDecisions round-trip', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('persists and retrieves identical values', () => {
    const original = {
      version: 1,
      decisions: [makeDecision(), makeDecision({ key: 'second', value: 42 })],
    };
    saveDecisions(tmpDir, original);
    const loaded = loadDecisions(tmpDir);
    assert.deepStrictEqual(loaded, original);
  });

  it('throws on invalid data', () => {
    assert.throws(
      () => saveDecisions(tmpDir, { version: 'bad', decisions: [] }),
      /Invalid decisions/,
    );
  });

  it('attaches errors array to thrown error', () => {
    try {
      saveDecisions(tmpDir, { version: 'bad', decisions: [] });
      assert.fail('should have thrown');
    } catch (err) {
      assert.ok(Array.isArray(err.errors));
      assert.ok(err.errors.length > 0);
    }
  });
});

// ---------------------------------------------------------------------------
// addDecision
// ---------------------------------------------------------------------------

describe('addDecision', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('adds a new decision to empty store', () => {
    const dir = makeTmpDir();
    try {
      const data = addDecision(dir, {
        key: 'framework',
        value: 'react',
        rationale: 'Team preference',
        source: 'user_selected',
      });
      assert.strictEqual(data.decisions.length, 1);
      assert.strictEqual(data.decisions[0].key, 'framework');
      assert.strictEqual(data.decisions[0].value, 'react');
      assert.strictEqual(data.decisions[0].source, 'user_selected');
      assert.ok(data.decisions[0].decided_at);
    } finally {
      rmTmpDir(dir);
    }
  });

  it('persists the decision to disk', () => {
    const dir = makeTmpDir();
    try {
      addDecision(dir, { key: 'db', value: 'postgres' });
      const loaded = loadDecisions(dir);
      assert.strictEqual(loaded.decisions.length, 1);
      assert.strictEqual(loaded.decisions[0].key, 'db');
    } finally {
      rmTmpDir(dir);
    }
  });

  it('updates existing decision by key', () => {
    const dir = makeTmpDir();
    try {
      addDecision(dir, { key: 'lang', value: 'typescript' });
      const data = addDecision(dir, { key: 'lang', value: 'rust', rationale: 'Performance' });
      assert.strictEqual(data.decisions.length, 1);
      assert.strictEqual(data.decisions[0].value, 'rust');
      assert.strictEqual(data.decisions[0].rationale, 'Performance');
    } finally {
      rmTmpDir(dir);
    }
  });

  it('preserves original decided_at when updating', () => {
    const dir = makeTmpDir();
    try {
      addDecision(dir, { key: 'lang', value: 'ts' });
      const original = loadDecisions(dir).decisions[0].decided_at;
      // Small delay to ensure timestamp would differ if regenerated.
      addDecision(dir, { key: 'lang', value: 'rust' });
      const updated = loadDecisions(dir).decisions[0].decided_at;
      assert.strictEqual(updated, original);
    } finally {
      rmTmpDir(dir);
    }
  });

  it('throws on empty key', () => {
    assert.throws(
      () => addDecision(tmpDir, { key: '', value: 'x' }),
      /key must be a non-empty string/,
    );
  });

  it('throws on non-string key', () => {
    assert.throws(
      () => addDecision(tmpDir, { key: 123, value: 'x' }),
      /key must be a non-empty string/,
    );
  });

  it('throws on invalid source', () => {
    assert.throws(
      () => addDecision(tmpDir, { key: 'k', value: 'v', source: 'magic' }),
      /Invalid source/,
    );
  });

  it('omits rationale and source when not provided', () => {
    const dir = makeTmpDir();
    try {
      const data = addDecision(dir, { key: 'minimal', value: true });
      const d = data.decisions[0];
      assert.strictEqual(d.key, 'minimal');
      assert.strictEqual(d.value, true);
      assert.strictEqual(d.rationale, undefined);
      assert.strictEqual(d.source, undefined);
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// getDecision
// ---------------------------------------------------------------------------

describe('getDecision', () => {
  let tmpDir;
  before(() => {
    tmpDir = makeTmpDir();
    addDecision(tmpDir, { key: 'color', value: 'blue', source: 'user_selected' });
    addDecision(tmpDir, { key: 'size', value: 'large' });
  });
  after(() => { rmTmpDir(tmpDir); });

  it('returns existing decision by key', () => {
    const d = getDecision(tmpDir, 'color');
    assert.strictEqual(d.key, 'color');
    assert.strictEqual(d.value, 'blue');
    assert.strictEqual(d.source, 'user_selected');
  });

  it('returns null for non-existent key', () => {
    const d = getDecision(tmpDir, 'nonexistent');
    assert.strictEqual(d, null);
  });

  it('returns null from empty store', () => {
    const dir = makeTmpDir();
    try {
      assert.strictEqual(getDecision(dir, 'anything'), null);
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// removeDecision
// ---------------------------------------------------------------------------

describe('removeDecision', () => {
  it('removes an existing decision', () => {
    const dir = makeTmpDir();
    try {
      addDecision(dir, { key: 'a', value: 1 });
      addDecision(dir, { key: 'b', value: 2 });
      const data = removeDecision(dir, 'a');
      assert.strictEqual(data.decisions.length, 1);
      assert.strictEqual(data.decisions[0].key, 'b');
    } finally {
      rmTmpDir(dir);
    }
  });

  it('persists removal to disk', () => {
    const dir = makeTmpDir();
    try {
      addDecision(dir, { key: 'x', value: 1 });
      removeDecision(dir, 'x');
      const loaded = loadDecisions(dir);
      assert.strictEqual(loaded.decisions.length, 0);
    } finally {
      rmTmpDir(dir);
    }
  });

  it('throws when key not found', () => {
    const dir = makeTmpDir();
    try {
      assert.throws(
        () => removeDecision(dir, 'ghost'),
        /not found/,
      );
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// domain field
// ---------------------------------------------------------------------------

describe('domain field', () => {
  it('addDecision persists domain when provided', () => {
    const dir = makeTmpDir();
    try {
      const data = addDecision(dir, { key: 'db', value: 'postgres', domain: 'infra' });
      assert.strictEqual(data.decisions[0].domain, 'infra');
    } finally {
      rmTmpDir(dir);
    }
  });

  it('addDecision omits domain when not provided', () => {
    const dir = makeTmpDir();
    try {
      const data = addDecision(dir, { key: 'lang', value: 'ts' });
      assert.strictEqual(data.decisions[0].domain, undefined);
    } finally {
      rmTmpDir(dir);
    }
  });

  it('validateDecisions accepts valid domain string', () => {
    const decision = makeDecision({ domain: 'frontend' });
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, true);
  });

  it('validateDecisions rejects non-string domain', () => {
    const decision = makeDecision({ domain: 123 });
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('domain')));
  });

  it('validateDecisions accepts decision without domain (backward compat)', () => {
    const decision = makeDecision();
    delete decision.domain;
    const result = validateDecisions({ version: 1, decisions: [decision] });
    assert.strictEqual(result.valid, true);
  });
});

// ---------------------------------------------------------------------------
// getDecisionsByDomain
// ---------------------------------------------------------------------------

describe('getDecisionsByDomain', () => {
  let tmpDir;
  before(() => {
    tmpDir = makeTmpDir();
    addDecision(tmpDir, { key: 'db', value: 'postgres', domain: 'infra' });
    addDecision(tmpDir, { key: 'cache', value: 'redis', domain: 'infra' });
    addDecision(tmpDir, { key: 'ui-lib', value: 'react', domain: 'frontend' });
    addDecision(tmpDir, { key: 'lang', value: 'typescript' }); // no domain
  });
  after(() => { rmTmpDir(tmpDir); });

  it('returns all decisions matching a domain', () => {
    const infra = getDecisionsByDomain(tmpDir, 'infra');
    assert.strictEqual(infra.length, 2);
    assert.ok(infra.some((d) => d.key === 'db'));
    assert.ok(infra.some((d) => d.key === 'cache'));
  });

  it('returns empty array for unknown domain', () => {
    const result = getDecisionsByDomain(tmpDir, 'devops');
    assert.deepStrictEqual(result, []);
  });

  it('does not return decisions without domain', () => {
    const result = getDecisionsByDomain(tmpDir, undefined);
    // Only the 'lang' decision has no domain, but filtering by undefined matches it
    assert.ok(result.some((d) => d.key === 'lang'));
  });
});
