'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PLUGIN_ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(PLUGIN_ROOT, 'templates');

/**
 * Resolve a dot-notation path against an object.
 * Returns undefined if any intermediate segment is missing or not an object.
 */
function resolvePath(obj, dotPath) {
  const segments = dotPath.split('.');
  let current = obj;
  for (const seg of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[seg];
  }
  return current;
}

/**
 * Load a template file by name from the templates/ directory.
 * @param {string} templateName - Filename inside templates/
 * @returns {string} File content as a UTF-8 string
 * @throws {Error} If the template file does not exist
 */
function loadTemplate(templateName) {
  const filePath = path.join(TEMPLATES_DIR, templateName);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Template not found: "${templateName}" (looked in ${TEMPLATES_DIR})`
    );
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Replace {{key}} placeholders in template content with values from a
 * variables object. Supports dot-notation (e.g. {{project.name}}).
 * Unmatched placeholders are left as-is.
 *
 * @param {string} templateContent - Raw template string
 * @param {Record<string, unknown>} variables - Key/value map for substitution
 * @returns {string} Rendered string
 */
function renderTemplate(templateContent, variables) {
  if (!variables || typeof variables !== 'object') {
    return templateContent;
  }

  return templateContent.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
    const trimmedKey = key.trim();
    const value = resolvePath(variables, trimmedKey);
    if (value === undefined || value === null) {
      return _match; // leave placeholder as-is
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  });
}

/**
 * List all template filenames in the templates/ directory.
 * @returns {string[]} Array of filenames (not full paths)
 */
function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter((entry) => {
      const full = path.join(TEMPLATES_DIR, entry);
      return fs.statSync(full).isFile();
    })
    .sort();
}

module.exports = { loadTemplate, renderTemplate, listTemplates };
