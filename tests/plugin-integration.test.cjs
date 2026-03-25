'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PLUGIN_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Plugin Structure
// ---------------------------------------------------------------------------

describe('Plugin Structure', () => {
  it('has valid plugin.json', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), 'utf8')
    );
    assert.equal(manifest.name, 'st');
    assert.ok(manifest.description);
    assert.ok(manifest.version);
  });

  it('has hooks.json with SessionStart', () => {
    const hooks = JSON.parse(
      fs.readFileSync(path.join(PLUGIN_ROOT, 'hooks', 'hooks.json'), 'utf8')
    );
    assert.ok(hooks.hooks.SessionStart);
    assert.ok(hooks.hooks.SessionStart.length > 0);
    assert.equal(hooks.hooks.SessionStart[0].hooks[0].type, 'command');
  });

  it('has package.json with test script', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(PLUGIN_ROOT, 'package.json'), 'utf8')
    );
    assert.ok(pkg.scripts.test);
  });
});

// ---------------------------------------------------------------------------
// 2. Commands (29 files, valid frontmatter)
// ---------------------------------------------------------------------------

describe('Commands', () => {
  const commandsDir = path.join(PLUGIN_ROOT, 'commands');
  let commandFiles;

  before(() => {
    commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  });

  it('has exactly 29 command files', () => {
    assert.equal(commandFiles.length, 29);
  });

  it('every command has YAML frontmatter with description', () => {
    for (const file of commandFiles) {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
      assert.ok(content.startsWith('---'), `${file} missing frontmatter`);
      assert.ok(content.includes('description:'), `${file} missing description`);
      // Check frontmatter closes
      const secondDash = content.indexOf('---', 3);
      assert.ok(secondDash > 3, `${file} frontmatter not closed`);
    }
  });

  it('command names match expected set', () => {
    const expected = [
      'api-docs', 'brainstorm', 'code-review', 'debug', 'debug-quick',
      'design-system', 'execute', 'init', 'milestone-archive', 'milestone-audit',
      'milestone-complete', 'milestone-new', 'pause', 'phase-add',
      'phase-discuss', 'phase-execute', 'phase-list', 'phase-plan',
      'phase-remove', 'phase-research', 'phase-validate', 'plan', 'quick',
      'readme', 'resume', 'review-feedback', 'tdd', 'ui-design', 'worktree',
    ];
    const actual = commandFiles.map(f => f.replace('.md', '')).sort();
    assert.deepEqual(actual, expected);
  });
});

// ---------------------------------------------------------------------------
// 3. Skills (11 SKILL.md + 7 reference files)
// ---------------------------------------------------------------------------

describe('Skills', () => {
  const skillsDir = path.join(PLUGIN_ROOT, 'skills');
  let skillDirs;

  before(() => {
    skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  });

  it('has exactly 11 skill directories', () => {
    assert.equal(skillDirs.length, 11);
  });

  it('every skill has SKILL.md with valid frontmatter', () => {
    for (const dir of skillDirs) {
      const skillFile = path.join(skillsDir, dir, 'SKILL.md');
      assert.ok(fs.existsSync(skillFile), `${dir}/SKILL.md missing`);
      const content = fs.readFileSync(skillFile, 'utf8');
      assert.ok(content.startsWith('---'), `${dir}/SKILL.md missing frontmatter`);
      assert.ok(content.includes('name:'), `${dir}/SKILL.md missing name`);
      assert.ok(content.includes('description:'), `${dir}/SKILL.md missing description`);
    }
  });

  it('skill names match expected set', () => {
    const expected = [
      'atomic-commits', 'handoff-protocol', 'plan-quality',
      'project-awareness', 'receiving-code-review', 'requesting-code-review',
      'research-methodology', 'scientific-debugging', 'tdd-discipline',
      'verification', 'wave-parallelism',
    ];
    assert.deepEqual(skillDirs.sort(), expected);
  });

  it('has 7 reference files across skills', () => {
    const refFiles = [];
    for (const dir of skillDirs) {
      const files = fs.readdirSync(path.join(skillsDir, dir));
      for (const f of files) {
        if (f !== 'SKILL.md') refFiles.push(`${dir}/${f}`);
      }
    }
    assert.equal(refFiles.length, 8);
  });
});

// ---------------------------------------------------------------------------
// 4. Agents (13 files, valid frontmatter)
// ---------------------------------------------------------------------------

describe('Agents', () => {
  const agentsDir = path.join(PLUGIN_ROOT, 'agents');
  let agentFiles;

  before(() => {
    agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  });

  it('has exactly 13 agent files', () => {
    assert.equal(agentFiles.length, 13);
  });

  it('every agent has frontmatter with name, description, model', () => {
    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      assert.ok(content.startsWith('---'), `${file} missing frontmatter`);
      assert.ok(content.includes('name:'), `${file} missing name`);
      assert.ok(content.includes('description:'), `${file} missing description`);
      assert.ok(content.includes('model:'), `${file} missing model`);
    }
  });

  it('agent names match expected set', () => {
    const expected = [
      'codebase-mapper', 'debugger', 'executor', 'integration-checker',
      'phase-researcher', 'plan-checker', 'planner', 'research-synthesizer',
      'reviewer', 'test-auditor', 'ui-auditor', 'ui-researcher', 'verifier',
    ];
    const actual = agentFiles.map(f => f.replace('.md', '')).sort();
    assert.deepEqual(actual, expected);
  });

  it('core agents use opus model', () => {
    const coreAgents = ['planner.md', 'executor.md', 'debugger.md', 'reviewer.md'];
    for (const file of coreAgents) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      assert.ok(content.includes('model: opus'), `${file} should use opus`);
    }
  });

  it('utility agents use sonnet model', () => {
    const utilAgents = agentFiles.filter(
      f => !['planner.md', 'executor.md', 'debugger.md', 'reviewer.md'].includes(f)
    );
    for (const file of utilAgents) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      assert.ok(content.includes('model: sonnet'), `${file} should use sonnet`);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Templates (7 files)
// ---------------------------------------------------------------------------

describe('Templates', () => {
  const templatesDir = path.join(PLUGIN_ROOT, 'templates');

  it('has exactly 7 template files', () => {
    const files = fs.readdirSync(templatesDir);
    assert.equal(files.length, 7);
  });

  it('template names match expected set', () => {
    const expected = [
      'api-docs.md', 'config.json', 'handoff.json',
      'project.md', 'readme.md', 'requirements.md', 'roadmap.md',
    ];
    const actual = fs.readdirSync(templatesDir).sort();
    assert.deepEqual(actual, expected);
  });
});

// ---------------------------------------------------------------------------
// 6. Session-Start Hook
// ---------------------------------------------------------------------------

describe('Session-Start Hook', () => {
  const hookScript = path.join(PLUGIN_ROOT, 'hooks', 'session-start.cjs');

  it('produces valid JSON from project root', () => {
    const output = execFileSync('node', [hookScript], {
      cwd: PLUGIN_ROOT,
      encoding: 'utf8',
    });
    const json = JSON.parse(output);
    assert.ok(json.hookSpecificOutput);
    assert.equal(json.hookSpecificOutput.hookEventName, 'SessionStart');
    assert.equal(typeof json.hookSpecificOutput.additionalContext, 'string');
  });

  it('produces valid JSON from empty directory (graceful fallback)', () => {
    const tmpDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'st-hook-'));
    try {
      const output = execFileSync('node', [hookScript], {
        cwd: tmpDir,
        encoding: 'utf8',
      });
      const json = JSON.parse(output);
      assert.ok(json.hookSpecificOutput);
      assert.ok(json.hookSpecificOutput.additionalContext.includes('unknown'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('detects React project correctly', () => {
    const tmpDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'st-hook-'));
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      dependencies: { react: '^18.0.0' },
    }));
    try {
      const output = execFileSync('node', [hookScript], {
        cwd: tmpDir,
        encoding: 'utf8',
      });
      const ctx = JSON.parse(output).hookSpecificOutput.additionalContext;
      assert.ok(ctx.includes('frontend'));
      assert.ok(ctx.includes('react'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// 7. Core Module Cross-Integration
// ---------------------------------------------------------------------------

describe('Core Module Integration', () => {
  it('detector + config + template work together', () => {
    const { detectProject } = require(path.join(PLUGIN_ROOT, 'core', 'detector.cjs'));
    const { buildDefaultConfig } = require(path.join(PLUGIN_ROOT, 'core', 'config.cjs'));
    const { renderTemplate } = require(path.join(PLUGIN_ROOT, 'core', 'template.cjs'));

    // Detect → build config → render template
    const tmpDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'st-integ-'));
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'test-app',
      dependencies: { express: '^4.0.0' },
    }));

    try {
      const detection = detectProject(tmpDir);
      assert.equal(detection.type, 'backend');

      const config = buildDefaultConfig(detection, { name: 'test-app' });
      assert.equal(config.name, 'test-app');
      assert.equal(config.type, 'backend');

      const rendered = renderTemplate('# {{name}} ({{type}})', config);
      assert.equal(rendered, '# test-app (backend)');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
