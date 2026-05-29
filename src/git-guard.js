import fs from 'fs';
import path from 'path';

// ANSI terminal colors
const C_GREEN = '\x1b[32m';
const C_RED = '\x1b[31m';
const C_YELLOW = '\x1b[33m';
const C_CYAN = '\x1b[36m';
const C_BOLD = '\x1b[1m';
const C_RESET = '\x1b[0m';

/**
 * Searches upwards for the nearest .git directory recursively.
 * 
 * @param {string} startDir Starting directory for the search (defaults to current working directory)
 * @returns {string|null} Path to .git directory or null if not found
 */
export function findGitDir(startDir = process.cwd()) {
  let current = startDir;
  while (true) {
    const gitPath = path.join(current, '.git');
    if (fs.existsSync(gitPath) && fs.statSync(gitPath).isDirectory()) {
      return gitPath;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break; // Reached filesystem root
    }
    current = parent;
  }
  return null;
}

const HOOK_MARKER_START = '## SECRET-LOCK GIT-GUARD START ##';
const HOOK_MARKER_END = '## SECRET-LOCK GIT-GUARD END ##';

const HOOK_CONTENT = `
${HOOK_MARKER_START}
# Intercept raw secret committing
staged_envs=$(git diff --cached --name-only | grep -E '^(\\.env|\\.env\\..*)$' | grep -v '\\.enc$')

if [ ! -z "$staged_envs" ]; then
  echo "=============================================================="
  echo "🚨  SECURITY WARNING: Plaintext secrets detected!  🚨"
  echo "=============================================================="
  echo "You are trying to commit plaintext environment file(s):"
  echo ""
  for file in $staged_envs; do
    echo "  -> $file"
  done
  echo ""
  echo "To protect your credentials, commit has been blocked."
  echo "Please follow these steps:"
  echo "  1. Unstage the raw file(s):"
  echo "     git restore --staged <file>"
  echo "  2. Encrypt your credentials using secret-lock CLI:"
  echo "     secret-lock encrypt <file>"
  echo "  3. Add the plaintext file name to your .gitignore"
  echo "=============================================================="
  exit 1
fi
${HOOK_MARKER_END}
`;

/**
 * Installs Git Guard as a git pre-commit hook.
 * Idempotent, handles existing hooks gracefully.
 */
export function installHook() {
  const gitDir = findGitDir();
  if (!gitDir) {
    console.error(`${C_RED}✖ Error: No git repository detected in this directory or its parents.${C_RESET}`);
    console.error(`Please initialize git first using: ${C_BOLD}git init${C_RESET}`);
    process.exit(1);
  }

  const hooksDir = path.join(gitDir, 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const preCommitPath = path.join(hooksDir, 'pre-commit');
  let content = '';

  if (fs.existsSync(preCommitPath)) {
    content = fs.readFileSync(preCommitPath, 'utf8');
    if (content.includes(HOOK_MARKER_START)) {
      console.log(`${C_GREEN}✔ Git-guard pre-commit hook is already installed and active.${C_RESET}`);
      return;
    }
    // Append the hook code cleanly
    content += '\n' + HOOK_CONTENT;
  } else {
    // Create new hook script
    content = '#!/bin/sh\n' + HOOK_CONTENT;
  }

  try {
    fs.writeFileSync(preCommitPath, content, { mode: 0o755, encoding: 'utf8' });
    fs.chmodSync(preCommitPath, 0o755); // Explicitly ensure permissions
    console.log(`${C_GREEN}✔ Successfully installed Git-guard pre-commit hook!${C_RESET}`);
    console.log(`Your secrets are now protected. Plaintext environment files are blocked from commits.`);
  } catch (err) {
    console.error(`${C_RED}✖ Failed to install pre-commit hook: ${err.message}${C_RESET}`);
    process.exit(1);
  }
}

/**
 * Removes Git Guard from pre-commit hook non-destructively.
 */
export function uninstallHook() {
  const gitDir = findGitDir();
  if (!gitDir) {
    console.error(`${C_RED}✖ Error: No git repository detected.${C_RESET}`);
    process.exit(1);
  }

  const preCommitPath = path.join(gitDir, 'hooks', 'pre-commit');
  if (!fs.existsSync(preCommitPath)) {
    console.log(`${C_YELLOW}⚠ No pre-commit hook found to uninstall.${C_RESET}`);
    return;
  }

  try {
    const content = fs.readFileSync(preCommitPath, 'utf8');
    if (!content.includes(HOOK_MARKER_START)) {
      console.log(`${C_YELLOW}⚠ Git-guard is not currently installed.${C_RESET}`);
      return;
    }

    const startIndex = content.indexOf(HOOK_MARKER_START);
    const endIndex = content.indexOf(HOOK_MARKER_END);

    if (startIndex !== -1 && endIndex !== -1) {
      const before = content.substring(0, startIndex);
      const after = content.substring(endIndex + HOOK_MARKER_END.length);
      let newContent = (before.trim() + '\n' + after.trim()).trim();

      // If hook file only contained git-guard, remove it entirely
      if (!newContent || newContent === '#!/bin/sh') {
        fs.unlinkSync(preCommitPath);
        console.log(`${C_GREEN}✔ Removed empty pre-commit hook file.${C_RESET}`);
      } else {
        fs.writeFileSync(preCommitPath, newContent, 'utf8');
        console.log(`${C_GREEN}✔ Uninstalled Git-guard from pre-commit hook successfully.${C_RESET}`);
      }
    }
  } catch (err) {
    console.error(`${C_RED}✖ Failed to uninstall pre-commit hook: ${err.message}${C_RESET}`);
    process.exit(1);
  }
}
