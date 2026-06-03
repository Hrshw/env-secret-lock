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
  const themeToggle = document.getElementById('theme-toggle');

  // Load and apply theme from localStorage
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      updateThemeIcon(isLight);
      
      // Notify Three.js lock renderer to shift lighting
      if (window.update3DThemeLights) {
        window.update3DThemeLights(isLight);
      }
    });
  }

  function updateThemeIcon(isLight) {
    if (!themeToggle) return;
    if (isLight) {
      themeToggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    } else {
      themeToggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    }
  }

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
  // Sci-Fi Matrix Text Scramble Transition
  // ----------------------------------------------------
  function scrambleCodePreview(targetText, callback, duration = 800) {
    const previewElement = document.getElementById('preview-code');
    if (!previewElement) return;

    previewElement.classList.add('scrambling-glow');
    
    const chars = '01XYZ#%$&@{}[]+*=-!?_';
    const targetLines = targetText.split('\n');
    let startTime = Date.now();
    
    if (window.scrambleInterval) {
      clearInterval(window.scrambleInterval);
    }
    
    window.scrambleInterval = setInterval(() => {
      let elapsed = Date.now() - startTime;
      let progress = elapsed / duration;
      
      if (progress >= 1) {
        clearInterval(window.scrambleInterval);
        previewElement.textContent = targetText;
        previewElement.classList.remove('scrambling-glow');
        if (callback) callback();
        return;
      }
      
      let currentText = targetLines.map((line, lineIndex) => {
        return line.split('').map((char, charIndex) => {
          if (progress > (lineIndex / targetLines.length) * 0.7 + (charIndex / line.length) * 0.3) {
            return char;
          }
          if (char === ' ' || char === '\n' || char === '=') return char;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
      }).join('\n');
      
      previewElement.textContent = currentText;
    }, 40);
  }

  // ----------------------------------------------------
  // IDE / Sidebar Handlers
  // ----------------------------------------------------
  fileEnv.addEventListener('click', () => {
    setActiveFile(fileEnv, '.env', PLAINTEXT_ENV);
  });

  fileEnvEnc.addEventListener('click', () => {
    setActiveFile(fileEnvEnc, '.env.enc', ENCRYPTED_ENV_JSON);
  });

  function setActiveFile(element, name, content, scramble = true) {
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    previewFilename.textContent = name;
    if (scramble) {
      scrambleCodePreview(content, null, 600);
    } else {
      previewCode.textContent = content;
    }
  }

  // ----------------------------------------------------
  // Terminal Custom Stream Output
  // ----------------------------------------------------
  function scrollToBottom() {
    terminalBody.scrollTop = terminalBody.scrollHeight;
    // Delayed fallback for browser layout rendering cycles
    setTimeout(() => {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 10);
  }

  function createLine(text, className = 'output') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    terminalBody.insertBefore(line, terminalInput.parentElement);
    scrollToBottom();
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

  // Auto-scroll when typing or focusing
  terminalInput.addEventListener('input', scrollToBottom);
  terminalInput.addEventListener('focus', scrollToBottom);

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
          scrollToBottom();
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

    // 2. Lock Geometry Group (Contains body, keyhole, shackle and key)
    const lockGroup = new THREE.Group();
    lockGroup.position.y = -0.2;
    scene.add(lockGroup);

    // Metallic Violet Material for the Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Purple
      metalness: 0.85,
      roughness: 0.15
    });

    // Metallic Teal/Cyan Material for the Shackle and Key
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
    keyhole.position.z = 1.36; // Just exceeding body cylinder
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

    // d. Create 3D Key Model Group
    const keyGroup = new THREE.Group();

    // Key Bow/Handle (Torus)
    const bowGeom = new THREE.TorusGeometry(0.24, 0.06, 8, 20);
    const bow = new THREE.Mesh(bowGeom, shackleMat);
    bow.position.z = 0;
    keyGroup.add(bow);

    // Key Shaft (Cylinder along Z)
    const shaftGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 16);
    const shaft = new THREE.Mesh(shaftGeom, shackleMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.4;
    keyGroup.add(shaft);

    // Key Bit/Teeth
    const bitGeom = new THREE.BoxGeometry(0.06, 0.18, 0.12);
    const bit = new THREE.Mesh(bitGeom, shackleMat);
    bit.position.set(0, -0.12, 0.65);
    keyGroup.add(bit);

    const bit2 = new THREE.Mesh(bitGeom, shackleMat);
    bit2.position.set(0, -0.12, 0.52);
    keyGroup.add(bit2);

    lockGroup.add(keyGroup);

    // Initial Position (Unlocked)
    let shackleTargetY = 0.9;
    shackleGroup.position.y = shackleTargetY;

    // Key State machine variables
    let keyState = 'orbit'; // 'orbit', 'inserting', 'turning', 'retracting'
    let keyAnimationTime = 0;
    let isLockingAction = true;

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

    // Dynamic light mode theme switcher for Three.js padlock
    window.update3DThemeLights = function(isLight) {
      if (isLight) {
        ambientLight.intensity = 0.95;
        dirLight.intensity = 1.1;
        cyanLight.intensity = 4.5;
        purpleLight.intensity = 3.5;
      } else {
        ambientLight.intensity = 0.5;
        dirLight.intensity = 0.8;
        cyanLight.intensity = 8;
        purpleLight.intensity = 6;
      }
    };

    // Initialize lighting for active theme state
    window.update3DThemeLights(document.body.classList.contains('light-theme'));

    // 4. Mouse Interactive Parallax & Scroll Triggers
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let scrollPercent = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    });

    // 5. Expose trigger locking globally so terminal simulator can invoke it!
    window.triggerLockAnimation = function(isLocked, spin = false) {
      isLockingAction = isLocked;
      keyState = 'inserting';
      keyAnimationTime = 0;
      shackleTargetY = isLocked ? 0.35 : 0.9;
    };

    // 6. Render Loop
    function animate() {
      requestAnimationFrame(animate);

      // Smoothly interpolate shackle slide (locking action)
      shackleGroup.position.y += (shackleTargetY - shackleGroup.position.y) * 0.15;

      // Key animation state machine
      const time = Date.now() * 0.0018;
      if (keyState === 'orbit') {
        // Natural circular orbit surrounding padlock
        const orbitRadiusX = 2.4;
        const orbitRadiusZ = 1.7;
        keyGroup.position.x = Math.cos(time) * orbitRadiusX;
        keyGroup.position.z = Math.sin(time) * orbitRadiusZ;
        keyGroup.position.y = -0.3 + Math.sin(time * 2.2) * 0.22;

        keyGroup.rotation.x = Math.sin(time) * 0.2;
        keyGroup.rotation.y = -time + Math.PI / 2;
        keyGroup.rotation.z = Math.cos(time * 1.5) * 0.2;
      } else {
        keyAnimationTime += 0.016;

        if (keyState === 'inserting') {
          // Align directly in front of the keyhole
          const targetPos = new THREE.Vector3(0, -0.5, 2.1);
          keyGroup.position.lerp(targetPos, 0.16);

          // Return rotations back to front-facing zero
          keyGroup.rotation.x += (0 - keyGroup.rotation.x) * 0.16;
          keyGroup.rotation.y += (0 - keyGroup.rotation.y) * 0.16;
          keyGroup.rotation.z += (0 - keyGroup.rotation.z) * 0.16;

          if (keyAnimationTime > 0.35) {
            // Slide key straight inside keyhole
            const insidePos = new THREE.Vector3(0, -0.5, 1.45);
            keyGroup.position.lerp(insidePos, 0.24);
          }

          if (keyAnimationTime > 0.75) {
            keyState = 'turning';
            keyAnimationTime = 0;
          }
        } else if (keyState === 'turning') {
          // Turn key to lock/unlock
          const angle = isLockingAction ? Math.PI / 2 : -Math.PI / 2;
          keyGroup.rotation.z += (angle - keyGroup.rotation.z) * 0.26;

          if (keyAnimationTime > 0.35) {
            // Snap padlock shackle shut/open
            shackleGroup.position.y += (shackleTargetY - shackleGroup.position.y) * 0.4;
            
            // Cyber teal energy burst light flash!
            cyanLight.intensity = isLockingAction ? 24 : 16;
            purpleLight.intensity = isLockingAction ? 14 : 10;

            keyState = 'retracting';
            keyAnimationTime = 0;
          }
        } else if (keyState === 'retracting') {
          // Decay lighting energy back to normal
          cyanLight.intensity += (8 - cyanLight.intensity) * 0.1;
          purpleLight.intensity += (6 - purpleLight.intensity) * 0.1;

          // Return rotation back to zero
          keyGroup.rotation.z += (0 - keyGroup.rotation.z) * 0.16;

          if (keyAnimationTime > 0.25) {
            // Slide key out of the keyhole
            const exitPos = new THREE.Vector3(0, -0.5, 2.5);
            keyGroup.position.lerp(exitPos, 0.22);
          }

          if (keyAnimationTime > 0.75) {
            keyState = 'orbit';
          }
        }
      }

      // Smoothly interpolate lock rotation looking at mouse cursor
      targetX = mouseX * 0.8;
      targetY = mouseY * 0.5;

      // Integrate scroll-linked interactive rotation and zoom out
      const scrollRotation = scrollPercent * Math.PI * 1.2;
      const scrollZoom = scrollPercent * -2.5;

      lockGroup.rotation.y += (targetX + scrollRotation - lockGroup.rotation.y) * 0.08;
      lockGroup.rotation.x += (targetY - lockGroup.rotation.x) * 0.08;
      lockGroup.position.z += (scrollZoom - lockGroup.position.z) * 0.1;

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

  // ----------------------------------------------------
  // Scroll-Driven 3D Encryption Data Core
  // ----------------------------------------------------
  function init3DBackground() {
    const canvas = document.getElementById('bg-3d-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a data core (a grid of cubes representing plaintext data)
    const dataGroup = new THREE.Group();
    const blocks = [];
    
    // We will build a 3D grid representing a "file"
    const cols = 15;
    const rows = 15;
    const depth = 3;
    const spacing = 1.2;

    const plainMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Purple
      metalness: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8
    });

    const encryptedMaterial = new THREE.MeshStandardMaterial({
      color: 0x14b8a6, // Cyan/Teal
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    });

    const geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        for (let z = 0; z < depth; z++) {
          // Skip some blocks to make it look like a tech abstract file
          if (Math.random() > 0.6) continue;

          const mesh = new THREE.Mesh(geometry, plainMaterial);
          
          // Initial plaintext position
          const posX = (x - cols / 2) * spacing;
          const posY = (y - rows / 2) * spacing;
          const posZ = (z - depth / 2) * spacing;
          
          mesh.position.set(posX, posY, posZ);
          
          // Store data for animation
          blocks.push({
            mesh: mesh,
            baseX: posX,
            baseY: posY,
            baseZ: posZ,
            randX: (Math.random() - 0.5) * 40,
            randY: (Math.random() - 0.5) * 40,
            randZ: (Math.random() - 0.5) * 40,
            rotSpeedX: (Math.random() - 0.5) * 4,
            rotSpeedY: (Math.random() - 0.5) * 4,
            isEncrypted: false
          });

          dataGroup.add(mesh);
        }
      }
    }
    
    scene.add(dataGroup);

    // Advanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2dd4bf, 5, 50);
    pointLight.position.set(0, 5, 10);
    scene.add(pointLight);

    // Dynamic light based on theme
    if (document.body.classList.contains('light-theme')) {
      ambientLight.intensity = 1.0;
      pointLight.intensity = 6;
    }

    // Scroll & Mouse Interaction
    let scrollPercent = 0;
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    });

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function render() {
      requestAnimationFrame(render);

      // The animation state is heavily driven by scroll percentage (0 to 1)
      // We amplify it to create an "encryption explosion" effect
      const encryptionProgress = Math.min(scrollPercent * 2.5, 1);
      
      dataGroup.rotation.y = mouseX * 0.5 + encryptionProgress * Math.PI;
      dataGroup.rotation.x = mouseY * 0.5 + encryptionProgress * Math.PI * 0.5;

      // Animate each block based on scroll
      blocks.forEach((b) => {
        // Transition position: From ordered grid -> scattered encrypted cipher chaos
        b.mesh.position.x = b.baseX + (b.randX * encryptionProgress);
        b.mesh.position.y = b.baseY + (b.randY * encryptionProgress);
        b.mesh.position.z = b.baseZ + (b.randZ * encryptionProgress);
        
        // Add some idle float
        b.mesh.position.y += Math.sin(Date.now() * 0.002 + b.baseX) * 0.2;

        // Transition rotation
        b.mesh.rotation.x = b.rotSpeedX * encryptionProgress * Math.PI;
        b.mesh.rotation.y = b.rotSpeedY * encryptionProgress * Math.PI;

        // Material transition (simulate encrypting the data block)
        if (encryptionProgress > 0.3 && !b.isEncrypted) {
          b.mesh.material = encryptedMaterial;
          b.isEncrypted = true;
        } else if (encryptionProgress <= 0.3 && b.isEncrypted) {
          b.mesh.material = plainMaterial;
          b.isEncrypted = false;
        }
        
        // Scale pulse effect near the transition threshold
        const scaleBump = Math.max(0, 1 - Math.abs(encryptionProgress - 0.3) * 5);
        const currentScale = 1 + scaleBump * 0.5;
        b.mesh.scale.set(currentScale, currentScale, currentScale);
      });

      // Move camera slightly dynamically
      camera.position.z = 25 - (encryptionProgress * 5);

      renderer.render(scene, camera);
    }

    render();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // Launch 3D initializations
  init3DLock();
  init3DBackground();
});
