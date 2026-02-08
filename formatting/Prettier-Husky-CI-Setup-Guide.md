# 🚀 Prettier + Husky + Lint-Staged + GitHub CI Setup

set up automated formatting, linting, and CI checks for project using **Bun**, **Prettier**, **Husky**, **Lint-Staged**, **Turbo**, and **GitHub Actions**.

---

## 1️⃣ Install Dependencies

Run:

```bash
bun add -d prettier @trivago/prettier-plugin-sort-imports prettier-plugin-tailwindcss husky lint-staged
```

- Prettier → code formatter
- Import sorter → auto-sorts imports
- Tailwind plugin → sorts class names
- Husky → git hooks
- Lint-staged → run checks on staged files

---

## 2️⃣ Setup Prettier Config

Create file: 📁 `.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",

  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],

  "importOrder": [
    "^react",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "^@repo/(.*)$",
    "^@/(.*)$",
    "^[./]"
  ],

  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true,
  "importOrderGroupNamespaceSpecifiers": true,
  "importOrderCaseInsensitive": true
}
```

---

## 3️⃣ Setup Prettier Ignore

Create file: 📁 `.prettierignore`

```gitignore
node_modules
**/node_modules

.next
out
dist
build
**/dist
**/.next
**/out
**/build

*.min.js
*.min.css
coverage
.nyc_output

package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lock

*.log

.env
.env.local
.env.*.local

.vscode
.idea

.DS_Store
Thumbs.db
```

---

## 4️⃣ Update package.json Scripts

Edit `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,mdx,css}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,mdx,css}\"",

    "lint-staged": "lint-staged",
    "prepare": "husky",

    "check-types": "turbo run check-types"
  }
}
```

---

## 5️⃣ Setup Turbo

If using Turborepo, update:

📁 `turbo.json`

```json
{
  "pipeline": {
    "format": {
      "cache": false
    },
    "format:check": {
      "cache": false
    }
  }
}
```

- ✅ Prevents Turbo from caching formatting.

---

## 6️⃣ Setup Husky Git Hooks

Initialize Husky:

```bash
bun run prepare
```

Add pre-commit hook:

```bash
npx husky add .husky/pre-commit "bun run lint-staged"
```

File created:

📁 `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname \"$0\")/_/husky.sh"

bun run lint-staged
```

- ✅ Runs checks before every commit

---

## 7️⃣ Setup Lint-Staged

Create file:

📁 `.lintstagedrc.json`

```json
{
  "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
  "*.{json,md,mdx,css,scss}": ["prettier --write"]
}
```

- ✅ On commit:
  - JS/TS → Prettier + ESLint
  - Docs/CSS → Prettier only

---

## 8️⃣ Setup GitHub CI

Create file:

📁 `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main, dev]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run Lint
        run: bun run lint

  format:
    name: Format Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Check formatting
        run: bun run format:check

  type-check:
    name: Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Check types
        run: bun run check-types

  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Build project
        run: bun run build
```

- ✅ This CI Will:
  - On every push/PR:
  1. ✔ Lint
  2. ✔ Format check
  3. ✔ Type check
  4. ✔ Build

- If any fails → PR blocked 🚫

## 9️⃣ Daily Usage

### Check Formatting

```bash
bun run format:check
```

### Fix Formatting

```bash
bun run format
```

### Commit (Auto Fix)

```bash
git commit -m "your message"
```

Husky will auto-run lint-staged.

---

## 🔄 Workflow Summary

### Local

- Prettier + ESLint run on commit
- Auto-fix issues
- Prevents bad commits

### GitHub

- Lint
- Format check
- Type check
- Build

All must pass before merge.

---

Maintained by: Rushikesh 🚀
