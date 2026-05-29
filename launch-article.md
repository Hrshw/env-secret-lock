# 📝 Pre-Written Launch Article: Dev.to / Hashnode Draft

Copy and paste this entire document directly into your blog editor to publish your launch article!

---

**Title:** Why I stopped using plaintext .env files for my side projects (and how I blocked Git leaks forever)
**Tags:** `security`, `javascript`, `node`, `developer-tools`

---

We've all been there.

It's 1:00 AM. You are deep in the zone, building your weekend side project. You copy your OpenAI or Stripe live API key, drop it into your local `.env` file, and keep writing code. 

An hour later, you run `git add . && git commit -m "add feature"` and push to GitHub.

Five minutes later, you get a heart-stopping email warning:
> **"Security Alert: We detected an active API key committed to a public repository."**

Panic sets in. You scramble to rotate your API keys, rewrite your git history, and hope no crawler bot has scraped your key (spoiler: they usually scrape it in under 3 seconds).

After this happened to me, I decided to fix this forever. I didn't want to set up heavy enterprise vaults (like HashiCorp Vault or Infisical) for a simple side project. I wanted a **100% local, zero-dependency, lightning-fast utility**. 

So, I built **`env-secret-lock`**.

---

## The Core Problems of the `.env` Workflow

1. **The "Oops" Factor:** Developers accidentally commit raw `.env` files to git all the time.
2. **Plaintext Exposure:** If someone gets physical access to your unlocked laptop, they can read every database password and token in your project instantly.
3. **Vault Friction:** Soldevs don't want to run cloud synchronization agents or manage remote keys just to boot a local server.

---

## How `env-secret-lock` Solves This locally

I designed the tool around three simple pillars that fit completely inside your existing terminal flow:

### 1. The Local Encryptor (AES-256-GCM)
Instead of keeping a raw `.env` file, you run:
```bash
secret-lock encrypt
```
This prompts you for a master password and encrypts your raw secrets into an authenticated `.env.enc` file using **AES-256-GCM** and robust **PBKDF2** key derivation (100k rounds of HMAC-SHA256). 

Once encrypted, you delete your plaintext `.env` file entirely!

### 2. The Git-Guard Hook (Leak Interceptor)
To prevent accidental pushes, you run:
```bash
secret-lock hook install
```
This installs an automated pre-commit hook that scans your staging area. If you or a teammate ever attempt to commit an unencrypted `.env` file, Git will **instantly block the commit** and guide you on how to secure it.

### 3. In-Memory Process Injection
To run your project without ever writing plaintext secrets back to the hard drive, you start your app with the runtime injector:
```bash
secret-lock run "node index.js"
```
It asks for your master password, decrypts `.env.enc` in-memory, pipes the values directly into `process.env`, and boots your child process. When the process closes, the memory is cleared instantly. No temp files. No disk exposure.

---

## Try it out in 30 Seconds

The utility is 100% open-source, free, and live on npm:

```bash
# 1. Install globally
npm install -g env-secret-lock

# 2. Encrypt your raw env
secret-lock encrypt

# 3. Delete plaintext file
rm .env

# 4. Boot app securely in-memory
secret-lock run "node index.js"
```

I also built a **fully interactive CLI terminal simulator** directly on the landing page so you can test the commands online in 5 seconds without installing anything:
👉 **[Landing Page & Simulator](https://hrshw.github.io/env-secret-lock/)**

Check out the code, audit the cryptography, and star the repo here:
👉 **[GitHub Repository](https://github.com/Hrshw/env-secret-lock)**

Let me know what you think in the comments! How do you protect your development secrets?
