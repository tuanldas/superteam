'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { readJsonSafe, fileExists } = require('./utils.cjs');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Role definitions: role name → { model, type ('core' | 'optional') }
 */
const ROLE_DEFINITIONS = Object.freeze({
  'scrum-master':      { model: 'opus',   type: 'core',     description: 'Orchestrate, decompose tasks, assign, remove blockers' },
  'tech-lead':         { model: 'opus',   type: 'core',     description: 'Architecture, design decisions, tech choices' },
  'senior-developer':  { model: 'opus',   type: 'core',     description: 'Complex implementation, code review, mentor' },
  'developer':         { model: 'sonnet', type: 'core',     description: 'Standard implementation, follow plans' },
  'qa-engineer':       { model: 'sonnet', type: 'core',     description: 'Test, verify, quality gate' },
  'ux-designer':       { model: 'sonnet', type: 'optional', description: 'UI spec, visual audit' },
  'devops-engineer':   { model: 'sonnet', type: 'optional', description: 'CI/CD, pipeline, infrastructure' },
});

/**
 * Team presets per project type.
 * Each entry is an array of role names (order matters — first is team lead).
 */
const TEAM_PRESETS = Object.freeze({
  frontend:  ['scrum-master', 'developer', 'qa-engineer'],
  backend:   ['scrum-master', 'tech-lead', 'senior-developer', 'developer', 'qa-engineer'],
  fullstack: ['scrum-master', 'tech-lead', 'senior-developer', 'developer', 'qa-engineer'],
  monorepo:  ['scrum-master', 'tech-lead', 'senior-developer', 'developer', 'qa-engineer'],
  php:       ['scrum-master', 'tech-lead', 'senior-developer', 'developer', 'qa-engineer'],
  go:        ['scrum-master', 'tech-lead', 'senior-developer', 'developer', 'qa-engineer'],
  python:    ['scrum-master', 'developer', 'qa-engineer'],
  rust:      ['scrum-master', 'tech-lead', 'senior-developer', 'developer', 'qa-engineer'],
  unknown:   ['scrum-master', 'developer', 'qa-engineer'],
});

/**
 * Extend signals: signal key → role to add.
 */
const EXTEND_SIGNALS = Object.freeze({
  ui_framework: 'ux-designer',
  cicd_config:  'devops-engineer',
  large_or_monorepo: 'developer',   // adds second developer
});

/**
 * Files that indicate CI/CD configuration is present.
 */
const CICD_MARKERS = Object.freeze([
  '.github/workflows',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  '.gitlab-ci.yml',
  'Jenkinsfile',
  'bitbucket-pipelines.yml',
]);

/**
 * UI frameworks that trigger UX Designer extend signal.
 */
const UI_FRAMEWORK_NAMES = Object.freeze([
  'react', 'vue', '@angular/core', 'svelte', 'next', 'nuxt', 'remix',
]);

const SIZE_THRESHOLDS = Object.freeze({
  small: 20,
  large: 100,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function teamDir(rootDir) {
  return path.join(rootDir, '.superteam', 'team');
}

function teamConfigPath(rootDir) {
  return path.join(teamDir(rootDir), 'config.json');
}

/**
 * Count source files recursively, excluding node_modules, .git, vendor, etc.
 */
function countSourceFiles(dir, maxDepth = 5) {
  const SKIP_DIRS = new Set([
    'node_modules', '.git', 'vendor', 'dist', 'build', '.next',
    '__pycache__', '.venv', 'venv', 'target', '.superteam',
  ]);
  const SOURCE_EXTS = new Set([
    '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
    '.py', '.go', '.rs', '.php',
    '.css', '.scss', '.less',
    '.html', '.json', '.yaml', '.yml', '.toml',
  ]);

  let count = 0;

  function walk(currentDir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          walk(path.join(currentDir, entry.name), depth + 1);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SOURCE_EXTS.has(ext)) {
          count++;
        }
      }
    }
  }

  walk(dir, 0);
  return count;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read `.superteam/team/config.json`. Returns null if not found.
 */
function loadTeamConfig(rootDir) {
  return readJsonSafe(teamConfigPath(rootDir));
}

/**
 * Save team config to `.superteam/team/config.json`.
 */
function saveTeamConfig(rootDir, config) {
  const dir = teamDir(rootDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    teamConfigPath(rootDir),
    JSON.stringify(config, null, 2) + '\n',
    'utf-8',
  );
}

/**
 * Check if a team is currently active.
 */
function isTeamActive(rootDir) {
  const config = loadTeamConfig(rootDir);
  return config !== null && config.status === 'active';
}

/**
 * Check if a team is currently paused.
 */
function isTeamPaused(rootDir) {
  const config = loadTeamConfig(rootDir);
  return config !== null && config.status === 'paused';
}

/**
 * Check if a team pause has been requested (waiting for current step to finish).
 */
function isTeamPausing(rootDir) {
  const config = loadTeamConfig(rootDir);
  return config !== null && config.status === 'pausing';
}

/**
 * Update team status in config.json. Preserves all other fields.
 * Returns true if updated, false if no config found.
 *
 * @param {string} rootDir
 * @param {'active'|'pausing'|'paused'|'disbanded'} newStatus
 * @returns {boolean}
 */
function setTeamStatus(rootDir, newStatus) {
  const config = loadTeamConfig(rootDir);
  if (!config) return false;
  config.status = newStatus;
  saveTeamConfig(rootDir, config);
  return true;
}

/**
 * Path to TEAM-HANDOFF.json.
 */
function teamHandoffPath(rootDir) {
  return path.join(teamDir(rootDir), 'TEAM-HANDOFF.json');
}

/**
 * Path to TEAM-HANDOFF.md.
 */
function teamHandoffMdPath(rootDir) {
  return path.join(teamDir(rootDir), 'TEAM-HANDOFF.md');
}

/**
 * Save team handoff state (JSON + human-readable Markdown).
 *
 * @param {string} rootDir
 * @param {Object} handoff - Handoff data object
 */
function saveTeamHandoff(rootDir, handoff) {
  const dir = teamDir(rootDir);
  fs.mkdirSync(dir, { recursive: true });

  // JSON
  fs.writeFileSync(
    teamHandoffPath(rootDir),
    JSON.stringify(handoff, null, 2) + '\n',
    'utf-8',
  );

  // Markdown
  const assignments = handoff.agentAssignments || {};
  const agentLines = Object.entries(assignments)
    .map(([name, info]) => `- **${name}**: ${info.task || 'idle'} (${info.progress})`)
    .join('\n');

  const md = [
    '# Team Handoff',
    '',
    `**Paused at:** ${handoff.pausedAt}`,
    `**Workflow:** ${handoff.workflow}`,
    `**Reason:** ${handoff.reason}`,
    '',
    '## Progress',
    '',
    `**Phase ${handoff.currentPhase}** — step: ${handoff.currentStep}`,
    '',
    `- Completed: ${handoff.completedSteps.join(', ') || 'none'}`,
    `- Pending: ${handoff.pendingSteps.join(', ') || 'none'}`,
    '',
    '## Agent Assignments',
    '',
    agentLines || '(no agents assigned)',
    '',
    '## Resume',
    '',
    'Run `/st:team resume` to continue.',
    '',
  ].join('\n');

  fs.writeFileSync(teamHandoffMdPath(rootDir), md, 'utf-8');
}

/**
 * Load team handoff state. Returns null if not found.
 */
function loadTeamHandoff(rootDir) {
  return readJsonSafe(teamHandoffPath(rootDir));
}

/**
 * Remove TEAM-HANDOFF.json and TEAM-HANDOFF.md.
 */
function clearTeamHandoff(rootDir) {
  for (const filePath of [teamHandoffPath(rootDir), teamHandoffMdPath(rootDir)]) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // File doesn't exist, fine
    }
  }
}

/**
 * Derive team name from project root directory.
 */
function getTeamName(rootDir) {
  const base = path.basename(rootDir).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `${base}-team`;
}

/**
 * Detect CI/CD configuration in the project.
 */
function detectCICD(rootDir) {
  for (const marker of CICD_MARKERS) {
    if (fileExists(path.join(rootDir, marker))) {
      return true;
    }
  }
  return false;
}

/**
 * Detect UI frameworks from detection result.
 */
function detectUIFramework(detectionResult) {
  if (!detectionResult || !detectionResult.frameworks) return false;
  return detectionResult.frameworks.some(fw => UI_FRAMEWORK_NAMES.includes(fw));
}

/**
 * Estimate project size using multi-signal detection.
 *
 * Priority:
 *   1. Explicit override (from config or --size flag)
 *   2. Project artifacts (PROJECT.md, ROADMAP.md phase count)
 *   3. Source file count
 *   4. Default 'medium'
 *
 * @param {string} rootDir
 * @param {{ team?: { size?: string } }} config - Superteam config
 * @param {string|null} overrideSize - Explicit --size flag
 * @returns {{ size: string, signal: string }}
 */
function estimateProjectSize(rootDir, config, overrideSize) {
  // Priority 1: Explicit override
  if (overrideSize && ['small', 'medium', 'large'].includes(overrideSize)) {
    return { size: overrideSize, signal: 'user-override' };
  }

  // Priority 2: Config value
  const configSize = config && config.team && config.team.size;
  if (configSize && ['small', 'medium', 'large'].includes(configSize)) {
    return { size: configSize, signal: 'config' };
  }

  // Priority 3: Project artifacts
  const artifactSize = estimateFromArtifacts(rootDir);
  if (artifactSize) {
    return { size: artifactSize, signal: 'project-artifacts' };
  }

  // Priority 4: Source file count
  const fileCount = countSourceFiles(rootDir);
  if (fileCount > 0) {
    if (fileCount < SIZE_THRESHOLDS.small) {
      return { size: 'small', signal: 'file-count' };
    }
    if (fileCount >= SIZE_THRESHOLDS.large) {
      return { size: 'large', signal: 'file-count' };
    }
    return { size: 'medium', signal: 'file-count' };
  }

  // Priority 5: Default (greenfield or no signals)
  return { size: 'medium', signal: 'default' };
}

/**
 * Estimate size from project artifacts (PROJECT.md, ROADMAP.md).
 * Returns size string or null if insufficient data.
 */
function estimateFromArtifacts(rootDir) {
  const paths = [
    path.join(rootDir, '.superteam', 'PROJECT.md'),
    path.join(rootDir, '.superteam', 'ROADMAP.md'),
    path.join(rootDir, 'PROJECT.md'),
    path.join(rootDir, 'ROADMAP.md'),
  ];

  for (const filePath of paths) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Count phase/feature markers
      const phaseMatches = content.match(/^#+\s*(phase|feature|milestone)/gim);
      if (phaseMatches) {
        if (phaseMatches.length >= 5) return 'large';
        if (phaseMatches.length >= 3) return 'medium';
        return 'small';
      }
    } catch {
      // File not found, continue
    }
  }

  return null;
}

/**
 * Get recommended roles for a project.
 *
 * @param {string} projectType - From detector.cjs
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {{ cicd: boolean, uiFramework: boolean }} signals - Extend signals
 * @returns {{ core: string[], extended: string[], collapsed: Object|null }}
 */
function getRecommendedRoles(projectType, size, signals) {
  const preset = TEAM_PRESETS[projectType] || TEAM_PRESETS.unknown;
  let core = [...preset];
  const extended = [];
  let collapsed = null;

  // Size-based adaptation: small projects collapse Tech Lead + Senior Dev → Developer (opus)
  if (size === 'small') {
    const hasTL = core.includes('tech-lead');
    const hasSrDev = core.includes('senior-developer');
    if (hasTL && hasSrDev) {
      core = core.filter(r => r !== 'tech-lead' && r !== 'senior-developer');
      // Existing developer stays in core; assembleTeam upgrades its model to opus
      collapsed = { from: ['tech-lead', 'senior-developer'], to: 'developer', modelOverride: 'opus' };
    } else if (hasTL) {
      core = core.filter(r => r !== 'tech-lead');
      collapsed = { from: ['tech-lead'], to: 'developer' };
    }
  }

  // Extend signals
  if (signals) {
    if (signals.uiFramework && !core.includes('ux-designer')) {
      extended.push('ux-designer');
    }
    if (signals.cicd && !core.includes('devops-engineer')) {
      extended.push('devops-engineer');
    }
    if ((size === 'large' || projectType === 'monorepo') && !extended.includes('developer')) {
      extended.push('developer'); // second developer
    }
  }

  return { core, extended, collapsed };
}

/**
 * Assemble a complete team based on project detection and config.
 *
 * @param {string} rootDir
 * @param {{ type: string, frameworks: string[], workspaces: string[] }} detectionResult
 * @param {Object} config - Superteam config
 * @param {string|null} overrideSize - Explicit --size flag
 * @returns {{ team_name, project_type, size, signal, roles: { core, extended, collapsed }, members: Array }}
 */
function assembleTeam(rootDir, detectionResult, config, overrideSize) {
  const teamName = getTeamName(rootDir);
  const projectType = detectionResult ? detectionResult.type : 'unknown';

  const { size, signal } = estimateProjectSize(rootDir, config, overrideSize);

  const signals = {
    uiFramework: detectUIFramework(detectionResult),
    cicd: detectCICD(rootDir),
  };

  const roles = getRecommendedRoles(projectType, size, signals);

  // Build member list
  const members = [];
  let devCount = 0;
  const devModelOverride = roles.collapsed && roles.collapsed.modelOverride || null;

  for (const role of roles.core) {
    const def = ROLE_DEFINITIONS[role];
    if (!def) continue;

    if (role === 'developer') {
      devCount++;
      const isFirstDev = devCount === 1;
      members.push({
        role,
        name: isFirstDev ? 'dev' : `dev-${devCount}`,
        model: isFirstDev && devModelOverride ? devModelOverride : def.model,
        description: def.description,
      });
    } else {
      members.push({
        role,
        name: role,
        model: def.model,
        description: def.description,
      });
    }
  }

  for (const role of roles.extended) {
    const def = ROLE_DEFINITIONS[role];
    if (!def) continue;

    if (role === 'developer') {
      devCount++;
      members.push({
        role,
        name: `dev-${devCount}`,
        model: def.model,
        description: def.description,
      });
    } else {
      members.push({
        role,
        name: role,
        model: def.model,
        description: def.description,
      });
    }
  }

  return {
    team_name: teamName,
    project_type: projectType,
    size,
    signal,
    roles,
    members,
  };
}

/**
 * Build context string for team agents on session start.
 */
function buildTeamContext(rootDir) {
  const config = loadTeamConfig(rootDir);
  if (!config || config.status === 'disbanded') {
    return null;
  }

  if (!config.status) return null;

  const memberCount = config.members ? config.members.length : 0;
  const roles = config.members
    ? config.members.map(m => m.name).join(', ')
    : 'none';

  const statusLabel = config.status === 'active' ? '' : ` [${config.status}]`;
  return `Active team: ${config.team_name}${statusLabel} (${memberCount} members: ${roles})`;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  loadTeamConfig,
  saveTeamConfig,
  isTeamActive,
  isTeamPaused,
  isTeamPausing,
  setTeamStatus,
  saveTeamHandoff,
  loadTeamHandoff,
  clearTeamHandoff,
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
  EXTEND_SIGNALS,
  CICD_MARKERS,
  SIZE_THRESHOLDS,
};
