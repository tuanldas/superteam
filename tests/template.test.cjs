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

describe('renderTemplate — conditionals', () => {
  it('{{#if}} includes block when value is truthy', () => {
    const result = renderTemplate('{{#if show}}visible{{/if}}', { show: true });
    assert.equal(result, 'visible');
  });

  it('{{#if}} excludes block when value is falsy', () => {
    const result = renderTemplate('{{#if show}}visible{{/if}}', { show: false });
    assert.equal(result, '');
  });

  it('{{#if}} excludes block when key is missing', () => {
    const result = renderTemplate('{{#if missing}}visible{{/if}}', {});
    assert.equal(result, '');
  });

  it('{{#if}} treats empty array as falsy', () => {
    const result = renderTemplate('{{#if items}}has items{{/if}}', { items: [] });
    assert.equal(result, '');
  });

  it('{{#if}} treats non-empty array as truthy', () => {
    const result = renderTemplate('{{#if items}}has items{{/if}}', { items: [1] });
    assert.equal(result, 'has items');
  });

  it('{{#if}}...{{else}}...{{/if}} renders else branch when falsy', () => {
    const result = renderTemplate('{{#if ok}}yes{{else}}no{{/if}}', { ok: false });
    assert.equal(result, 'no');
  });

  it('{{#if}}...{{else}}...{{/if}} renders if branch when truthy', () => {
    const result = renderTemplate('{{#if ok}}yes{{else}}no{{/if}}', { ok: true });
    assert.equal(result, 'yes');
  });

  it('conditionals work with surrounding text', () => {
    const result = renderTemplate('Start {{#if x}}mid{{/if}} end', { x: true });
    assert.equal(result, 'Start mid end');
  });
});

describe('renderTemplate — loops', () => {
  it('{{#each}} iterates over array of primitives with {{.}}', () => {
    const result = renderTemplate('{{#each items}}[{{.}}]{{/each}}', { items: ['a', 'b', 'c'] });
    assert.equal(result, '[a][b][c]');
  });

  it('{{#each}} renders empty string for empty array', () => {
    const result = renderTemplate('{{#each items}}[{{.}}]{{/each}}', { items: [] });
    assert.equal(result, '');
  });

  it('{{#each}} renders empty string for non-array', () => {
    const result = renderTemplate('{{#each items}}[{{.}}]{{/each}}', { items: 'not-array' });
    assert.equal(result, '');
  });

  it('{{#each}} supports {{@index}}', () => {
    const result = renderTemplate('{{#each items}}{{@index}}:{{.}} {{/each}}', { items: ['x', 'y'] });
    assert.equal(result, '0:x 1:y ');
  });

  it('{{#each}} supports object items with {{.prop}}', () => {
    const tpl = '{{#each users}}{{.name}}({{.role}}) {{/each}}';
    const result = renderTemplate(tpl, {
      users: [{ name: 'Alice', role: 'dev' }, { name: 'Bob', role: 'qa' }],
    });
    assert.equal(result, 'Alice(dev) Bob(qa) ');
  });

  it('loops work with surrounding text and replacements', () => {
    const tpl = 'Team: {{name}} — {{#each members}}{{.}} {{/each}}done';
    const result = renderTemplate(tpl, { name: 'Alpha', members: ['A', 'B'] });
    assert.equal(result, 'Team: Alpha — A B done');
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
