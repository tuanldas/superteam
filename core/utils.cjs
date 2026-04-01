'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Deep clone a value. Handles primitives, arrays, and plain objects.
 */
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

/**
 * Read and parse a JSON file, returning null on any error.
 */
function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Check if a file exists and is readable at the given path.
 */
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure the `.superteam/` directory exists under `rootDir`.
 */
function ensureConfigDir(rootDir) {
  const dir = path.join(rootDir, '.superteam');
  fs.mkdirSync(dir, { recursive: true });
}

module.exports = { deepClone, readJsonSafe, fileExists, ensureConfigDir };
