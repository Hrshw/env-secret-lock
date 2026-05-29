# 🔒 secret-lock

> **Fast, local-first, zero-dependency environment secret manager CLI with Git protection and in-memory runtime execution.**

`secret-lock` solves the massive problem of **"secret sprawl"**—the dangerous practice of storing sensitive API keys, database credentials, and tokens in unencrypted plaintext `.env` files on your computer, or accidentally committing them to GitHub. 

Unlike heavy cloud platforms (like HashiCorp Vault or Infisical), `secret-lock` is a **100% local, lightweight, zero-dependency** tool designed for solo developers and agile teams who value speed, privacy, and frictionless security.

---

## ✨ Features

- 🛡️ **AES-256-GCM Encryption:** Plaintext files are encrypted at rest using industry-grade, authenticated AES-256-GCM and robust PBKDF2 key derivation.
- 🚀 **Runtime Injection:** Secrets are decrypted directly into your application process memory (`process.env`) on boot. Plaintext secrets **never touch the disk**, preventing physical access theft.
- 🎣 **Git-Guard Hook:** A single command installs an intelligent, automated Git `pre-commit` hook that blocks commits of raw `.env` files and guides you on how to secure them.
- ⚡ **Zero Dependencies:** Auditable and lighting-fast. Built strictly with standard Node.js standard libraries and `commander.js` for clean execution.
- 🤝 **Trust-First:** 100% open source. Audits are simple, and your keys never leave your machine—no servers, no telemetry, no leaks.

---

## 🚀 Quickstart in 30 Seconds

### 1. Installation
Install `env-secret-lock` globally:
```bash
npm install -g env-secret-lock
```
*Or run dynamically without installing:* `npx secret-lock --help`

### 2. Encrypt Your Plaintext Secrets
Turn your raw `.env` file into a highly secure, authenticated `.env.enc` file:
```bash
secret-lock encrypt
```
You will be securely prompted to enter and confirm your master password. 
*(Once encrypted, you can safely add your plaintext `.env` to your `.gitignore`!)*

### 3. Run Your Application with Secrets
Inject your secrets directly into your application's memory during runtime without creating any plaintext files on disk:
```bash
secret-lock run "node index.js"
```
You will be prompted for your master password, after which the CLI boots your app with all secrets loaded instantly into `process.env`.

**CI/CD or Automated Environments:**
Simply export the master password as an environment variable and it will run non-interactively:
```bash
export SECRET_LOCK_PASSWORD="your-master-password"
secret-lock run "npm start"
```

### 4. Enable Git-Guard Protection
Prevent embarrassing secret leaks. Install the pre-commit blocker hook:
```bash
secret-lock hook install
```
If you ever attempt to run `git commit` with an unencrypted `.env` file staged, the commit will be blocked immediately with instructions on how to secure it.

---

## 🔒 Security Architecture (How it Works)

`secret-lock` uses standard, battle-tested cryptographic primitives built directly into Node.js:

1. **Key Derivation (PBKDF2):**
   When you supply a master password, the tool uses `crypto.pbkdf2Sync` to derive a 256-bit cryptographic key using:
   - **HMAC-SHA256** hashing
   - **100,000 iterations** (highly resistant to GPU brute-forcing)
   - A unique, cryptographically random **16-byte salt** generated per encryption

2. **Authenticated Encryption (AES-256-GCM):**
   `secret-lock` encrypts your environment file using the `aes-256-gcm` algorithm. 
   - A new **12-byte Initialization Vector (IV)** is generated randomly for every encryption block.
   - GCM generates a **16-byte authentication tag** (stored alongside the ciphertext). During decryption, the cryptographic module checks this tag to ensure that the file has not been tampered with, corrupted, or altered by anyone at rest.

---

## 🛠️ Commands Reference

```bash
# Encrypts a plaintext file (defaults to '.env') -> creates '.env.enc'
secret-lock encrypt [file]

# Decrypts an encrypted file back into plaintext (defaults to '.env.enc')
secret-lock decrypt [file]

# Run a process with decrypted secrets loaded in-memory
secret-lock run <command> [options]
# Options:
#  -f, --file <path>   Specify a custom encrypted file (defaults to .env.enc)

# Install or uninstall the Git pre-commit guard
secret-lock hook [install|uninstall]
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
