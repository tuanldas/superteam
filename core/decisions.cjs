'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { deepClone, ensureConfigDir } = require('./utils.cjs');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_SOURCES = Object.freeze([
  'init',
  'user_confirmed',
  'user_selected',
  'user_described',
  'user_modified',
  'derived',
]);

const DECISIONS_DEFAULTS = Object.freeze({
  version: 1,
  decisions: [],
});

const DECISIONS_SCHEMA = Object.freeze({
  version: { type: 'number', required: true },
  decisions: { type: 'array', required: true },
  'decisions[].key': { type: 'string', required: true },
  'decisions[].value': { type: 'any', required: true },
  'decisions[].decided_at': { type: 'string', required: true },
  'decisions[].source': { type: 'string', enum: VALID_SOURCES },
  'decisions[].rationale': { type: 'string', required: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decisionsPath(rootDir) {
  return path.join(rootDir, '.superteam', 'decisions.json');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load `.superteam/decisions.json` and return with defaults.
 * Returns defaults if the file is missing (no error thrown).
 */
function loadDecisions(rootDir) {
  const filePath = decisionsPath(rootDir);
  let fileData = deepClone(DECISIONS_DEFAULTS);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    // Merge with defaults to ensure all required fields are present.
    if (parsed && typeof parsed === 'object') {
      fileData = {
        version: parsed.version !== undefined ? parsed.version : DECISIONS_DEFAULTS.version,
        decisions: Array.isArray(parsed.decisions) ? deepClone(parsed.decisions) : [],
      };
    }
  } catch {
    // File missing or unreadable — use defaults only.
  }
  return fileData;
}

/**
 * Validate then save decisions to `.superteam/decisions.json`.
 * Throws if validation fails.
 */
function saveDecisions(rootDir, data) {
  const result = validateDecisions(data);
  if (!result.valid) {
    const err = new Error('Invalid decisions: ' + result.errors.join('; '));
    err.errors = result.errors;
    throw err;
  }
  ensureConfigDir(rootDir);
  const filePath = decisionsPath(rootDir);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Add or update a decision in the decisions array.
 * If a decision with the same key already exists, it is updated.
 * Otherwise, a new decision is appended.
 * Auto-generates `decided_at` timestamp if not provided.
 * Returns the updated data (does not mutate the input).
 */
function addDecision(rootDir, { key, value, rationale, source }) {
  if (!key || typeof key !== 'string') {
    throw new Error('Decision key must be a non-empty string');
  }
  if (source && !VALID_SOURCES.includes(source)) {
    throw new Error(`Invalid source "${source}". Must be one of: ${VALID_SOURCES.join(', ')}`);
  }

  const data = loadDecisions(rootDir);
  const now = new Date().toISOString();
  const newDecision = {
    key,
    value,
    decided_at: now,
    ...(rationale && { rationale }),
    ...(source && { source }),
  };

  // Check if decision with this key already exists.
  const existingIndex = data.decisions.findIndex((d) => d.key === key);
  if (existingIndex >= 0) {
    // Update existing decision, preserving decided_at if not explicitly changed.
    data.decisions[existingIndex] = {
      ...data.decisions[existingIndex],
      ...newDecision,
      decided_at: data.decisions[existingIndex].decided_at,
    };
  } else {
    // Append new decision.
    data.decisions.push(newDecision);
  }

  saveDecisions(rootDir, data);
  return data;
}

/**
 * Get a single decision by key.
 * Returns null if not found.
 */
function getDecision(rootDir, key) {
  const data = loadDecisions(rootDir);
  const decision = data.decisions.find((d) => d.key === key);
  return decision || null;
}

/**
 * Remove a decision by key.
 * Returns the updated data. Throws if key not found.
 */
function removeDecision(rootDir, key) {
  const data = loadDecisions(rootDir);
  const originalLength = data.decisions.length;
  data.decisions = data.decisions.filter((d) => d.key !== key);

  if (data.decisions.length === originalLength) {
    throw new Error(`Decision with key "${key}" not found`);
  }

  saveDecisions(rootDir, data);
  return data;
}

/**
 * Validate `decisions` data structure.
 * Returns `{ valid: boolean, errors: string[] }`.
 */
function validateDecisions(data) {
  const errors = [];

  // Check version.
  if (typeof data.version !== 'number') {
    errors.push('version must be a number');
  }

  // Check decisions is array.
  if (!Array.isArray(data.decisions)) {
    errors.push('decisions must be an array');
    return { valid: errors.length === 0, errors };
  }

  // Validate each decision.
  for (let i = 0; i < data.decisions.length; i++) {
    const decision = data.decisions[i];

    if (!decision || typeof decision !== 'object') {
      errors.push(`decisions[${i}] must be an object`);
      continue;
    }

    // Required: key.
    if (typeof decision.key !== 'string') {
      errors.push(`decisions[${i}].key must be a string`);
    }

    // Required: decided_at.
    if (typeof decision.decided_at !== 'string') {
      errors.push(`decisions[${i}].decided_at must be a string (ISO 8601 timestamp)`);
    } else {
      // Basic ISO 8601 validation.
      const parsed = new Date(decision.decided_at);
      if (isNaN(parsed.getTime())) {
        errors.push(`decisions[${i}].decided_at is not a valid ISO 8601 timestamp`);
      }
    }

    // Optional: source (but if present, must be valid).
    if (decision.source !== undefined && !VALID_SOURCES.includes(decision.source)) {
      errors.push(
        `decisions[${i}].source must be one of [${VALID_SOURCES.join(', ')}], got "${decision.source}"`,
      );
    }

    // Optional: rationale (no validation beyond type check).
    if (decision.rationale !== undefined && typeof decision.rationale !== 'string') {
      errors.push(`decisions[${i}].rationale must be a string if provided`);
    }

    // value is required but can be any type.
    if (decision.value === undefined) {
      errors.push(`decisions[${i}].value is required`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  loadDecisions,
  saveDecisions,
  addDecision,
  getDecision,
  removeDecision,
  validateDecisions,
  ensureConfigDir,
  DECISIONS_DEFAULTS,
  VALID_SOURCES,
};
