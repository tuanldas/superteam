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
 * Process {{#if key}}...{{/if}} conditionals.
 * Includes content when key resolves to a truthy value.
 * Supports {{#if key}}...{{else}}...{{/if}}.
 */
function processConditionals(content, variables) {
  return content.replace(
    /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, key, body) => {
      const trimmedKey = key.trim();
      const value = resolvePath(variables, trimmedKey);
      const isTruthy = Array.isArray(value) ? value.length > 0 : !!value;
      const parts = body.split('{{else}}');
      return isTruthy ? parts[0] : (parts[1] || '');
    },
  );
}

/**
 * Process {{#each key}}...{{/each}} loops.
 * Iterates over array values. Inside the block:
 *   {{.}} = current item (primitive)
 *   {{.prop}} = property of current item (object)
 *   {{@index}} = zero-based index
 */
function processLoops(content, variables) {
  return content.replace(
    /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_match, key, body) => {
      const trimmedKey = key.trim();
      const arr = resolvePath(variables, trimmedKey);
      if (!Array.isArray(arr)) return '';
      return arr
        .map((item, index) => {
          let rendered = body.replace(/\{\{@index\}\}/g, String(index));
          if (item !== null && typeof item === 'object') {
            rendered = rendered.replace(/\{\{\.([^}]+)\}\}/g, (_m, prop) => {
              const val = item[prop.trim()];
              return val === undefined || val === null ? '' : String(val);
            });
          }
          rendered = rendered.replace(/\{\{\.\}\}/g, String(item));
          return rendered;
        })
        .join('');
    },
  );
}

/**
 * Replace {{key}} placeholders in template content with values from a
 * variables object. Supports dot-notation (e.g. {{project.name}}).
 * Also supports {{#if key}}...{{/if}} conditionals and
 * {{#each key}}...{{/each}} loops.
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

  // Process block helpers first (conditionals, loops), then simple replacements.
  let result = processConditionals(templateContent, variables);
  result = processLoops(result, variables);

  return result.replace(/\{\{([^#/@][^}]*)\}\}/g, (_match, key) => {
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
