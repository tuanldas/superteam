'use strict';

const path = require('node:path');
const { detectProject } = require(path.resolve(__dirname, '..', 'core', 'detector.cjs'));
const { loadConfig } = require(path.resolve(__dirname, '..', 'core', 'config.cjs'));

function buildContext(cwd) {
  const detection = detectProject(cwd);
  const config = loadConfig(cwd);

  const projectName = config.name || path.basename(cwd);
  const projectType = detection.type;
  const frameworks = detection.frameworks.length > 0
    ? detection.frameworks.join(', ')
    : 'none detected';
  const workspaces = detection.workspaces.length > 0
    ? detection.workspaces.join(', ')
    : null;

  const lines = [];
  lines.push(`# Superteam Project Context`);
  lines.push(``);
  lines.push(`- **Project:** ${projectName}`);
  lines.push(`- **Type:** ${projectType}`);
  lines.push(`- **Frameworks:** ${frameworks}`);
  if (workspaces) {
    lines.push(`- **Workspaces:** ${workspaces}`);
  }
  lines.push(``);

  // Check if project is initialized
  const fs = require('node:fs');
  const configPath = path.join(cwd, '.superteam', 'config.json');
  const isInitialized = fs.existsSync(configPath);

  if (!isInitialized) {
    lines.push(`> Project not initialized. Run \`/st:init\` to set up Superteam for this project.`);
    lines.push(``);
  }

  lines.push(`## Available Commands`);
  lines.push(``);
  lines.push(`- \`/st:init\` — Initialize project`);
  lines.push(`- \`/st:plan\` — Create implementation plan`);
  lines.push(`- \`/st:execute\` — Execute plan`);
  lines.push(`- \`/st:debug\` — Debug with scientific method`);
  lines.push(`- \`/st:brainstorm\` — Brainstorm ideas`);
  lines.push(`- \`/st:code-review\` — Code review`);
  lines.push(`- \`/st:tdd\` — Test-driven development`);

  return lines.join('\n');
}

function main() {
  try {
    const cwd = process.cwd();
    const context = buildContext(cwd);

    const output = {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: context,
      },
    };

    process.stdout.write(JSON.stringify(output));
  } catch (_err) {
    // NEVER crash — always output valid JSON
    const fallback = {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: '# Superteam\n\nPlugin loaded. Run `/st:init` to get started.',
      },
    };
    process.stdout.write(JSON.stringify(fallback));
  }
}

// Allow testing by exporting buildContext, but also run as script
module.exports = { buildContext };

if (require.main === module) {
  main();
}
