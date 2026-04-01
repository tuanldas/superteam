'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

/**
 * Create a temp directory prefixed with `superteam-test-`.
 * Caller is responsible for cleanup via rmTmpDir().
 */
function makeTmpDir(prefix = 'superteam-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/**
 * Recursively remove a temp directory.
 */
function rmTmpDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
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

module.exports = { makeTmpDir, rmTmpDir, writeJson, writeFile };
