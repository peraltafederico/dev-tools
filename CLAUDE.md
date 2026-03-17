# CLAUDE.md

## Architecture

Monorepo using pnpm workspaces. Each app in `apps/` is an independent Vite + React + TypeScript project that deploys to its own Cloudflare Pages project.

```
dev-tools/
├── package.json          # Workspace root with orchestration scripts
├── pnpm-workspace.yaml   # Defines apps/* as workspace packages
├── tsconfig.json         # Shared TypeScript config (apps extend this)
├── apps/
│   ├── landing/          # tools.federicoperalta.com
│   ├── text-compare/     # textcompare.federicoperalta.com
│   └── json-prettifier/  # jsonprettier.federicoperalta.com
```

## Conventions

- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. Dark theme with `#0d1117` background.
- **TypeScript:** Each app extends root `tsconfig.json`. Strict mode enabled.
- **Build:** `tsc -b && vite build` per app.
- **No shared packages yet** — each app is fully independent. Extract shared code to `packages/` if needed later.

## Deployment

Each app deploys independently to Cloudflare Pages:

| App | Pages Project | Domain |
|-----|--------------|--------|
| landing | `dev-tools-landing` | tools.federicoperalta.com |
| text-compare | `text-compare` | textcompare.federicoperalta.com |
| json-prettifier | `json-prettifier` | jsonprettier.federicoperalta.com |

Deploy command pattern: `pnpm exec wrangler pages deploy dist --project-name=<project>`

## Adding a New Tool

1. Scaffold in `apps/<name>/` with Vite + React + TS + Tailwind v4
2. Extend root tsconfig: `{ "extends": "../../tsconfig.json", "include": ["src"] }`
3. Add deploy script to app's package.json
4. Add root package.json scripts: `build:<name>`, `dev:<name>`, `deploy:<name>`
5. Update landing page tool list in `apps/landing/src/App.tsx`
6. Create Cloudflare Pages project and configure domain
