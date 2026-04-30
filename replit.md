# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **`artifacts/api-server`** — Express 5 API at `/api`. Hosts the `/api/companion/chat` endpoint that proxies an Anthropic chat call (via the `lib/integrations-anthropic-ai` Replit AI integration) with an Arabic faith-grounded system prompt.
- **`artifacts/mockup-sandbox`** — Vite preview server for canvas mockups.
- **`artifacts/nafsih`** — Expo Router mobile app, Arabic-first ("نفسيّه"). Uses Cairo Google fonts, sage/sand palette, RTL per-component (no global `I18nManager.forceRTL`). Persists state via AsyncStorage in `contexts/AppContext.tsx`. Tabs: الآن (home), المكتبة (library), اليوميات (journal). Push routes: `welcome`, `companion`, `breathing`. Calls the API via `setBaseUrl` with `EXPO_PUBLIC_DOMAIN`.

## Notes

- All Arabic copy and authentic Quran/hadith content lives in `artifacts/nafsih/constants/arabic.ts`.
- No emojis anywhere in the Nafsih product copy or UI.
