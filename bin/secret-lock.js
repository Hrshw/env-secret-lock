#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { encrypt, decrypt } from '../src/crypto.js';
import { getSecurePassword, getPasswordOrPrompt, injectAndRun } from '../src/runner.js';
import { installHook, uninstallHook } from '../src/git-guard.js';

// ANSI terminal colors
const C_GREEN = '\x1b[32m';
const C_RED = '\x1b[31m';
const C_YELLOW = '\x1b[33m';
const C_CYAN = '\x1b[36m';
const C_BOLD = '\x1b[1m';
const C_RESET = '\x1b[0m';

const program = new Command();

program
  .name('secret-lock')
  .description('Fast, local-first developer environment secret manager')
  .version('1.0.0');

// Lock / Encrypt Command
program
  .command('encrypt [file]')
  .alias('lock')
  .description('Encrypt a plaintext .env file (defaults to .env)')
  .option('-o, --output <outputFile>', 'Custom output path for the encrypted file (defaults to [file].enc)')
  .action(async (file, options) => {
    const targetFile = file || '.env';
    const resolvedPath = path.resolve(targetFile);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`${C_RED}✖ Error: Target plaintext file not found at ${resolvedPath}${C_RESET}`);
      process.exit(1);
    }

    const outputFile = options.output || `${targetFile}.enc`;
    const resolvedOutputPath = path.resolve(outputFile);

    try {
      let password;
      if (process.env.SECRET_LOCK_PASSWORD) {
        password = process.env.SECRET_LOCK_PASSWORD;
      } else {
        password = await getSecurePassword(`${C_CYAN}🔐 Choose a master password for encryption: ${C_RESET}`);
        if (!password) {
          console.error(`${C_RED}✖ Error: Password cannot be empty.${C_RESET}`);
          process.exit(1);
        }
        const confirm = await getSecurePassword(`${C_CYAN}🔑 Confirm master password: ${C_RESET}`);
        if (password !== confirm) {
          console.error(`${C_RED}✖ Error: Passwords do not match.${C_RESET}`);
          process.exit(1);
        }
      }

      console.log(`\n${C_CYAN}🔒 Encrypting secrets...${C_RESET}`);
      const plaintext = fs.readFileSync(resolvedPath, 'utf8');
      const encryptedJson = encrypt(plaintext, password);
      
      fs.writeFileSync(resolvedOutputPath, encryptedJson, 'utf8');

      console.log(`${C_GREEN}✔ Successfully encrypted!${C_RESET}`);
      console.log(`Saved encrypted file to: ${C_BOLD}${resolvedOutputPath}${C_RESET}`);
      console.log(`${C_YELLOW}💡 Important: Keep this password safe. It is required to run your application or decrypt these secrets!${C_RESET}`);
    } catch (err) {
      console.error(`${C_RED}✖ Encryption failed: ${err.message}${C_RESET}`);
      process.exit(1);
    }
  });

// Unlock / Decrypt Command
program
  .command('decrypt [file]')
  .alias('unlock')
  .description('Decrypt an encrypted secrets file back into plaintext')
  .option('-o, --output <outputFile>', 'Custom output path for the decrypted plaintext file')
  .action(async (file, options) => {
    const targetFile = file || '.env.enc';
    const resolvedPath = path.resolve(targetFile);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`${C_RED}✖ Error: Target encrypted file not found at ${resolvedPath}${C_RESET}`);
      process.exit(1);
    }

    // Work out where to output plaintext
    let outputFile = options.output;
    if (!outputFile) {
      if (targetFile.endsWith('.enc')) {
        outputFile = targetFile.slice(0, -4); // remove ".enc"
      } else {
        outputFile = `${targetFile}.dec`;
      }
    }
    const resolvedOutputPath = path.resolve(outputFile);

    try {
      const password = await getPasswordOrPrompt(`${C_CYAN}🔐 Enter master password to decrypt: ${C_RESET}`);
      
      console.log(`\n${C_CYAN}🔓 Decrypting secrets...${C_RESET}`);
      const encryptedData = fs.readFileSync(resolvedPath, 'utf8');
      const decryptedText = decrypt(encryptedData, password);

      fs.writeFileSync(resolvedOutputPath, decryptedText, 'utf8');

      console.log(`${C_GREEN}✔ Successfully decrypted!${C_RESET}`);
      console.log(`Saved plaintext file to: ${C_BOLD}${resolvedOutputPath}${C_RESET}`);
    } catch (err) {
      console.error(`${C_RED}✖ Decryption failed: ${err.message}${C_RESET}`);
      process.exit(1);
    }
  });

// Runtime Execution Command
program
  .command('run <command>')
  .alias('r')
  .description('Inject decrypted secrets in-memory and execute a command')
  .option('-f, --file <encFile>', 'Path to the encrypted secret file (defaults to .env.enc)', '.env.enc')
  .action(async (command, options) => {
    await injectAndRun(command, options.file);
  });

// Git Hook Interceptor Setup Command
program
  .command('hook <action>')
  .alias('g')
  .description('Manage git-guard pre-commit hook (actions: install, uninstall)')
  .action((action) => {
    const normalizedAction = action.toLowerCase();
    if (normalizedAction === 'install') {
      installHook();
    } else if (normalizedAction === 'uninstall') {
      uninstallHook();
    } else {
      console.error(`${C_RED}✖ Error: Invalid hook action '${action}'. Use 'install' or 'uninstall'.${C_RESET}`);
      process.exit(1);
    }
  });

// Handle default/empty executions
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
