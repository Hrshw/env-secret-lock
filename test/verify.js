import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { encrypt, decrypt } from '../src/crypto.js';
import { parse } from '../src/parser.js';
import { findGitDir } from '../src/git-guard.js';

// ANSI terminal colors for premium output
const C_GREEN = '\x1b[32m';
const C_RED = '\x1b[31m';
const C_YELLOW = '\x1b[33m';
const C_CYAN = '\x1b[36m';
const C_BOLD = '\x1b[1m';
const C_RESET = '\x1b[0m';

let failed = false;

function test(name, fn) {
  try {
    fn();
    console.log(`${C_GREEN}✔ PASS:${C_RESET} ${name}`);
  } catch (err) {
    console.error(`${C_RED}✖ FAIL:${C_RESET} ${name}`);
    console.error(err);
    failed = true;
  }
}

console.log(`${C_BOLD}${C_CYAN}🧪 Starting secret-lock Automated Verification Suite...${C_RESET}\n`);

// ----------------------------------------------------
// 1. CRYPTOGRAPHIC MODULE TESTS
// ----------------------------------------------------
test('Crypto: Encrypts and decrypts correctly with matching password', () => {
  const secrets = 'DB_PASSWORD=my_db_secret_key_99!\nAPI_TOKEN=sk_live_abcdef';
  const pass = 'super-duper-secure-master-password-12345';
  
  const encrypted = encrypt(secrets, pass);
  assert.ok(encrypted, 'Encryption should return a string payload.');
  
  const decrypted = decrypt(encrypted, pass);
  assert.strictEqual(decrypted, secrets, 'Decrypted text must match original plaintext.');
});

test('Crypto: Rejects wrong password during decryption', () => {
  const secrets = 'PORT=3000';
  const pass = 'correct-password';
  
  const encrypted = encrypt(secrets, pass);
  
  assert.throws(() => {
    decrypt(encrypted, 'wrong-password');
  }, /Decryption failed/, 'Should throw specialized decryption failure error.');
});

test('Crypto: Rejects tampered encrypted files', () => {
  const secrets = 'SUPER_VAL=123';
  const pass = 'password';
  
  const encrypted = encrypt(secrets, pass);
  const data = JSON.parse(encrypted);
  
  // Tamper ciphertext
  data.ciphertext = Buffer.from('tamperedciphertext').toString('base64');
  const tamperedPayload = JSON.stringify(data);
  
  assert.throws(() => {
    decrypt(tamperedPayload, pass);
  }, /Decryption failed/, 'Should fail authentication tag verification on tampered data.');
});

// ----------------------------------------------------
// 2. DOTENV PARSER TESTS
// ----------------------------------------------------
test('Parser: Parses standard key-value assignments and comments', () => {
  const rawEnv = `
    # Configuration
    PORT = 8080
    HOST=127.0.0.1
    export APP_ENV=production # Inline environment
    
    # Empty lines are skipped
    
    DB_USER=root
  `;
  
  const parsed = parse(rawEnv);
  
  assert.strictEqual(parsed.PORT, '8080');
  assert.strictEqual(parsed.HOST, '127.0.0.1');
  assert.strictEqual(parsed.APP_ENV, 'production');
  assert.strictEqual(parsed.DB_USER, 'root');
  assert.strictEqual(parsed.undefined, undefined);
});

test('Parser: Handles double, single, and backtick quotes', () => {
  const rawEnv = `
    VAL_DOUBLE = "hello \\"world\\""
    VAL_SINGLE = 'hello \\'world\\''
    VAL_BACKTICK = \`hello\`
  `;
  
  const parsed = parse(rawEnv);
  
  assert.strictEqual(parsed.VAL_DOUBLE, 'hello "world"');
  assert.strictEqual(parsed.VAL_SINGLE, "hello 'world'");
  assert.strictEqual(parsed.VAL_BACKTICK, 'hello');
});

test('Parser: Handles multiline quoted values', () => {
  const rawEnv = `
    CERTIFICATE="-----BEGIN RSA PRIVATE KEY-----
    Proc-Type: 4,ENCRYPTED
    DEK-Info: DES-EDE3-CBC,ABCDEF
    
    xyz123==
    -----END RSA PRIVATE KEY-----"
    SIMPLE=normal
  `;
  
  const parsed = parse(rawEnv);
  
  const expectedCert = `-----BEGIN RSA PRIVATE KEY-----
    Proc-Type: 4,ENCRYPTED
    DEK-Info: DES-EDE3-CBC,ABCDEF
    
    xyz123==
    -----END RSA PRIVATE KEY-----`;
    
  assert.strictEqual(parsed.CERTIFICATE, expectedCert);
  assert.strictEqual(parsed.SIMPLE, 'normal');
});

// ----------------------------------------------------
// 3. GIT PRE-COMMIT SANDBOX TESTS
// ----------------------------------------------------
test('Git-Guard: Sandbox hook install & uninstall works', () => {
  const sandboxDir = path.resolve('test/sandbox-git');
  
  // Cleanup any old sandbox
  if (fs.existsSync(sandboxDir)) {
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  }
  fs.mkdirSync(sandboxDir, { recursive: true });

  try {
    // 1. Initialize git in the sandbox
    execSync('git init', { cwd: sandboxDir, stdio: 'ignore' });
    
    // 2. Install pre-commit hook using CLI
    const runCliPath = path.resolve('bin/secret-lock.js');
    execSync(`node "${runCliPath}" hook install`, { cwd: sandboxDir });

    const hookFilePath = path.join(sandboxDir, '.git', 'hooks', 'pre-commit');
    assert.ok(fs.existsSync(hookFilePath), 'Pre-commit hook file should exist.');

    const hookContent = fs.readFileSync(hookFilePath, 'utf8');
    assert.ok(hookContent.includes('## SECRET-LOCK GIT-GUARD START ##'), 'Hook should contain signature block.');

    // 3. Uninstall hook using CLI
    execSync(`node "${runCliPath}" hook uninstall`, { cwd: sandboxDir });
    assert.ok(!fs.existsSync(hookFilePath), 'Hook file should be deleted cleanly since it was empty.');
  } finally {
    // Cleanup sandbox
    if (fs.existsSync(sandboxDir)) {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
    }
  }
});

// ----------------------------------------------------
// 4. RUNTIME PROCESS INJECTION TESTS
// ----------------------------------------------------
test('Runner: Environment variables are injected into runtime memory', () => {
  const sandboxDir = path.resolve('test/sandbox-run');

  if (fs.existsSync(sandboxDir)) {
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  }
  fs.mkdirSync(sandboxDir, { recursive: true });

  try {
    const rawEnv = 'MY_API_KEY=xyz-injected-123\nANOTHER_SECRET=success';
    const pass = 'inject-test-pass';
    
    // 1. Encrypt env content into sandbox
    const encrypted = encrypt(rawEnv, pass);
    fs.writeFileSync(path.join(sandboxDir, '.env.enc'), encrypted, 'utf8');
    
    // 2. Create test JS file inside sandbox that asserts injected keys
    const assertScript = `
      if (process.env.MY_API_KEY === 'xyz-injected-123' && process.env.ANOTHER_SECRET === 'success') {
        console.log('SUCCESS_INJECTED');
        process.exit(0);
      } else {
        console.log('FAILED_INJECTED:', process.env.MY_API_KEY, process.env.ANOTHER_SECRET);
        process.exit(1);
      }
    `;
    fs.writeFileSync(path.join(sandboxDir, 'test-env.js'), assertScript, 'utf8');
    
    // 3. Run runner CLI inside sandbox
    const runCliPath = path.resolve('bin/secret-lock.js');
    
    const output = execSync(`node "${runCliPath}" run "node test-env.js"`, {
      cwd: sandboxDir,
      env: {
        ...process.env,
        SECRET_LOCK_PASSWORD: pass // supply password non-interactively
      }
    }).toString();
    
    assert.ok(output.includes('SUCCESS_INJECTED'), 'Child script should output success confirmation.');
  } finally {
    if (fs.existsSync(sandboxDir)) {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
    }
  }
});

// ----------------------------------------------------
// VERIFICATION REPORT
// ----------------------------------------------------
console.log('\n----------------------------------------');
if (failed) {
  console.error(`${C_RED}✖ SYSTEM FAILURE: Some tests failed. Please review details above.${C_RESET}`);
  process.exit(1);
} else {
  console.log(`${C_GREEN}✔ SYSTEM CONFIRMED: All tests passed successfully! The CLI is production-ready.${C_RESET}`);
  process.exit(0);
}
