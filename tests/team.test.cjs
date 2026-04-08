'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  loadTeamConfig,
  saveTeamConfig,
  isTeamActive,
  isTeamPaused,
  isTeamPausing,
  setTeamStatus,
  getTeamName,
  detectCICD,
  detectUIFramework,
  estimateProjectSize,
  estimateFromArtifacts,
  getRecommendedRoles,
  assembleTeam,
  buildTeamContext,
  countSourceFiles,
  ROLE_DEFINITIONS,
  TEAM_PRESETS,
  SIZE_THRESHOLDS,
} = require('../core/team.cjs');
const { makeTmpDir, rmTmpDir } = require('./helpers.cjs');

// ---------------------------------------------------------------------------
// loadTeamConfig / saveTeamConfig
// ---------------------------------------------------------------------------

describe('loadTeamConfig', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns null when no team config exists', () => {
    assert.strictEqual(loadTeamConfig(tmpDir), null);
  });

  it('returns parsed config when file exists', () => {
    const dir = makeTmpDir();
    try {
      const teamDirPath = path.join(dir, '.superteam', 'team');
      fs.mkdirSync(teamDirPath, { recursive: true });
      fs.writeFileSync(
        path.join(teamDirPath, 'config.json'),
        JSON.stringify({ team_name: 'test-team', status: 'active' }),
      );
      const config = loadTeamConfig(dir);
      assert.strictEqual(config.team_name, 'test-team');
      assert.strictEqual(config.status, 'active');
    } finally {
      rmTmpDir(dir);
    }
  });
});

describe('saveTeamConfig + loadTeamConfig round-trip', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('persists and retrieves identical values', () => {
    const original = {
      team_name: 'my-team',
      project_type: 'fullstack',
      status: 'active',
      members: [{ role: 'scrum-master', name: 'scrum-master', model: 'opus' }],
    };
    saveTeamConfig(tmpDir, original);
    const loaded = loadTeamConfig(tmpDir);
    assert.deepStrictEqual(loaded, original);
  });

  it('creates .superteam/team/ directory if missing', () => {
    const dir = makeTmpDir();
    try {
      const teamDirPath = path.join(dir, '.superteam', 'team');
      assert.ok(!fs.existsSync(teamDirPath));
      saveTeamConfig(dir, { team_name: 'new-team', status: 'active' });
      assert.ok(fs.existsSync(teamDirPath));
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// isTeamActive
// ---------------------------------------------------------------------------

describe('isTeamActive', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns false when no config exists', () => {
    assert.strictEqual(isTeamActive(tmpDir), false);
  });

  it('returns true when status is active', () => {
    saveTeamConfig(tmpDir, { status: 'active' });
    assert.strictEqual(isTeamActive(tmpDir), true);
  });

  it('returns false when status is disbanded', () => {
    saveTeamConfig(tmpDir, { status: 'disbanded' });
    assert.strictEqual(isTeamActive(tmpDir), false);
  });
});

// ---------------------------------------------------------------------------
// isTeamPaused
// ---------------------------------------------------------------------------

describe('isTeamPaused', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns false when no config exists', () => {
    assert.strictEqual(isTeamPaused(tmpDir), false);
  });

  it('returns true when status is paused', () => {
    saveTeamConfig(tmpDir, { status: 'paused' });
    assert.strictEqual(isTeamPaused(tmpDir), true);
  });

  it('returns false when status is active', () => {
    saveTeamConfig(tmpDir, { status: 'active' });
    assert.strictEqual(isTeamPaused(tmpDir), false);
  });
});

// ---------------------------------------------------------------------------
// isTeamPausing
// ---------------------------------------------------------------------------

describe('isTeamPausing', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns false when no config exists', () => {
    assert.strictEqual(isTeamPausing(tmpDir), false);
  });

  it('returns true when status is pausing', () => {
    saveTeamConfig(tmpDir, { status: 'pausing' });
    assert.strictEqual(isTeamPausing(tmpDir), true);
  });

  it('returns false when status is paused', () => {
    saveTeamConfig(tmpDir, { status: 'paused' });
    assert.strictEqual(isTeamPausing(tmpDir), false);
  });
});

// ---------------------------------------------------------------------------
// setTeamStatus
// ---------------------------------------------------------------------------

describe('setTeamStatus', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('updates status from active to pausing', () => {
    saveTeamConfig(tmpDir, { team_name: 'test', status: 'active', members: [] });
    setTeamStatus(tmpDir, 'pausing');
    const config = loadTeamConfig(tmpDir);
    assert.strictEqual(config.status, 'pausing');
    assert.strictEqual(config.team_name, 'test');
  });

  it('updates status from pausing to paused', () => {
    saveTeamConfig(tmpDir, { team_name: 'test', status: 'pausing', members: [] });
    setTeamStatus(tmpDir, 'paused');
    const config = loadTeamConfig(tmpDir);
    assert.strictEqual(config.status, 'paused');
  });

  it('updates status from paused to active', () => {
    saveTeamConfig(tmpDir, { team_name: 'test', status: 'paused', members: [] });
    setTeamStatus(tmpDir, 'active');
    const config = loadTeamConfig(tmpDir);
    assert.strictEqual(config.status, 'active');
  });

  it('returns false when no config exists', () => {
    const dir = makeTmpDir();
    try {
      assert.strictEqual(setTeamStatus(dir, 'paused'), false);
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// getTeamName
// ---------------------------------------------------------------------------

describe('getTeamName', () => {
  it('derives team name from directory', () => {
    assert.strictEqual(getTeamName('/home/user/my-project'), 'my-project-team');
  });

  it('sanitizes special characters', () => {
    assert.strictEqual(getTeamName('/home/user/My Project'), 'my-project-team');
  });

  it('handles paths with trailing slash', () => {
    assert.strictEqual(getTeamName('/home/user/app/'), 'app-team');
  });
});

// ---------------------------------------------------------------------------
// detectCICD
// ---------------------------------------------------------------------------

describe('detectCICD', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns false when no CI/CD markers exist', () => {
    assert.strictEqual(detectCICD(tmpDir), false);
  });

  it('returns true when Dockerfile exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'Dockerfile'), 'FROM node:20');
    assert.strictEqual(detectCICD(tmpDir), true);
  });

  it('returns true when .github/workflows exists', () => {
    const dir = makeTmpDir();
    try {
      fs.mkdirSync(path.join(dir, '.github', 'workflows'), { recursive: true });
      assert.strictEqual(detectCICD(dir), true);
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// detectUIFramework
// ---------------------------------------------------------------------------

describe('detectUIFramework', () => {
  it('returns false when no detection result', () => {
    assert.strictEqual(detectUIFramework(null), false);
    assert.strictEqual(detectUIFramework({}), false);
  });

  it('returns true when react is detected', () => {
    assert.strictEqual(detectUIFramework({ frameworks: ['react', 'express'] }), true);
  });

  it('returns true when vue is detected', () => {
    assert.strictEqual(detectUIFramework({ frameworks: ['vue'] }), true);
  });

  it('returns false when only backend frameworks', () => {
    assert.strictEqual(detectUIFramework({ frameworks: ['express', 'fastify'] }), false);
  });
});

// ---------------------------------------------------------------------------
// estimateProjectSize
// ---------------------------------------------------------------------------

describe('estimateProjectSize', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('uses override when provided', () => {
    const result = estimateProjectSize(tmpDir, {}, 'large');
    assert.strictEqual(result.size, 'large');
    assert.strictEqual(result.signal, 'user-override');
  });

  it('uses config value when no override', () => {
    const result = estimateProjectSize(tmpDir, { team: { size: 'small' } }, null);
    assert.strictEqual(result.size, 'small');
    assert.strictEqual(result.signal, 'config');
  });

  it('defaults to medium when no signals', () => {
    const result = estimateProjectSize(tmpDir, {}, null);
    assert.strictEqual(result.size, 'medium');
    assert.strictEqual(result.signal, 'default');
  });

  it('detects size from file count', () => {
    const dir = makeTmpDir();
    try {
      // Create 5 source files → small
      const srcDir = path.join(dir, 'src');
      fs.mkdirSync(srcDir, { recursive: true });
      for (let i = 0; i < 5; i++) {
        fs.writeFileSync(path.join(srcDir, `file${i}.js`), '// code');
      }
      const result = estimateProjectSize(dir, {}, null);
      assert.strictEqual(result.size, 'small');
      assert.strictEqual(result.signal, 'file-count');
    } finally {
      rmTmpDir(dir);
    }
  });

  it('ignores invalid override values', () => {
    const result = estimateProjectSize(tmpDir, {}, 'invalid');
    assert.strictEqual(result.signal, 'default');
  });
});

// ---------------------------------------------------------------------------
// estimateFromArtifacts
// ---------------------------------------------------------------------------

describe('estimateFromArtifacts', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns null when no artifacts exist', () => {
    assert.strictEqual(estimateFromArtifacts(tmpDir), null);
  });

  it('returns large when 5+ phases found', () => {
    const dir = makeTmpDir();
    try {
      fs.mkdirSync(path.join(dir, '.superteam'), { recursive: true });
      fs.writeFileSync(path.join(dir, '.superteam', 'ROADMAP.md'), [
        '# Phase 1: Init',
        '# Phase 2: Core',
        '# Phase 3: Features',
        '# Phase 4: Testing',
        '# Phase 5: Deploy',
      ].join('\n'));
      assert.strictEqual(estimateFromArtifacts(dir), 'large');
    } finally {
      rmTmpDir(dir);
    }
  });

  it('returns medium when 3-4 phases found', () => {
    const dir = makeTmpDir();
    try {
      fs.mkdirSync(path.join(dir, '.superteam'), { recursive: true });
      fs.writeFileSync(path.join(dir, '.superteam', 'ROADMAP.md'), [
        '## Phase 1: Init',
        '## Phase 2: Core',
        '## Phase 3: Features',
      ].join('\n'));
      assert.strictEqual(estimateFromArtifacts(dir), 'medium');
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// getRecommendedRoles
// ---------------------------------------------------------------------------

describe('getRecommendedRoles', () => {
  it('returns full core for medium fullstack project', () => {
    const result = getRecommendedRoles('fullstack', 'medium', { uiFramework: false, cicd: false });
    assert.deepStrictEqual(result.core, TEAM_PRESETS.fullstack);
    assert.deepStrictEqual(result.extended, []);
    assert.strictEqual(result.collapsed, null);
  });

  it('collapses tech-lead + senior-dev for small backend project', () => {
    const result = getRecommendedRoles('backend', 'small', { uiFramework: false, cicd: false });
    assert.ok(!result.core.includes('tech-lead'));
    assert.ok(!result.core.includes('senior-developer'));
    assert.ok(result.collapsed !== null);
    assert.deepStrictEqual(result.collapsed.from, ['tech-lead', 'senior-developer']);
    assert.strictEqual(result.collapsed.to, 'developer');
    assert.strictEqual(result.collapsed.modelOverride, 'opus');
  });

  it('returns minimal core for small frontend project', () => {
    const result = getRecommendedRoles('frontend', 'small', { uiFramework: false, cicd: false });
    assert.deepStrictEqual(result.core, ['scrum-master', 'developer', 'qa-engineer']);
    assert.strictEqual(result.collapsed, null);
  });

  it('extends with ux-designer when UI framework detected', () => {
    const result = getRecommendedRoles('backend', 'medium', { uiFramework: true, cicd: false });
    assert.ok(result.extended.includes('ux-designer'));
  });

  it('extends with devops-engineer when CI/CD detected', () => {
    const result = getRecommendedRoles('backend', 'medium', { uiFramework: false, cicd: true });
    assert.ok(result.extended.includes('devops-engineer'));
  });

  it('extends with second developer for large projects', () => {
    const result = getRecommendedRoles('backend', 'large', { uiFramework: false, cicd: false });
    assert.ok(result.extended.includes('developer'));
  });

  it('extends with second developer for monorepo', () => {
    const result = getRecommendedRoles('monorepo', 'medium', { uiFramework: false, cicd: false });
    assert.ok(result.extended.includes('developer'));
  });

  it('uses unknown preset for unrecognized types', () => {
    const result = getRecommendedRoles('java', 'medium', { uiFramework: false, cicd: false });
    assert.deepStrictEqual(result.core, TEAM_PRESETS.unknown);
  });
});

// ---------------------------------------------------------------------------
// assembleTeam
// ---------------------------------------------------------------------------

describe('assembleTeam', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('assembles a fullstack medium team', () => {
    const detection = { type: 'fullstack', frameworks: ['react', 'express'], workspaces: [] };
    const config = {};
    const result = assembleTeam(tmpDir, detection, config, 'medium');

    assert.strictEqual(result.project_type, 'fullstack');
    assert.strictEqual(result.size, 'medium');
    assert.ok(result.members.length >= 5);
    assert.ok(result.members.some(m => m.role === 'scrum-master'));
    assert.ok(result.members.some(m => m.role === 'tech-lead'));
    assert.ok(result.members.some(m => m.role === 'qa-engineer'));
  });

  it('includes ux-designer when react detected', () => {
    const detection = { type: 'fullstack', frameworks: ['react'], workspaces: [] };
    const result = assembleTeam(tmpDir, detection, {}, 'medium');
    assert.ok(result.members.some(m => m.role === 'ux-designer'));
  });

  it('names developers with suffix when multiple', () => {
    const detection = { type: 'monorepo', frameworks: ['react'], workspaces: ['a', 'b'] };
    const result = assembleTeam(tmpDir, detection, {}, 'large');
    const devs = result.members.filter(m => m.role === 'developer');
    assert.ok(devs.length >= 2, `Expected 2+ developers, got ${devs.length}`);
    // At least one should have dev-N naming
    assert.ok(devs.some(d => d.name.match(/^dev-\d+$/)));
  });

  it('handles null detection result', () => {
    const result = assembleTeam(tmpDir, null, {}, null);
    assert.strictEqual(result.project_type, 'unknown');
    assert.ok(result.members.length >= 3);
  });
});

// ---------------------------------------------------------------------------
// buildTeamContext
// ---------------------------------------------------------------------------

describe('buildTeamContext', () => {
  let tmpDir;
  before(() => { tmpDir = makeTmpDir(); });
  after(() => { rmTmpDir(tmpDir); });

  it('returns null when no team active', () => {
    assert.strictEqual(buildTeamContext(tmpDir), null);
  });

  it('returns context string when team is active', () => {
    saveTeamConfig(tmpDir, {
      team_name: 'test-team',
      status: 'active',
      members: [
        { role: 'scrum-master', name: 'scrum-master' },
        { role: 'developer', name: 'dev' },
      ],
    });
    const context = buildTeamContext(tmpDir);
    assert.ok(context.includes('test-team'));
    assert.ok(context.includes('2 members'));
    assert.ok(context.includes('scrum-master'));
  });
});

// ---------------------------------------------------------------------------
// countSourceFiles
// ---------------------------------------------------------------------------

describe('countSourceFiles', () => {
  it('counts source files recursively', () => {
    const dir = makeTmpDir();
    try {
      const srcDir = path.join(dir, 'src');
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'a.js'), '');
      fs.writeFileSync(path.join(srcDir, 'b.ts'), '');
      fs.writeFileSync(path.join(srcDir, 'readme.md'), ''); // not counted
      assert.strictEqual(countSourceFiles(dir), 2);
    } finally {
      rmTmpDir(dir);
    }
  });

  it('skips node_modules', () => {
    const dir = makeTmpDir();
    try {
      fs.mkdirSync(path.join(dir, 'node_modules', 'pkg'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'node_modules', 'pkg', 'index.js'), '');
      fs.writeFileSync(path.join(dir, 'app.js'), '');
      assert.strictEqual(countSourceFiles(dir), 1);
    } finally {
      rmTmpDir(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('ROLE_DEFINITIONS', () => {
  it('has all expected roles', () => {
    const expected = [
      'scrum-master', 'tech-lead', 'senior-developer',
      'developer', 'qa-engineer', 'ux-designer', 'devops-engineer',
    ];
    for (const role of expected) {
      assert.ok(ROLE_DEFINITIONS[role], `Missing role: ${role}`);
      assert.ok(ROLE_DEFINITIONS[role].model, `Missing model for: ${role}`);
      assert.ok(ROLE_DEFINITIONS[role].type, `Missing type for: ${role}`);
    }
  });
});

describe('TEAM_PRESETS', () => {
  it('has presets for all project types', () => {
    const types = ['frontend', 'backend', 'fullstack', 'monorepo', 'php', 'go', 'python', 'rust', 'unknown'];
    for (const type of types) {
      assert.ok(TEAM_PRESETS[type], `Missing preset for: ${type}`);
      assert.ok(Array.isArray(TEAM_PRESETS[type]), `Preset not array for: ${type}`);
      assert.ok(TEAM_PRESETS[type].includes('scrum-master'), `${type} missing scrum-master`);
    }
  });
});
