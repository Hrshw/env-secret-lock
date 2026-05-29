import readline from 'readline';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { decrypt } from './crypto.js';
import { parse } from './parser.js';

// ANSI terminal colors
const C_GREEN = '\x1b[32m';
const C_RED = '\x1b[31m';
const C_YELLOW = '\x1b[33m';
const C_CYAN = '\x1b[36m';
const C_BOLD = '\x1b[1m';
const C_RESET = '\x1b[0m';

/**
 * Securely prompts the user for a password by masking terminal input with asterisks.
 * Handles Backspace, Enter/Return, and Ctrl+C cleanups.
 * 
 * @param {string} query The prompt text to display
 * @returns {Promise<string>} The entered password
 */
export function getSecurePassword(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const stdin = process.stdin;
    let password = '';

    process.stdout.write(query);

    const onKeypress = (char, key) => {
      // Handle Ctrl+C (SIGINT)
      if (key && key.ctrl && key.name === 'c') {
        cleanup();
        process.stdout.write('\n');
        process.exit(130); // 130 is the standard exit code for SIGINT
      }

      // Handle Enter / Return key
      if (key && (key.name === 'enter' || key.name === 'return')) {
        process.stdout.write('\n');
        cleanup();
        resolve(password);
      } 
      // Handle Backspace
      else if (key && key.name === 'backspace') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          // Move cursor back 1 space, replace character with space, move cursor back again
          readline.moveCursor(process.stdout, -1, 0);
          process.stdout.write(' ');
          readline.moveCursor(process.stdout, -1, 0);
        }
      } 
      // Handle standard character input
      else if (char && char !== '\r' && char !== '\n') {
        password += char;
        process.stdout.write('*'); // Mask input with asterisk
      }
    };

    readline.emitKeypressEvents(stdin);
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.on('keypress', onKeypress);

    function cleanup() {
      if (stdin.isTTY) {
        stdin.setRawMode(false);
      }
      stdin.removeListener('keypress', onKeypress);
      rl.close();
    }
  });
}

/**
 * Resolves the password from the env variable SECRET_LOCK_PASSWORD or falls back to a terminal prompt.
 * 
 * @param {string} promptMessage 
 * @returns {Promise<string>}
 */
export async function getPasswordOrPrompt(promptMessage) {
  if (process.env.SECRET_LOCK_PASSWORD) {
    return process.env.SECRET_LOCK_PASSWORD;
  }
  return getSecurePassword(promptMessage);
}

/**
 * Decrypts an encrypted env file, parses it, and launches the specified command
 * with the decrypted secrets injected directly into its memory (process.env).
 * 
 * @param {string} command The command to execute (e.g. "node index.js")
 * @param {string} encFilePath Absolute or relative path to the encrypted file
 */
export async function injectAndRun(command, encFilePath = '.env.enc') {
  const resolvedPath = path.resolve(encFilePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`${C_RED}Error: Encrypted secret file not found at ${resolvedPath}${C_RESET}`);
    console.error(`Please create one first using: ${C_BOLD}secret-lock encrypt${C_RESET}`);
    process.exit(1);
  }

  try {
    const password = await getPasswordOrPrompt(`${C_CYAN}🔐 Enter master password to inject secrets: ${C_RESET}`);
    
    // Read and decrypt in memory
    const encryptedData = fs.readFileSync(resolvedPath, 'utf8');
    const decryptedText = decrypt(encryptedData, password);

    // Parse the decrypted env
    const secrets = parse(decryptedText);

    // Merge secrets into a clone of process.env
    const injectedEnv = { ...process.env, ...secrets };

    console.log(`${C_GREEN}✔ Secrets successfully injected into memory.${C_RESET}`);
    console.log(`${C_CYAN}🚀 Launching command: ${C_BOLD}${command}${C_RESET}\n`);

    // Spawn child process with the injected environment
    const child = spawn(command, [], {
      stdio: 'inherit',
      shell: true,
      env: injectedEnv
    });

    // Forward termination signals to the child
    const forwardSignal = (signal) => {
      child.kill(signal);
    };

    process.on('SIGINT', () => forwardSignal('SIGINT'));
    process.on('SIGTERM', () => forwardSignal('SIGTERM'));

    child.on('close', (code) => {
      // Exit with the child process exit code
      process.exit(code || 0);
    });

  } catch (err) {
    console.error(`${C_RED}✖ Error running process: ${err.message}${C_RESET}`);
    process.exit(1);
  }
}
