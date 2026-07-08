# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal coin-collection cataloging PWA for a single family (built for the requester's dad). React + Vite + Tailwind frontend, Supabase (Postgres + Auth + Storage) backend, no custom server. Deployed to Vercel with GitHub auto-deploy on push to `main`. Full background/rationale/phased plan is in `docs/HANDOFF.md`; current phase status is in `README.md`.

## Commands

```sh
npm run dev      # start Vite dev server
npm run build    # tsc -b (typecheck) then vite build
npm run lint     # oxlint src
npm run preview  # preview a production build
```

There is no test suite yet. `npm run build` is the main correctness gate (typecheck + build) alongside `npm run lint`.

### Node/tooling version pin

This machine runs Node 20.17, so **Vite is pinned to v6 and oxlint to 1.16** (their newer majors require Node ≥ 20.19). Don't bump these past their current major without checking the Node version first — it's fine to bump both after a Node upgrade.

## Architecture

- **No backend code in this repo** — Supabase is used directly from the client (`src/lib/supabase.ts` creates a lazy singleton client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`). All authorization is enforced by Postgres Row Level Security policies in `supabase/schema.sql`, not in application code. Any signed-in user has full read/write access to all coins — this is intentionally a single-family shared collection, not per-user data isolation.
- **`supabase/schema.sql` is the source of truth for the DB schema** and is applied manually via the Supabase SQL Editor (no migration tool). When changing the data model, update this file *and* `src/types.ts` (`Coin` / `CoinInput`) together — nothing generates one from the other.
- **Config-gated boot flow**: `App.tsx` checks `isSupabaseConfigured` before rendering anything else and shows `SetupScreen` if env vars are missing, so the app degrades gracefully instead of crashing when unconfigured. Below that, `AuthProvider`/`useAuth` (`src/lib/AuthContext.tsx`) gates all routes behind Supabase Auth session state, showing `Login` when signed out. There's no self-serve signup; users are created manually in the Supabase dashboard.
- **Data access is centralized in `src/lib/coins.ts`** — thin wrapper functions (`listCoins`, `getCoin`, `createCoin`, `updateCoin`, `deleteCoin`) around Supabase queries. Pages call these rather than touching `getSupabase()` directly.
- **Form state pattern** (`src/pages/CoinForm.tsx`): form fields are kept as strings in local state regardless of underlying type, then converted to typed `CoinInput` (numbers, nulls for blanks) only on submit via a local `toInput` helper. Follow this pattern for new fields rather than binding inputs directly to typed state.
- **Routing** (`src/App.tsx`): all authenticated routes are nested under a single `Layout` route (`/`, `/coins/new`, `/coins/:id`, `/coins/:id/edit`), with an unmatched-path redirect to `/`.

## Product roadmap context

Only Phase 1 (core CRUD) is built. Phases 2–5 (photo upload, Numista catalog lookup, camera-scan auto-fill via Claude vision, stats/export polish) are planned but not started — see the phase table in `README.md` and full detail in `docs/HANDOFF.md`. The `coin_photos` table and `coin-photos` storage bucket already exist in `supabase/schema.sql` in anticipation of Phase 2, and `coins.numista_id` in anticipation of Phase 3, even though nothing reads/writes them yet.

**Numista API constraint**: when building Phase 3/4, only use Numista's free text-search endpoints. Do **not** integrate Numista's paid image-search endpoint — it has a €100/month minimum, priced for commercial users, not this hobbyist app. The intended design is Claude vision to extract visible coin text, then feed that into Numista's free text search — see `docs/HANDOFF.md` §4 for the full rationale.
