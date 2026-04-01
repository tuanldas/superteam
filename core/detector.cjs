'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { readJsonSafe, fileExists } = require('./utils.cjs');

/**
 * Map of dependency names to framework categories.
 */
const DEPENDENCY_SIGNALS = {
  // Frontend
  react: 'frontend',
  vue: 'frontend',
  '@angular/core': 'frontend',
  svelte: 'frontend',
  // Fullstack
  next: 'fullstack',
  nuxt: 'fullstack',
  remix: 'fullstack',
  // Backend
  express: 'backend',
  fastify: 'backend',
  '@nestjs/core': 'backend',
  koa: 'backend',
  hono: 'backend',
};

/**
 * Array of framework marker objects. Each has:
 *   - file: filename to look for
 *   - detect(rootDir): returns array of { name, category } or empty array
 */
const FRAMEWORK_MARKERS = [
  {
    file: 'package.json',
    detect(rootDir) {
      const data = readJsonSafe(path.join(rootDir, 'package.json'));
      if (!data) return [];
      const allDeps = {
        ...data.dependencies,
        ...data.devDependencies,
      };
      const results = [];
      for (const [dep, category] of Object.entries(DEPENDENCY_SIGNALS)) {
        if (allDeps[dep]) {
          results.push({ name: dep, category });
        }
      }
      return results;
    },
  },
  {
    file: 'composer.json',
    detect(rootDir) {
      const data = readJsonSafe(path.join(rootDir, 'composer.json'));
      if (!data) return [];
      const results = [{ name: 'php', category: 'php' }];
      const allDeps = {
        ...data.require,
        ...data['require-dev'],
      };
      if (allDeps['laravel/framework']) {
        results.push({ name: 'laravel', category: 'php' });
      }
      return results;
    },
  },
  {
    file: 'go.mod',
    detect(rootDir) {
      if (!fileExists(path.join(rootDir, 'go.mod'))) return [];
      return [{ name: 'go', category: 'go' }];
    },
  },
  {
    file: 'pyproject.toml',
    detect(rootDir) {
      if (!fileExists(path.join(rootDir, 'pyproject.toml'))) return [];
      return [{ name: 'python', category: 'python' }];
    },
  },
  {
    file: 'requirements.txt',
    detect(rootDir) {
      if (!fileExists(path.join(rootDir, 'requirements.txt'))) return [];
      return [{ name: 'python', category: 'python' }];
    },
  },
  {
    file: 'Cargo.toml',
    detect(rootDir) {
      if (!fileExists(path.join(rootDir, 'Cargo.toml'))) return [];
      return [{ name: 'rust', category: 'rust' }];
    },
  },
  {
    file: 'pnpm-workspace.yaml',
    detect(rootDir) {
      if (!fileExists(path.join(rootDir, 'pnpm-workspace.yaml'))) return [];
      return [{ name: 'pnpm-workspace', category: 'monorepo' }];
    },
  },
  {
    file: 'lerna.json',
    detect(rootDir) {
      if (!fileExists(path.join(rootDir, 'lerna.json'))) return [];
      return [{ name: 'lerna', category: 'monorepo' }];
    },
  },
  {
    file: 'artisan',
    detect(rootDir) {
      if (!fileExists(path.join(rootDir, 'artisan'))) return [];
      return [{ name: 'laravel', category: 'php' }];
    },
  },
];

/**
 * Detect project type, frameworks, workspaces, and confidence.
 *
 * @param {string} rootDir - Absolute path to the project root.
 * @returns {{ type: string, frameworks: string[], workspaces: string[], confidence: number }}
 */
function detectProject(rootDir) {
  const frameworks = [];
  const seenNames = new Set();
  const categories = new Set();

  // Run all markers
  for (const marker of FRAMEWORK_MARKERS) {
    try {
      const hits = marker.detect(rootDir);
      for (const hit of hits) {
        if (!seenNames.has(hit.name)) {
          seenNames.add(hit.name);
          frameworks.push(hit.name);
        }
        categories.add(hit.category);
      }
    } catch {
      // Graceful — skip marker on any unexpected error
    }
  }

  // Workspace detection
  const workspaces = [];
  try {
    const pkg = readJsonSafe(path.join(rootDir, 'package.json'));
    if (pkg && pkg.workspaces) {
      const ws = Array.isArray(pkg.workspaces)
        ? pkg.workspaces
        : pkg.workspaces.packages || [];
      workspaces.push(...ws);
    }
  } catch {
    // ignore
  }

  if (categories.has('monorepo') || workspaces.length > 0) {
    // pnpm-workspace or lerna also count
    if (categories.has('monorepo') && workspaces.length === 0) {
      workspaces.push('(detected via marker)');
    }
  }

  // Type resolution
  let type = 'unknown';
  const hasWorkspaces = workspaces.length > 0;
  const hasFrontend = categories.has('frontend');
  const hasBackend = categories.has('backend');
  const hasFullstack = categories.has('fullstack');
  const hasPhp = categories.has('php');
  const hasGo = categories.has('go');
  const hasPython = categories.has('python');
  const hasRust = categories.has('rust');

  if (hasWorkspaces) {
    type = 'monorepo';
  } else if (hasFrontend && hasBackend) {
    type = 'fullstack';
  } else if (hasFrontend && !hasBackend && !hasFullstack) {
    type = 'frontend';
  } else if (hasBackend && !hasFrontend && !hasFullstack) {
    type = 'backend';
  } else if (hasFullstack) {
    type = 'fullstack';
  } else if (hasPhp) {
    type = 'php';
  } else if (hasGo) {
    type = 'go';
  } else if (hasPython) {
    type = 'python';
  } else if (hasRust) {
    type = 'rust';
  }

  // Confidence
  let confidence = 0;
  if (frameworks.length === 0) {
    confidence = 0;
  } else if (frameworks.length === 1) {
    confidence = 0.3;
  } else if (categories.size >= 2 || frameworks.length >= 3) {
    confidence = 1.0;
  } else {
    confidence = 0.5;
  }

  return { type, frameworks, workspaces, confidence };
}

/**
 * Detect which workspace a file belongs to.
 *
 * @param {string} rootDir - Absolute path to the project root.
 * @param {string} filePath - Absolute or root-relative path to a file.
 * @param {{ workspaces: string[] }} detectionResult - Output from detectProject.
 * @returns {{ workspace: string|null, matched: boolean }}
 */
function detectScope(rootDir, filePath, detectionResult) {
  if (
    !detectionResult ||
    !detectionResult.workspaces ||
    detectionResult.workspaces.length === 0
  ) {
    return { workspace: null, matched: false };
  }

  // Normalise filePath to be relative to rootDir
  let relative = filePath;
  if (path.isAbsolute(filePath)) {
    relative = path.relative(rootDir, filePath);
  }
  // Normalise separators
  relative = relative.split(path.sep).join('/');

  for (const ws of detectionResult.workspaces) {
    // Strip trailing glob patterns like /* or /**
    const wsClean = ws.replace(/\/\*+$/, '');
    if (relative.startsWith(wsClean + '/') || relative === wsClean) {
      return { workspace: wsClean, matched: true };
    }
  }

  return { workspace: null, matched: false };
}

module.exports = { detectProject, detectScope, FRAMEWORK_MARKERS, DEPENDENCY_SIGNALS };
