# Coin Collection Tracker

A personal coin-collection cataloging PWA — works on phone and laptop from the same data, installable to a phone home screen. Built with React + Vite + Tailwind, backed by Supabase (Postgres + Auth + Storage).

**Live:** <https://coin-collection-seven.vercel.app> (private — sign-in required; see [One-time setup](#one-time-setup) to create a user)

Full project context (goals, decisions, API caveats) lives in [docs/HANDOFF.md](docs/HANDOFF.md).

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Core CRUD: add/edit/delete coins, list, search, filter, sort | ✅ Done |
| 2 | Photo upload (Supabase Storage), obverse/reverse per coin | Not started (schema + storage bucket already in place) |
| 3 | Numista catalog lookup (free text-search API) to auto-fill fields | Not started — **request an API key early**, approval takes days |
| 4 | Camera scan → Claude vision extraction → Numista match → auto-fill | Not started |
| 5 | Polish: stats, CSV export, advanced filters | Not started |

## One-time setup

1. **Create a Supabase project** (free) at [supabase.com](https://supabase.com).
2. **Create the schema**: Dashboard → SQL Editor → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → Run. This creates the `coins` and `coin_photos` tables, RLS policies, and the `coin-photos` storage bucket.
3. **Create a login user**: Dashboard → Authentication → Users → Add user (email + password). There's no self-serve signup — this is a private, single-family app. Any user you create here has full access to the collection.
4. **Configure the app**: copy `.env.example` to `.env.local` and fill in the Project URL and anon key from Dashboard → Project Settings → API.

## Run locally

```sh
npm install
npm run dev
```

If Supabase isn't configured yet, the app shows a setup checklist instead of crashing.

Note: Vite is pinned to v6 and oxlint to 1.16 because this machine runs Node 20.17 (their newer major versions need Node ≥ 20.19). Fine to bump both after upgrading Node.

## Deploy (Vercel)

Already deployed and live at the URL above, with GitHub auto-deploy wired up — every push to `main` triggers a new production build. To reproduce this setup elsewhere (e.g. a different Vercel account):

1. Push this repo to GitHub and import it in Vercel (or `vercel link` + `vercel git connect <repo-url>`).
2. Framework preset: Vite. Add the two `VITE_SUPABASE_*` env vars for Production, Preview, and Development.
3. The SPA rewrite so client-side routes survive a refresh is already in `vercel.json`.
4. Open the deployed URL on the phone → Share → Add to Home Screen. It installs as an app (PWA manifest + service worker are built in).

## For Phase 3 (do this early)

Numista API keys are granted by emailing Numista with your use case (personal, low volume). Allow a few days. Docs: <https://en.numista.com/api/doc/index.php>. **Do not** enable their image-search API — it costs €100/month minimum; the plan is Claude vision + free text search instead (see handoff doc §4).
