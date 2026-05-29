# 🔒 env-secret-lock

> **Stop leaking your API keys. A local-first, zero-dependency CLI to encrypt your .env files and prevent accidental git commits.**

`env-secret-lock` solves the massive problem of **"secret sprawl"**—the dangerous practice of keeping sensitive API keys, database credentials, and tokens in unencrypted plaintext `.env` files on your laptop, or accidentally committing them to GitHub.

Unlike heavy cloud platforms (like HashiCorp Vault or Infisical), `env-secret-lock` is a **100% local, lightweight, zero-dependency** utility designed for solo developers, micro-teams, and side projects who value speed, privacy, and frictionless security.

---

## ✨ Core Features

- 🛡️ **AES-256-GCM Encryption:** Plaintext files are encrypted at rest using industry-grade, authenticated AES-256-GCM and robust PBKDF2 key derivation.
- 🚀 **Zero-Disk Runtime Injection:** Secrets are decrypted directly into your application process memory (`process.env`) on boot. Plaintext secrets **never touch the disk**, protecting against physical machine access theft.
- 🎣 **Git-Guard Hook:** A single command installs an intelligent, automated Git `pre-commit` hook that blocks commits of raw `.env` files and guides you on how to secure them.
- ⚡ **Zero Dependencies:** Auditable and lighting-fast. Built strictly with standard Node.js standard libraries and `commander.js` for clean execution.
- 🤝 **Trust-First:** 100% open source. Audits are simple, and your keys never leave your machine—no servers, no telemetry, no leaks.

---

## 🚀 The Developer Onboarding Guide (Step-by-Step)

Getting started with `env-secret-lock` takes under 1 minute. Follow this workflow to secure a project:

### 1. Installation
Install the package globally on your machine:
```bash
npm install -g env-secret-lock
```
*Or run dynamically without installing:* `npx env-secret-lock --help`

### 2. Create your Plaintext Secrets
Create a standard plaintext `.env` file at the root of your project containing your secrets:
```ini
PORT=3000
DATABASE_URL=postgresql://db_user:my_secret_pass@localhost:5432/main
API_KEY=sk_live_51Ny8BzH...
```

### 3. Lock & Encrypt your `.env` file
Turn your raw `.env` file into a highly secure, authenticated `.env.enc` file:
```bash
secret-lock encrypt
```
- You will be securely prompted to enter a **Master Password**. Choose a strong password and keep it safe!
- Confirm the password.
- **Result:** A secure `.env.enc` file will be created in your directory.

### 4. Delete the plaintext `.env` file (CRITICAL)
Once your secrets are safely locked inside `.env.enc`, delete the plaintext file from your disk:
```bash
# Deletes the raw plaintext secrets from your machine
rm .env
```
*(We have also automatically configured your project's `.gitignore` to prevent any future plaintext `.env` files from being committed.)*

### 5. Run your Application with Secrets
Boot your application with your secrets safely decrypted directly into memory:
```bash
secret-lock run "node index.js"
```
*(Simply type in your master password when prompted, and your secrets are instantly active inside your code via `process.env.API_KEY`!)*

---

## 🔄 How to Add or Edit Secrets in the Future

If you ever need to change a database password, add a new API key, or edit any configuration value, follow this secure loop:

```mermaid
graph TD
    A[Need to Edit Secrets] --> B[Run: secret-lock decrypt]
    B --> C[Decrypts .env.enc back to plaintext .env]
    C --> D[Open .env and edit your secrets]
    D --> E[Run: secret-lock encrypt]
    E --> F[Delete plaintext .env file again]
    F --> G[Project is Secure!]
```

1. **Decrypt the file back to plaintext:**
   ```bash
   secret-lock decrypt
   ```
   *Enter your master password when prompted. Your plaintext `.env` file is restored.*

2. **Open `.env` and make your edits** (e.g. adding `STRIPE_KEY=sk_test_...`).

3. **Re-encrypt your updated secrets:**
   ```bash
   secret-lock encrypt
   ```
   *Enter and confirm your master password to update `.env.enc`.*

4. **Delete the plaintext `.env` file** to keep your machine 100% secure!

---

## 🛡️ Git-Guard Blocker (Leaked Secret Prevention)

Accidentally committing `.env` files to Git is the most common cause of credential leaks. `env-secret-lock` blocks this out-of-the-box.

To enable the blocker hook, run:
```bash
secret-lock hook install
```
If you or a teammate ever attempt to commit an unencrypted `.env` file, the commit will be blocked immediately, displaying the following message:

```text
==============================================================
🚨  SECURITY WARNING: Plaintext secrets detected!  🚨
==============================================================
You are trying to commit plaintext environment file(s):

  -> .env

To protect your credentials, commit has been blocked.
Please follow these steps:
  1. Unstage the raw file(s):
     git restore --staged .env
  2. Encrypt your credentials using secret-lock CLI:
     secret-lock encrypt .env
  3. Add the plaintext file name to your .gitignore
==============================================================
```

*To remove the hook at any time, run: `secret-lock hook uninstall`.*

---

## 🤖 CI/CD & Automated Environments (Non-Interactive Run)

If you are running your application in an automated environment (such as a GitHub Action, Docker container, or cloud host like Heroku/Vercel/Render) where you cannot interactively type in a password, simply export the master password as an environment variable:

```bash
# 1. Export your master password
export SECRET_LOCK_PASSWORD="your-master-password"

# 2. Boot the runtime injector
secret-lock run "npm start"
```
`env-secret-lock` will automatically read `SECRET_LOCK_PASSWORD` and bypass the interactive keyboard prompt.

---

## 🔒 Cryptographic Specifications

- **Key Derivation (PBKDF2):** Derives a 256-bit key from your master password using `crypto.pbkdf2Sync` with a unique **16-byte random salt** per operation, and **100,000 iterations** of **HMAC-SHA256**.
- **Authenticated Encryption (AES-256-GCM):** Uses a random **12-byte initialization vector (IV)** and registers a **16-byte authentication tag** for every encryption. Decryption automatically validates the authentication tag to ensure the encrypted data has not been modified or corrupted at rest.

---

## 📄 License
Licensed under the [MIT License](LICENSE).
