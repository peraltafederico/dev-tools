# CLAUDE.md

## Project: Dev Tools

Single React app serving all developer utilities at `tools.federicoperalta.com`.

### Architecture

- **Monorepo** with pnpm workspaces, single app at `apps/web`
- **React Router** for client-side routing (`/`, `/text-compare`, `/json-prettifier`)
- **Shared Layout** component with nav header across all pages
- **Dark theme** (#0d1117) consistent everywhere

### Key Files

- `apps/web/src/App.tsx` — Router with all routes
- `apps/web/src/components/Layout.tsx` — Shared header/nav
- `apps/web/src/pages/Home.tsx` — Tool grid landing page
- `apps/web/src/pages/TextCompare.tsx` — Text diff tool (uses `diff` library)
- `apps/web/src/pages/JsonPrettifier.tsx` — JSON formatter with tree view
- `apps/web/src/components/JsonTreeView.tsx` — Recursive JSON tree renderer

### Adding a New Tool

1. Create `apps/web/src/pages/NewTool.tsx`
2. Add route in `apps/web/src/App.tsx`
3. Add nav link in `apps/web/src/components/Layout.tsx`
4. Add card in `apps/web/src/pages/Home.tsx`

### Deploy

```bash
cd apps/web && pnpm run build && npx wrangler pages deploy dist --project-name=dev-tools-landing
```

Cloudflare Pages project: `dev-tools-landing`
Custom domain: `tools.federicoperalta.com`

### SPA Routing

`public/_redirects` handles SPA fallback for Cloudflare Pages (all routes → index.html).

### Dependencies

- `diff` — text diffing engine for Text Compare
- `react-router-dom` — client-side routing
- Tailwind CSS v4 via `@tailwindcss/vite`
