'use strict';

const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { detectProject, detectScope, FRAMEWORK_MARKERS, DEPENDENCY_SIGNALS } = require('../core/detector.cjs');

/**
 * Create a temp directory and return its path.
 * The caller is responsible for cleanup.
 */
function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'superteam-test-'));
}

/**
 * Write a JSON file inside the given directory.
 */
function writeJson(dir, filename, data) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
}

/**
 * Write a plain text file inside the given directory.
 */
function writeFile(dir, filename, content = '') {
  fs.writeFileSync(path.join(dir, filename), content);
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

describe('DEPENDENCY_SIGNALS', () => {
  it('maps frontend dependencies correctly', () => {
    assert.equal(DEPENDENCY_SIGNALS['react'], 'frontend');
    assert.equal(DEPENDENCY_SIGNALS['vue'], 'frontend');
    assert.equal(DEPENDENCY_SIGNALS['@angular/core'], 'frontend');
    assert.equal(DEPENDENCY_SIGNALS['svelte'], 'frontend');
  });

  it('maps fullstack dependencies correctly', () => {
    assert.equal(DEPENDENCY_SIGNALS['next'], 'fullstack');
    assert.equal(DEPENDENCY_SIGNALS['nuxt'], 'fullstack');
    assert.equal(DEPENDENCY_SIGNALS['remix'], 'fullstack');
  });

  it('maps backend dependencies correctly', () => {
    assert.equal(DEPENDENCY_SIGNALS['express'], 'backend');
    assert.equal(DEPENDENCY_SIGNALS['fastify'], 'backend');
    assert.equal(DEPENDENCY_SIGNALS['@nestjs/core'], 'backend');
    assert.equal(DEPENDENCY_SIGNALS['koa'], 'backend');
    assert.equal(DEPENDENCY_SIGNALS['hono'], 'backend');
  });
});

describe('FRAMEWORK_MARKERS', () => {
  it('is a non-empty array of objects with file and detect', () => {
    assert.ok(Array.isArray(FRAMEWORK_MARKERS));
    assert.ok(FRAMEWORK_MARKERS.length > 0);
    for (const marker of FRAMEWORK_MARKERS) {
      assert.equal(typeof marker.file, 'string');
      assert.equal(typeof marker.detect, 'function');
    }
  });
});

describe('detectProject', () => {
  // 1. React project
  describe('React project', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('detects type: frontend with react framework', () => {
      dir = makeTmpDir();
      writeJson(dir, 'package.json', {
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
      });
      const result = detectProject(dir);
      assert.equal(result.type, 'frontend');
      assert.ok(result.frameworks.includes('react'));
    });
  });

  // 2. Express project
  describe('Express project', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('detects type: backend', () => {
      dir = makeTmpDir();
      writeJson(dir, 'package.json', {
        dependencies: { express: '^4.18.0' },
      });
      const result = detectProject(dir);
      assert.equal(result.type, 'backend');
      assert.ok(result.frameworks.includes('express'));
    });
  });

  // 3. Next.js project
  describe('Next.js project', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('detects type: fullstack', () => {
      dir = makeTmpDir();
      writeJson(dir, 'package.json', {
        dependencies: { next: '^14.0.0', react: '^18.0.0' },
      });
      const result = detectProject(dir);
      assert.equal(result.type, 'fullstack');
      assert.ok(result.frameworks.includes('next'));
    });
  });

  // 4. Go project
  describe('Go project', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('detects type: go', () => {
      dir = makeTmpDir();
      writeFile(dir, 'go.mod', 'module example.com/myapp\n\ngo 1.21\n');
      const result = detectProject(dir);
      assert.equal(result.type, 'go');
      assert.ok(result.frameworks.includes('go'));
    });
  });

  // 5. Python project (pyproject.toml)
  describe('Python project', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('detects type: python from pyproject.toml', () => {
      dir = makeTmpDir();
      writeFile(dir, 'pyproject.toml', '[project]\nname = "myapp"\n');
      const result = detectProject(dir);
      assert.equal(result.type, 'python');
      assert.ok(result.frameworks.includes('python'));
    });
  });

  // 6. Laravel project
  describe('Laravel project', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('detects type: php with laravel from composer.json + artisan', () => {
      dir = makeTmpDir();
      writeJson(dir, 'composer.json', {
        require: { 'laravel/framework': '^10.0' },
      });
      writeFile(dir, 'artisan', '#!/usr/bin/env php\n');
      const result = detectProject(dir);
      assert.equal(result.type, 'php');
      assert.ok(result.frameworks.includes('laravel'));
      assert.ok(result.frameworks.includes('php'));
    });
  });

  // 7. Monorepo
  describe('Monorepo project', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('detects type: monorepo when package.json has workspaces', () => {
      dir = makeTmpDir();
      writeJson(dir, 'package.json', {
        workspaces: ['packages/*', 'apps/*'],
        dependencies: { react: '^18.0.0' },
      });
      const result = detectProject(dir);
      assert.equal(result.type, 'monorepo');
      assert.ok(result.workspaces.length > 0);
    });
  });

  // 8. Empty directory
  describe('Empty directory', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('returns type: unknown with confidence 0', () => {
      dir = makeTmpDir();
      const result = detectProject(dir);
      assert.equal(result.type, 'unknown');
      assert.equal(result.confidence, 0);
      assert.deepEqual(result.frameworks, []);
    });
  });

  // 10. Multiple frameworks → higher confidence
  describe('Multiple frameworks detected', () => {
    let dir;
    after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

    it('has higher confidence with multiple signals', () => {
      dir = makeTmpDir();
      writeJson(dir, 'package.json', {
        dependencies: { react: '^18.0.0', express: '^4.18.0', vue: '^3.0.0' },
      });
      const result = detectProject(dir);
      assert.ok(result.confidence >= 0.5, `Expected confidence >= 0.5, got ${result.confidence}`);
      assert.ok(result.frameworks.length >= 2);
    });
  });
});

// 9. Scope detection with workspaces
describe('detectScope', () => {
  let dir;
  after(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  it('matches the correct workspace for a file path', () => {
    dir = makeTmpDir();
    writeJson(dir, 'package.json', {
      workspaces: ['packages/*', 'apps/*'],
    });

    const detection = detectProject(dir);

    // Absolute path under apps/web
    const scope1 = detectScope(dir, path.join(dir, 'apps', 'web', 'index.js'), detection);
    assert.equal(scope1.matched, true);
    assert.equal(scope1.workspace, 'apps');

    // Relative path under packages/shared
    const scope2 = detectScope(dir, 'packages/shared/util.js', detection);
    assert.equal(scope2.matched, true);
    assert.equal(scope2.workspace, 'packages');
  });

  it('returns matched: false for files outside any workspace', () => {
    dir = makeTmpDir();
    const detection = { workspaces: ['packages/*'] };
    const scope = detectScope(dir, 'src/main.js', detection);
    assert.equal(scope.matched, false);
    assert.equal(scope.workspace, null);
  });

  it('returns matched: false when no workspaces present', () => {
    dir = makeTmpDir();
    const detection = { workspaces: [] };
    const scope = detectScope(dir, 'anything.js', detection);
    assert.equal(scope.matched, false);
    assert.equal(scope.workspace, null);
  });
});
