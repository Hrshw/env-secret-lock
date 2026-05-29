# Contributing to env-secret-lock

Thank you for your interest in contributing to `env-secret-lock`! Community contributions are what make open-source tools amazing.

Following these guidelines helps ensure a smooth and efficient review process for everyone.

## Code of Conduct

By participating in this project, you agree to maintain a friendly, professional, and respectful environment for all contributors.

## How Can I Contribute?

### 1. Reporting Bugs
* Check the [Issues tab](https://github.com/Hrshw/env-secret-lock/issues) to make sure the bug hasn't already been reported.
* Open a new issue using our **Bug Report** template, providing as much detail as possible (OS, Node version, commands run, and error logs).

### 2. Suggesting Enhancements
* Search the [Discussions](https://github.com/Hrshw/env-secret-lock/discussions) tab to see if your idea is already being discussed.
* Open a new topic under the **Ideas** category in Discussions to gather feedback before writing code.

### 3. Submitting Pull Requests
* **Fork** the repository and create a new branch from `main` (e.g., `git checkout -b feat/my-new-feature`).
* Make your changes.
* Ensure all local tests pass by running:
  ```bash
  npm test
  ```
* Commit your changes with a clear, descriptive message (e.g., `feat: add support for custom .env paths`).
* Push your branch to your fork and submit a **Pull Request** to the `main` branch of this repository.

## Local Development Setup

To set up a local development environment:

1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/env-secret-lock.git
   cd env-secret-lock
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Test your local CLI changes by running:
   ```bash
   node bin/secret-lock.js <command>
   ```

Thank you again for making developer environments safer!
