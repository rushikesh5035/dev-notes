# Setting Up shadcn/ui in Turborepo with Bun

This guide walks you through setting up shadcn/ui in a shared UI package within a Turborepo monorepo using Bun.

## Prerequisites

- Node.js 18+ or Bun installed
- A Turborepo project structure

## Project Structure

```
your-monorepo/
├── apps/
│   ├── web/          # Your Next.js app
│   └── docs/         # Optional: Another Next.js app
├── packages/
│   ├── ui/           # Shared UI package (we'll set this up)
│   ├── typescript-config/
│   └── eslint-config/
├── package.json
└── turbo.json
```

---

## Step 1: Update UI Package Configuration

### 1.1 Update `packages/ui/package.json`

Add the necessary dependencies and exports:

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./lib/*": "./src/lib/*.ts",
    "./hooks/*": ["./src/hooks/*.ts", "./src/hooks/*.tsx"],
    "./components/ui/*": "./src/components/ui/*.tsx",
    "./components/*": "./src/components/*"
  },
  "scripts": {
    "ui": "bunx --bun shadcn@latest",
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/node": "^22.15.3",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "eslint": "^9.39.1",
    "typescript": "5.9.2"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.1.1",
    "@tailwindcss/postcss": "^4.1.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "postcss": "^8.5.6",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss": "^4.1.18",
    "tw-animate-css": "^1.0.2"
  }
}
```

**Key Points:**

- `"ui"` script allows running `bun run ui add <component>` to add shadcn components
- Exports properly expose components, styles, and utilities
- Note the specific order: `./components/ui/*` comes before `./components/*`

---

## Step 2: Create Directory Structure

Create the following directories in `packages/ui/src/`:

```bash
cd packages/ui
mkdir -p src/lib
mkdir -p src/components/ui
mkdir -p src/styles
mkdir -p src/hooks
```

---

## Step 3: Create Utility Functions

### 3.1 Create `packages/ui/src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This utility function is used by shadcn components to merge Tailwind classes.

---

## Step 4: Create shadcn Configuration

### 4.1 Create `packages/ui/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@repo/ui/components",
    "utils": "@repo/ui/lib/utils",
    "ui": "@repo/ui/components/ui",
    "lib": "@repo/ui/lib",
    "hooks": "@repo/ui/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Configuration Options:**

- `style`: Choose between "new-york" or "default"
- `rsc`: Set to `false` for client components
- `aliases`: Must match your package name and structure

---

## Step 5: Create Global Styles with Tailwind v4

### 5.1 Create `packages/ui/src/styles/globals.css`

```css
@import "tailwindcss";
@source "../../../apps/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";

@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --warning: oklch(0.95 0.15 85);
  --warning-foreground: oklch(0.95 0.15 85);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --warning: oklch(0.65 0.15 85);
  --warning-foreground: oklch(0.98 0.15 85);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

This uses Tailwind CSS v4 syntax with CSS variables for theming.

---

## Step 6: Update PostCSS Configuration

### 6.1 Verify `packages/ui/postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: { "@tailwindcss/postcss": {} },
};

export default config;
```

---

## Step 7: Update TypeScript Configuration

### 7.1 Update `packages/ui/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/ui/*": ["./src/*"]
    }
  },
  "include": ["."],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 8: Install Dependencies

```bash
# From the root of your monorepo
bun install

# Or specifically in the UI package
cd packages/ui
bun install
```

---

## Step 9: Configure Next.js Apps

For each Next.js app that will use the UI package:

### 9.1 Update `apps/web/package.json`

Add TypeScript config and PostCSS dependencies:

```json
{
  "dependencies": {
    "@repo/ui": "*",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@repo/typescript-config": "*",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 9.2 Update `apps/web/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
```

**Important:** The `transpilePackages` option tells Next.js to compile the `@repo/ui` package.

### 9.3 Create `apps/web/postcss.config.mjs`

```javascript
export { default } from "@repo/ui/postcss.config";
```

### 9.4 Update `apps/web/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### 9.5 Update `apps/web/app/layout.tsx`

Import the global CSS:

```tsx
import "@repo/ui/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your App",
  description: "Your app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## Step 10: Add Your First Component

Now you can add shadcn components:

```bash
cd packages/ui
bun run ui add button
```

This will create `packages/ui/src/components/ui/button.tsx`.

---

## Step 11: Use Components in Your App

### 11.1 Example `apps/web/app/page.tsx`

```tsx
import { Button } from "@repo/ui/components/ui/button";

export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>
      <div className="flex gap-4">
        <Button>Primary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
    </div>
  );
}
```

---

## Step 12: Start Development

```bash
# From the root of your monorepo
bun dev

# Or specifically for web app
cd apps/web
bun dev
```

Visit http://localhost:3000 to see your app!

---

## Adding More Components

To add more shadcn components:

```bash
cd packages/ui

# Add individual components
bun run ui add card
bun run ui add input
bun run ui add dialog
bun run ui add dropdown-menu

# List all available components
bun run ui add
```

---

## Troubleshooting

### Module Not Found Errors

If you get "Cannot resolve '@repo/ui/components/ui/button'":

1. Ensure exports in `packages/ui/package.json` include:

   ```json
   "./components/ui/*": "./src/components/ui/*.tsx"
   ```

2. Verify `transpilePackages: ["@repo/ui"]` in `next.config.ts`

3. Clear Next.js cache:
   ```bash
   rm -rf apps/web/.next
   ```

### TypeScript Errors

1. Restart TypeScript server in VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

2. Ensure all apps have `@repo/typescript-config` in devDependencies

### Styling Not Applied

1. Verify `@repo/ui/globals.css` is imported in your layout
2. Check that `postcss.config.mjs` references the UI package config
3. Ensure Tailwind dependencies are installed in both UI package and apps

---

## Summary

You now have:

✅ A shared UI package with shadcn/ui  
✅ Tailwind CSS v4 with theming support  
✅ TypeScript configuration across the monorepo  
✅ Hot reload for component changes  
✅ Easy component additions via CLI

All your apps can now use `@repo/ui/components/ui/*` to access beautiful, accessible components!

---

## Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Reference Repository](https://github.com/dan5py/turborepo-shadcn-ui)
