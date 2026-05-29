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
  async function processCommand(rawCmd, fromSimulation = false) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    createLine(`<span class="prompt">~/my-awesome-app $</span> ${cmd}`, 'input-line-echo');

    if (isTyping && !fromSimulation) return;

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
        if (window.triggerLockAnimation) window.triggerLockAnimation(false);
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
        if (window.triggerLockAnimation) window.triggerLockAnimation(true);
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

      if (window.triggerLockAnimation) window.triggerLockAnimation(true, true);
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

      if (window.triggerLockAnimation) window.triggerLockAnimation(true);
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
      await processCommand('git commit -m "add env file"', true);

    } else if (flow === 'encrypt') {
      // Ensure plaintext .env is currently showing
      isEncrypted = false;
      fileEnv.style.display = 'flex';
      fileEnvEnc.style.display = 'none';
      setActiveFile(fileEnv, '.env', PLAINTEXT_ENV);

      await typeCommand('secret-lock encrypt');
      await sleep(500);
      await processCommand('secret-lock encrypt', true);

    } else if (flow === 'run-injected') {
      // Ensure it is encrypted first for a smooth demo
      isEncrypted = true;
      fileEnv.style.display = 'none';
      fileEnvEnc.style.display = 'flex';
      setActiveFile(fileEnvEnc, '.env.enc', ENCRYPTED_ENV_JSON);

      await typeCommand('secret-lock run "node index.js"');
      await sleep(500);
      await processCommand('secret-lock run "node index.js"', true);
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
  // Documentation Navigation Highlighting (Tabbed Toggle)
  // ----------------------------------------------------
  docNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      docNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetId = link.getAttribute('href');
      
      // Hide all doc blocks
      document.querySelectorAll('.doc-block').forEach(block => {
        block.classList.remove('active');
      });

      // Show the targeted active doc block
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.classList.add('active');
      }
    });
  });

  // ----------------------------------------------------
  // 2026 Interactive 3D WebGL Padlock (Three.js Engine)
  // ----------------------------------------------------
  function init3DLock() {
    const container = document.getElementById('canvas-3d-container');
    if (!container) return;

    // 1. Create Scene, Camera and WebGL Renderer with Alpha transparent background
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lock Geometry Group (Contains body, keyhole and animated shackle)
    const lockGroup = new THREE.Group();
    lockGroup.position.y = -0.2;
    scene.add(lockGroup);

    // Metallic Violet Material for the Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Purple
      metalness: 0.85,
      roughness: 0.15
    });

    // Metallic Teal/Cyan Material for the Shackle
    const shackleMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6, // Cyan/Teal
      metalness: 0.9,
      roughness: 0.1
    });

    // Dark inset material for the keyhole
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x070b13 });

    // a. Create Padlock Body (Rounded Cylinder)
    const bodyGeom = new THREE.CylinderGeometry(1.4, 1.4, 1.8, 32);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = -0.5;
    lockGroup.add(body);

    // b. Create Keyhole on the front
    const keyholeGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16);
    const keyhole = new THREE.Mesh(keyholeGeom, darkMat);
    keyhole.rotation.x = Math.PI / 2;
    keyhole.position.z = 1.36; // Just slightly exceeding body cylinder
    keyhole.position.y = -0.5;
    lockGroup.add(keyhole);

    // c. Create Padlock Shackle Group (To allow sliding animation)
    const shackleGroup = new THREE.Group();
    
    // Half Torus
    const archGeom = new THREE.TorusGeometry(0.6, 0.14, 16, 64, Math.PI);
    const arch = new THREE.Mesh(archGeom, shackleMat);
    shackleGroup.add(arch);

    // Left Leg
    const legGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.8, 16);
    const leftLeg = new THREE.Mesh(legGeom, shackleMat);
    leftLeg.position.x = -0.6;
    leftLeg.position.y = -0.4;
    shackleGroup.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Mesh(legGeom, shackleMat);
    rightLeg.position.x = 0.6;
    rightLeg.position.y = -0.4;
    shackleGroup.add(rightLeg);

    lockGroup.add(shackleGroup);

    // Initial Position (Unlocked)
    let shackleTargetY = 0.9;
    shackleGroup.position.y = shackleTargetY;

    // 3. Adding Professional SaaS Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Spotlight purple reflecting off metallic body
    const purpleLight = new THREE.SpotLight(0x8b5cf6, 6, 15, Math.PI / 4, 0.5, 1);
    purpleLight.position.set(4, 5, 4);
    scene.add(purpleLight);

    // PointLight cyan reflecting off metallic shackle
    const cyanLight = new THREE.PointLight(0x2dd4bf, 8, 12);
    cyanLight.position.set(-4, 3, 3);
    scene.add(cyanLight);

    // Top general direction light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 8, 2);
    scene.add(dirLight);

    // 4. Mouse Interactive Parallax
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    // 5. Expose trigger locking globally so terminal simulator can invoke it!
    window.triggerLockAnimation = function(isLocked, spin = false) {
      shackleTargetY = isLocked ? 0.35 : 0.9;
      if (spin) {
        lockGroup.rotation.y += Math.PI * 2; // Smooth 360 degree spin!
      }
    };

    // 6. Render Loop
    function animate() {
      requestAnimationFrame(animate);

      // Smoothly interpolate shackle slide (locking action)
      shackleGroup.position.y += (shackleTargetY - shackleGroup.position.y) * 0.15;

      // Smoothly interpolate lock rotation looking at mouse cursor
      targetX = mouseX * 0.8;
      targetY = mouseY * 0.5;

      lockGroup.rotation.y += (targetX - lockGroup.rotation.y) * 0.08;
      lockGroup.rotation.x += (targetY - lockGroup.rotation.x) * 0.08;

      // Continuous subtle idle float animation
      lockGroup.position.y = -0.2 + Math.sin(Date.now() * 0.0015) * 0.12;

      renderer.render(scene, camera);
    }

    animate();

    // 7. Handle window resize gracefully
    window.addEventListener('resize', () => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // Launch 3D initialization
  init3DLock();
});
