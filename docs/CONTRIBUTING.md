# Contributing Guidelines

Thank you for your interest in contributing to **THE TRACKER**! This document provides guidelines, conventions, and steps to make the contribution process smooth and structured.

---

## 1. Git Branching Model

We follow a Git Flow style development model:

* **`main`**: Represents the current stable, production-ready release. Direct pushes are disabled.
* **`develop`**: The primary branch for staging changes before release.
* **Feature Branches (`feature/feature-name`)**: Used for developing new features. Create feature branches off `develop`.
* **Bugfix Branches (`bugfix/issue-name`)**: Used for fixing bugs in the staging environment.
* **Hotfix Branches (`hotfix/issue-name`)**: Used to deploy urgent patches directly to the `main` production environment.

### Typical Workflow
1. Fork/Clone the repository.
2. Create a branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/dynamic-rest-timer
   ```
3. Commit your changes locally.
4. Push to your branch and submit a Pull Request to merge into `develop`.

---

## 2. Commit Message Conventions

We enforce the **Conventional Commits** standard to ensure readable changelogs and automated release notes.

### Format
`<type>(<scope>): <description>`

### Types
* **`feat`**: A new feature (e.g. `feat(timer): add vibration on countdown end`).
* **`fix`**: A bug fix (e.g. `fix(auth): resolve token refresh loop on slow connections`).
* **`docs`**: Documentation changes only (e.g. `docs(readme): update setup guidelines`).
* **`style`**: Changes that do not affect the meaning of the code (formatting, semicolon fixes, etc.).
* **`refactor`**: Code changes that neither fix a bug nor add a feature.
* **`test`**: Adding missing tests or correcting existing tests.
* **`chore`**: Changes to the build process, helper tools, or dependencies.

---

## 3. Coding Style & Linting

Before pushing your changes, verify that your code complies with our style guidelines:

### Setup
The project uses **ESLint** for code quality audits and **Prettier** for styling formats.

### Run Quality Checks
* **Format code**:
  ```bash
  npm run format
  ```
* **Lint verification**:
  ```bash
  npm run lint
  ```
* **Verify Types**:
  ```bash
  npm run typecheck
  ```

---

## 4. Pull Request (PR) Checklist

When submitting a Pull Request, ensure that it fulfills the following requirements:
* [ ] The PR target branch is set to `develop`.
* [ ] All automated linters, type checks, and test suites pass successfully.
* [ ] The commit history is squashed into clean, logical commits matching Conventional Commits.
* [ ] Documentation has been updated to reflect the code changes.
* [ ] The PR description includes a summary of changes, links to the corresponding issues, and instructions on how to test the feature manually.
* [ ] If the changes modify the database, migration scripts have been added inside `supabase/migrations/` and verified using local CLI resets.
