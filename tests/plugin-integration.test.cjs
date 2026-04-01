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
// 2. Commands (valid frontmatter, core subset check)
// ---------------------------------------------------------------------------

describe('Commands', () => {
  const commandsDir = path.join(PLUGIN_ROOT, 'commands');
  let commandFiles;

  before(() => {
    commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  });

  it('has at least 30 command files', () => {
    assert.ok(commandFiles.length >= 30, `Expected >= 30 commands, got ${commandFiles.length}`);
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

  it('includes core commands', () => {
    const coreCommands = [
      'init', 'plan', 'execute', 'debug', 'brainstorm',
      'code-review', 'tdd', 'team', 'resume', 'pause',
    ];
    const actual = commandFiles.map(f => f.replace('.md', ''));
    for (const cmd of coreCommands) {
      assert.ok(actual.includes(cmd), `Missing core command: ${cmd}`);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Skills (valid SKILL.md + frontmatter, core subset check)
// ---------------------------------------------------------------------------

describe('Skills', () => {
  const skillsDir = path.join(PLUGIN_ROOT, 'skills');
  let skillDirs;

  before(() => {
    skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  });

  it('has at least 14 skill directories', () => {
    assert.ok(skillDirs.length >= 14, `Expected >= 14 skills, got ${skillDirs.length}`);
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

  it('includes core skills', () => {
    const coreSkills = [
      'core-principles', 'frontend-design', 'tdd-discipline',
      'scientific-debugging', 'verification', 'wave-parallelism',
    ];
    for (const skill of coreSkills) {
      assert.ok(skillDirs.includes(skill), `Missing core skill: ${skill}`);
    }
  });

  it('has at least 9 reference resources across skills', () => {
    let refCount = 0;
    for (const dir of skillDirs) {
      const files = fs.readdirSync(path.join(skillsDir, dir));
      refCount += files.filter(f => f !== 'SKILL.md').length;
    }
    assert.ok(refCount >= 9, `Expected >= 9 references, got ${refCount}`);
  });
});

// ---------------------------------------------------------------------------
// 4. Agents (valid frontmatter, core subset check)
// ---------------------------------------------------------------------------

describe('Agents', () => {
  const agentsDir = path.join(PLUGIN_ROOT, 'agents');
  let agentFiles;

  before(() => {
    agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  });

  it('has at least 21 agent files', () => {
    assert.ok(agentFiles.length >= 21, `Expected >= 21 agents, got ${agentFiles.length}`);
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

  it('includes core agents', () => {
    const coreAgents = [
      'planner', 'executor', 'debugger', 'reviewer',
      'scrum-master', 'senior-developer', 'tech-lead',
    ];
    const actual = agentFiles.map(f => f.replace('.md', ''));
    for (const agent of coreAgents) {
      assert.ok(actual.includes(agent), `Missing core agent: ${agent}`);
    }
  });

  it('core agents use opus model', () => {
    const opusAgents = [
      'planner.md', 'executor.md', 'debugger.md', 'reviewer.md',
      'scrum-master.md', 'senior-developer.md', 'tech-lead.md',
      'research-orchestrator.md',
    ];
    for (const file of opusAgents) {
      const filePath = path.join(agentsDir, file);
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('model: opus'), `${file} should use opus`);
    }
  });

  it('utility agents use sonnet model', () => {
    const opusAgents = [
      'planner.md', 'executor.md', 'debugger.md', 'reviewer.md',
      'scrum-master.md', 'senior-developer.md', 'tech-lead.md',
      'research-orchestrator.md',
    ];
    const utilAgents = agentFiles.filter(f => !opusAgents.includes(f));
    for (const file of utilAgents) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      assert.ok(content.includes('model: sonnet'), `${file} should use sonnet`);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Templates (core subset check)
// ---------------------------------------------------------------------------

describe('Templates', () => {
  const templatesDir = path.join(PLUGIN_ROOT, 'templates');

  it('has at least 8 template files', () => {
    const files = fs.readdirSync(templatesDir);
    assert.ok(files.length >= 8, `Expected >= 8 templates, got ${files.length}`);
  });

  it('includes core templates', () => {
    const coreTemplates = [
      'config.json', 'project.md', 'roadmap.md', 'team-config.json',
    ];
    const actual = fs.readdirSync(templatesDir);
    for (const tpl of coreTemplates) {
      assert.ok(actual.includes(tpl), `Missing core template: ${tpl}`);
    }
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
