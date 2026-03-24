'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadTemplate, renderTemplate, listTemplates } = require('../core/template.cjs');

describe('renderTemplate', () => {
  it('simple replacement — {{name}} replaced', () => {
    const result = renderTemplate('Hello {{name}}!', { name: 'World' });
    assert.equal(result, 'Hello World!');
  });

  it('dot-notation — {{project.name}} replaced', () => {
    const result = renderTemplate('Project: {{project.name}}', {
      project: { name: 'Superteam' },
    });
    assert.equal(result, 'Project: Superteam');
  });

  it('unmatched placeholder — left as-is', () => {
    const result = renderTemplate('Hi {{missing}}', { name: 'test' });
    assert.equal(result, 'Hi {{missing}}');
  });

  it('nested undefined — left as-is', () => {
    const result = renderTemplate('Val: {{a.b.c}}', { a: { x: 1 } });
    assert.equal(result, 'Val: {{a.b.c}}');
  });

  it('multiple occurrences of same key — all replaced', () => {
    const result = renderTemplate('{{x}} and {{x}} and {{x}}', { x: 'ok' });
    assert.equal(result, 'ok and ok and ok');
  });

  it('empty variables — all placeholders left as-is', () => {
    const result = renderTemplate('{{a}} {{b}}', {});
    assert.equal(result, '{{a}} {{b}}');
  });
});

describe('loadTemplate', () => {
  it('existing template — returns content string', () => {
    const content = loadTemplate('config.json');
    assert.equal(typeof content, 'string');
    assert.ok(content.includes('{{name}}'));
  });

  it('missing template — throws error', () => {
    assert.throws(
      () => loadTemplate('does-not-exist.txt'),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('Template not found'));
        return true;
      }
    );
  });
});

describe('listTemplates', () => {
  it('returns array of template filenames', () => {
    const templates = listTemplates();
    assert.ok(Array.isArray(templates));
    assert.ok(templates.length >= 7);
    assert.ok(templates.includes('config.json'));
    assert.ok(templates.includes('readme.md'));
    assert.ok(templates.includes('project.md'));
    assert.ok(templates.includes('requirements.md'));
    assert.ok(templates.includes('roadmap.md'));
    assert.ok(templates.includes('handoff.json'));
    assert.ok(templates.includes('api-docs.md'));
  });
});
