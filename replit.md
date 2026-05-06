# SoruÇöz

Turkish school Q&A mobile app where students photograph questions and send them to a subject pool, and teachers claim and solve them with a drawing canvas.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/sorucozum run dev` — run Expo app (managed by workflow)
- `pnpm run typecheck` — full typecheck across all packages (run `typecheck:libs` first if DB schema changed)
- `pnpm run typecheck:libs` — rebuild composite lib declarations (run after schema changes)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router v6
- API: Express 5, port 8080
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle for server)
- Auth: SHA-256 password hash (Node crypto), random 32-byte Bearer token stored in DB

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas (index.ts exports only from `api.ts`, NOT `types/`)
- `lib/db/src/schema/` — Drizzle schema: `users.ts`, `questions.ts`, `solutions.ts`
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/sorucozum/app/` — Expo Router screens
- `artifacts/sorucozum/contexts/AuthContext.tsx` — auth state + API client setup
- `artifacts/sorucozum/components/DrawingCanvas.tsx` — SVG drawing canvas with PanResponder

## Architecture decisions

- **Role-based tabs**: Single `(tabs)` layout hides/shows tabs based on `user.role` via `tabBarButton: () => null`; students see "Soru Sor" + "Geçmişim" + "Profil", teachers see "Sorular" + "Profil"
- **Smart matching**: Question pool sorts same-school questions first; student can optionally pick a preferred teacher
- **Base64 photos**: Question photos stored as base64 data URLs in PostgreSQL (25MB payload limit on server)
- **Drawing canvas**: SVG paths via `react-native-svg` + `PanResponder`; serialized to JSON string for API storage
- **lib/api-zod index.ts**: Must only export from `./generated/api` (not `./generated/types`) to avoid TS2308 duplicate export errors

## Product

- **Student flow**: Register → take/pick question photo → select subject → optionally pick teacher → submit → view solution in history
- **Teacher flow**: Register with school + branş → browse question pool (sorted by same-school first) → claim question → draw solution on canvas (colored pens + eraser) → add note → submit
- **Availability toggle**: Teachers can toggle "Müsaitim / Dersteyim" status on profile screen
- **Auto-refresh**: Question pool refreshes every 15s, history every 20s

## User preferences

- Turkish UI throughout (all labels, alerts, messages in Turkish)
- Colors: primary `#1A56DB` (blue), accent `#FF6D00` (orange), background `#F5F7FA`

## Gotchas

- Always run `pnpm run typecheck:libs` after changing DB schema before typechecking server/app packages
- `lib/api-zod/src/index.ts` must only have `export * from "./generated/api"` — adding types export causes TS2308
- Orval-generated hooks require `queryKey` in query options (React Query v5 strictness); import `get*QueryKey` helpers
- `"/(tabs)/"` route path causes TS error — use `"/(tabs)"` without trailing slash
- Server payload limit is 25MB to support base64 photo uploads

## Pointers

- See `pnpm-workspace` skill for workspace structure
- See `expo` skill for Expo-specific patterns
- API spec: `lib/api-spec/openapi.yaml`
