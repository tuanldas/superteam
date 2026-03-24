'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONFIG_DEFAULTS = Object.freeze({
  name: '',
  type: 'unknown',
  workspaces: [],
  preferences: {
    defaultBranch: 'main',
    commitStyle: 'conventional',
  },
  granularity: 'standard',
  parallelization: true,
  commit_docs: true,
  model_profile: 'balanced',
  workflow: {
    research: true,
    plan_check: true,
    verifier: true,
  },
});

const CONFIG_SCHEMA = Object.freeze({
  name: { type: 'string' },
  type: {
    type: 'string',
    enum: [
      'frontend', 'backend', 'fullstack', 'monorepo',
      'php', 'go', 'python', 'rust', 'unknown',
    ],
  },
  workspaces: { type: 'array' },
  'preferences.defaultBranch': { type: 'string' },
  'preferences.commitStyle': { type: 'string', enum: ['conventional', 'simple'] },
  granularity: { type: 'string', enum: ['coarse', 'standard', 'fine'] },
  parallelization: { type: 'boolean' },
  commit_docs: { type: 'boolean' },
  model_profile: { type: 'string', enum: ['quality', 'balanced', 'budget', 'inherit'] },
  'workflow.research': { type: 'boolean' },
  'workflow.plan_check': { type: 'boolean' },
  'workflow.verifier': { type: 'boolean' },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Deep-merge `source` into `target`. Returns a new object.
 *  - Arrays are replaced, not concatenated.
 *  - null / undefined values in source do NOT overwrite target.
 */
function deepMerge(target, source) {
  if (source === null || source === undefined) return deepClone(target);
  if (target === null || target === undefined) return deepClone(source);

  if (typeof target !== 'object' || typeof source !== 'object') {
    return deepClone(source);
  }
  if (Array.isArray(target) || Array.isArray(source)) {
    return deepClone(source);
  }

  const result = {};
  const allKeys = new Set([...Object.keys(target), ...Object.keys(source)]);
  for (const key of allKeys) {
    const tVal = target[key];
    const sVal = source[key];
    if (sVal === null || sVal === undefined) {
      result[key] = deepClone(tVal);
    } else if (
      typeof tVal === 'object' && tVal !== null && !Array.isArray(tVal) &&
      typeof sVal === 'object' && sVal !== null && !Array.isArray(sVal)
    ) {
      result[key] = deepMerge(tVal, sVal);
    } else {
      result[key] = deepClone(sVal);
    }
  }
  return result;
}

function deepClone(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const k of Object.keys(value)) {
    out[k] = deepClone(value[k]);
  }
  return out;
}

function configPath(rootDir) {
  return path.join(rootDir, '.superteam', 'config.json');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Ensure the `.superteam/` directory exists under `rootDir`.
 */
function ensureConfigDir(rootDir) {
  const dir = path.join(rootDir, '.superteam');
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Load `.superteam/config.json` and deep-merge with defaults.
 * Returns defaults if the file is missing (no error thrown).
 */
function loadConfig(rootDir) {
  const filePath = configPath(rootDir);
  let fileData = {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    fileData = JSON.parse(raw);
  } catch {
    // File missing or unreadable — use defaults only.
  }
  return deepMerge(CONFIG_DEFAULTS, fileData);
}

/**
 * Validate then save config to `.superteam/config.json`.
 * Throws if validation fails.
 */
function saveConfig(rootDir, config) {
  const result = validateConfig(config);
  if (!result.valid) {
    const err = new Error('Invalid config: ' + result.errors.join('; '));
    err.errors = result.errors;
    throw err;
  }
  ensureConfigDir(rootDir);
  const filePath = configPath(rootDir);
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

/**
 * Read a value from `config` using a dot-notation path.
 * Returns `undefined` for missing paths.
 */
function getConfigValue(config, dotPath) {
  const parts = dotPath.split('.');
  let current = config;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Set a value at `dotPath` in `config`. Returns a new config (no mutation).
 * Creates intermediate objects as needed.
 */
function setConfigValue(config, dotPath, value) {
  const clone = deepClone(config);
  const parts = dotPath.split('.');
  let current = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return clone;
}

/**
 * Build a config by 3-level merge: CONFIG_DEFAULTS < detectionResult < userChoices.
 *
 * `detectionResult` has shape `{ type, frameworks, workspaces }`.
 * Only `type` and `workspaces` map directly to config keys.
 */
function buildDefaultConfig(detectionResult, userChoices) {
  const detection = {};
  if (detectionResult) {
    if (detectionResult.type !== undefined && detectionResult.type !== null) {
      detection.type = detectionResult.type;
    }
    if (detectionResult.workspaces !== undefined && detectionResult.workspaces !== null) {
      detection.workspaces = detectionResult.workspaces;
    }
  }
  const step1 = deepMerge(CONFIG_DEFAULTS, detection);
  return deepMerge(step1, userChoices || {});
}

/**
 * Validate `config` against CONFIG_SCHEMA.
 * Returns `{ valid: boolean, errors: string[] }`.
 * Unknown keys are allowed (extensible).
 */
function validateConfig(config) {
  const errors = [];

  for (const [schemaPath, rule] of Object.entries(CONFIG_SCHEMA)) {
    const value = getConfigValue(config, schemaPath);

    // Only validate if the value is present.
    if (value === undefined) continue;

    // Type check.
    if (rule.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`"${schemaPath}" must be an array, got ${typeof value}`);
        continue;
      }
    } else if (typeof value !== rule.type) {
      errors.push(`"${schemaPath}" must be ${rule.type}, got ${typeof value}`);
      continue;
    }

    // Enum check.
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(
        `"${schemaPath}" must be one of [${rule.enum.join(', ')}], got "${value}"`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  loadConfig,
  saveConfig,
  getConfigValue,
  setConfigValue,
  ensureConfigDir,
  buildDefaultConfig,
  validateConfig,
  CONFIG_DEFAULTS,
  CONFIG_SCHEMA,
};
