// ==========================================================================
// secret-lock Web Landing Page App Script (Interactive IDE Sandbox)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const terminalBody = document.getElementById('terminal-body');
  const terminalInput = document.getElementById('terminal-input');
  const fileEnv = document.getElementById('file-env');
  const fileEnvEnc = document.getElementById('file-env-enc');
  const previewFilename = document.getElementById('preview-filename');
  const previewCode = document.getElementById('preview-code');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const docNavLinks = document.querySelectorAll('.doc-nav-link');

  let isEncrypted = false;
  let isHookInstalled = false;
  let isTyping = false;

  const PLAINTEXT_ENV = `PORT=3000
API_KEY=sk_live_51Ny8BzH...
DATABASE_URL=postgresql://db_user:my_secret_pass@localhost:5432/main`;

  const ENCRYPTED_ENV_JSON = `{
  "version": "1.0.0",
  "salt": "m1T6yK3hPl7aO9q9d...",
  "iv": "vF4uLhK4uV8=",
  "authTag": "kPl9jU7yHg1=",
  "ciphertext": "h6R1bKlS9HjA3lP8sT4vR9=="
}`;

  // ----------------------------------------------------
  // IDE / Sidebar Handlers
  // ----------------------------------------------------
  fileEnv.addEventListener('click', () => {
    setActiveFile(fileEnv, '.env', PLAINTEXT_ENV);
  });

  fileEnvEnc.addEventListener('click', () => {
    setActiveFile(fileEnvEnc, '.env.enc', ENCRYPTED_ENV_JSON);
  });

  function setActiveFile(element, name, content) {
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    previewFilename.textContent = name;
    previewCode.textContent = content;
  }

  // ----------------------------------------------------
  // Terminal Custom Stream Output
  // ----------------------------------------------------
  function createLine(text, className = 'output') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    terminalBody.insertBefore(line, terminalInput.parentElement);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return line;
  }

  // ----------------------------------------------------
  // Interactive Simulator Commands
  // ----------------------------------------------------
  async function processCommand(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    createLine(`<span class="prompt">~/my-awesome-app $</span> ${cmd}`, 'input-line-echo');

    if (isTyping) return;

    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === 'clear') {
      const lines = terminalBody.querySelectorAll('.terminal-line:not(.input-line)');
      lines.forEach(line => line.remove());
      return;
    }

    if (lowerCmd === 'help') {
      createLine('Available Commands:', 'output');
      createLine('  <span class="cmd-text">git commit -m "init"</span>    Try to commit current project files', 'output');
      createLine('  <span class="cmd-text">secret-lock encrypt</span>        Encrypt your plaintext .env file', 'output');
      createLine('  <span class="cmd-text">secret-lock run [cmd]</span>      Decrypt secrets into memory & run app', 'output');
      createLine('  <span class="cmd-text">secret-lock hook install</span>   Install git pre-commit safety guard', 'output');
      createLine('  <span class="cmd-text">clear</span>                      Clear terminal screen', 'output');
      return;
    }

    if (lowerCmd.startsWith('git commit')) {
      if (!isEncrypted) {
        // blocked!
        createLine('==============================================================', 'warning');
        createLine('🚨  SECURITY WARNING: Plaintext secrets detected!  🚨', 'warning');
        createLine('==============================================================', 'warning');
        createLine('You are trying to commit plaintext environment file(s):', 'output');
        createLine('  -> .env', 'warning');
        createLine('', 'output');
        createLine('To protect your credentials, commit has been blocked.', 'output');
        createLine('Please follow these steps:', 'output');
        createLine('  1. Unstage the raw file(s): <span class="cmd-text">git restore --staged .env</span>', 'output');
        createLine('  2. Encrypt your secrets using secret-lock CLI: <span class="cmd-text">secret-lock encrypt</span>', 'output');
        createLine('  3. Add the plaintext file name to your .gitignore', 'output');
        createLine('==============================================================', 'warning');
        
        // Make the sidebar file highlight red briefly to guide attention
        fileEnv.classList.add('warning-pulse');
        setTimeout(() => fileEnv.classList.remove('warning-pulse'), 2000);
      } else {
        createLine('[main a34b8c9] Secure commit successful', 'success');
        createLine(' 2 files changed, 44 insertions(+)', 'output');
        createLine(' create mode 100644 .env.enc', 'success');
      }
      return;
    }

    if (lowerCmd === 'secret-lock encrypt' || lowerCmd === 'secret-lock lock') {
      isTyping = true;
      terminalInput.disabled = true;

      createLine('🔐 Choose a master password for encryption: ', 'output');
      await sleep(1000);
      createLine('********', 'output');

      createLine('🔑 Confirm master password: ', 'output');
      await sleep(800);
      createLine('********', 'output');

      createLine('<br>🔒 Encrypting secrets...', 'output');
      await sleep(1000);

      // Perform encryption UI changes
      isEncrypted = true;
      fileEnv.style.display = 'none';
      fileEnvEnc.style.display = 'flex';
      setActiveFile(fileEnvEnc, '.env.enc', ENCRYPTED_ENV_JSON);

      createLine('✔ Successfully encrypted!', 'success');
      createLine('Saved encrypted file to: <span class="cmd-text">/user/my-awesome-app/.env.enc</span>', 'success');
      createLine('💡 <span class="cmd-text">Important:</span> Keep this password safe. It is required to run your application!', 'output');

      terminalInput.disabled = false;
      isTyping = false;
      terminalInput.focus();
      return;
    }

    if (lowerCmd.startsWith('secret-lock run')) {
      if (!isEncrypted) {
        createLine('✖ Error: Encrypted secret file not found at /user/my-awesome-app/.env.enc', 'warning');
        createLine('Please encrypt your credentials first using: <span class="cmd-text">secret-lock encrypt</span>', 'output');
        return;
      }

      isTyping = true;
      terminalInput.disabled = true;

      createLine('🔐 Enter master password to inject secrets: ', 'output');
      await sleep(1000);
      createLine('********', 'output');

      createLine('✔ Secrets successfully injected into memory.', 'success');
      createLine('🚀 Launching command: <span class="cmd-text">node index.js</span><br>', 'success');
      await sleep(800);

      createLine('Server running on http://localhost:3000', 'output');
      createLine('[DB] Database connected successfully (SSL verified).', 'success');
      createLine('Ready for requests...', 'success');

      terminalInput.disabled = false;
      isTyping = false;
      terminalInput.focus();
      return;
    }

    if (lowerCmd === 'secret-lock hook install') {
      createLine('✔ Successfully installed Git-guard pre-commit hook!', 'success');
      createLine('Your secrets are now protected. Plaintext environment files are blocked from commits.', 'output');
      isHookInstalled = true;
      return;
    }

    // Default unknown command fallback
    createLine(`bash: ${cmd}: command not found. Type <span class="cmd-text">help</span> to view sandbox options.`, 'output');
  }

  // ----------------------------------------------------
  // Input Handling
  // ----------------------------------------------------
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      processCommand(val);
    }
  });

  // Keep terminal focused when clicking anywhere inside the terminal body
  terminalBody.addEventListener('click', () => {
    if (!isTyping) {
      terminalInput.focus();
    }
  });

  // ----------------------------------------------------
  // Preset Button Click Handlers (Simulators)
  // ----------------------------------------------------
  presetButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      if (isTyping) return;

      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const flow = btn.getAttribute('data-flow');
      await runPresetFlow(flow);
    });
  });

  async function runPresetFlow(flow) {
    isTyping = true;
    terminalInput.disabled = true;

    // Clear old screen
    const lines = terminalBody.querySelectorAll('.terminal-line:not(.input-line)');
    lines.forEach(line => line.remove());

    if (flow === 'git-leak') {
      // Restore files back to decrypted state to show leak protection
      isEncrypted = false;
      fileEnv.style.display = 'flex';
      fileEnvEnc.style.display = 'none';
      setActiveFile(fileEnv, '.env', PLAINTEXT_ENV);

      await typeCommand('git commit -m "add env file"');
      await sleep(500);
      await processCommand('git commit -m "add env file"');

    } else if (flow === 'encrypt') {
      // Ensure plaintext .env is currently showing
      isEncrypted = false;
      fileEnv.style.display = 'flex';
      fileEnvEnc.style.display = 'none';
      setActiveFile(fileEnv, '.env', PLAINTEXT_ENV);

      await typeCommand('secret-lock encrypt');
      await sleep(500);
      await processCommand('secret-lock encrypt');

    } else if (flow === 'run-injected') {
      // Ensure it is encrypted first for a smooth demo
      isEncrypted = true;
      fileEnv.style.display = 'none';
      fileEnvEnc.style.display = 'flex';
      setActiveFile(fileEnvEnc, '.env.enc', ENCRYPTED_ENV_JSON);

      await typeCommand('secret-lock run "node index.js"');
      await sleep(500);
      await processCommand('secret-lock run "node index.js"');
    }

    terminalInput.disabled = false;
    isTyping = false;
    terminalInput.focus();
  }

  // Helper function to animate typing commands
  function typeCommand(text) {
    return new Promise((resolve) => {
      let index = 0;
      terminalInput.value = '';
      
      const interval = setInterval(() => {
        if (index < text.length) {
          terminalInput.value += text[index];
          index++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 70);
    });
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ----------------------------------------------------
  // Documentation Navigation Highlighting
  // ----------------------------------------------------
  docNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      docNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
