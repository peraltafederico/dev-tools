# Dev Tools

A collection of free developer utilities by [Federico Peralta](https://github.com/peraltafederico).

## Live Tools

| Tool | URL | Description |
|------|-----|-------------|
| Landing | [tools.federicoperalta.com](https://tools.federicoperalta.com) | Index of all tools |
| Text Compare | [textcompare.federicoperalta.com](https://textcompare.federicoperalta.com) | Side-by-side text diff with highlighting |
| JSON Prettifier | [jsonprettier.federicoperalta.com](https://jsonprettier.federicoperalta.com) | Format, validate, and beautify JSON |

## Stack

- **Runtime:** Vite + React + TypeScript
- **Styling:** Tailwind CSS v4
- **Hosting:** Cloudflare Pages
- **Monorepo:** pnpm workspaces

## Development

```bash
# Install dependencies
pnpm install

# Dev all apps
pnpm run dev

# Dev a specific app
pnpm run dev:landing
pnpm run dev:text-compare
pnpm run dev:json-prettifier
```

## Build & Deploy

```bash
# Build all
pnpm run build

# Build specific
pnpm run build:landing

# Deploy all (builds first)
pnpm run deploy

# Deploy specific
pnpm run deploy:landing
pnpm run deploy:text-compare
pnpm run deploy:json-prettifier
```

## Adding a New Tool

1. Create a new Vite + React + TypeScript app in `apps/<tool-name>/`
2. Add `tsconfig.json` extending `../../tsconfig.json`
3. Add a `deploy` script in the app's `package.json` pointing to its Cloudflare Pages project
4. Add `build:<name>`, `dev:<name>`, and `deploy:<name>` scripts to root `package.json`
5. Update `apps/landing/src/App.tsx` with the new tool entry
6. Create the Cloudflare Pages project: `pnpm exec wrangler pages project create <project-name> --production-branch main`
7. Configure custom domain in Cloudflare dashboard
