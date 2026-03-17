# Dev Tools

A collection of free, fast, and privacy-friendly developer utilities.

**Live:** [tools.federicoperalta.com](https://tools.federicoperalta.com)

## Tools

- **Text Compare** (`/text-compare`) — Compare two blocks of text side by side with highlighted differences
- **JSON Prettifier** (`/json-prettifier`) — Format, validate, and beautify JSON with syntax highlighting

## Structure

```
dev-tools/
├── apps/
│   └── web/          # Single React app with all tools
│       ├── src/
│       │   ├── App.tsx
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   ├── TextCompare.tsx
│       │   │   └── JsonPrettifier.tsx
│       │   └── components/
│       │       ├── Layout.tsx
│       │       └── JsonTreeView.tsx
│       └── ...
├── package.json
└── pnpm-workspace.yaml
```

## Development

```bash
pnpm install
pnpm dev
```

## Deploy

```bash
pnpm deploy
# or manually:
cd apps/web && pnpm run build && npx wrangler pages deploy dist --project-name=dev-tools-landing
```

Deployed to Cloudflare Pages (`dev-tools-landing` project).
Custom domain: `tools.federicoperalta.com`

## Tech Stack

- React 19 + TypeScript
- React Router (client-side routing)
- Tailwind CSS v4
- Vite 8
- Cloudflare Pages
