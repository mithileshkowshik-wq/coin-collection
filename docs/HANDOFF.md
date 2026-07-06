# Project Handoff: Coin Collection Tracker App

## Purpose of this document
This is a handoff doc summarizing a planning conversation with Claude (chat), so the project can be picked up and built in Claude Code. It covers the goal, decisions made, architecture, data model, API caveats, and a phased build plan.

---

## 1. Project Goal

Build a personal digital cataloging app for a coin (and eventually stamp) collection, replacing manual/spreadsheet tracking. Primary user: the requester's dad, a collector with a large collection that's becoming hard to organize.

**Core capabilities needed:**
- Log structured data per coin (fields below)
- Upload/attach photos per coin
- Look up catalog data from the Numista API to auto-fill fields
- Scan a coin with a phone camera and have fields auto-fill (via AI vision + Numista lookup, not Numista's paid image API — see section 4)
- Usable on both phone and laptop, same data, kept in sync

**Data fields per coin:**
- Country
- Year
- Denomination / value
- Currency name
- Mint mark
- Material / metal
- Weight and diameter
- Condition / grade
- Quantity
- Estimated value
- Where/when acquired
- Notes
- Photos (multiple per coin, e.g. obverse/reverse)

---

## 2. Key Decision: Build as a PWA, not native apps

Chose a **Progressive Web App (PWA)** over separate native iOS/Android apps because:
- One codebase serves both phone and laptop (responsive web app, installable to phone home screen)
- Full camera access via browser `getUserMedia` API — no App Store/Play Store review needed
- Avoids Apple developer account fee ($99/yr) and Play Store fees
- Simpler to ship and iterate solo

---

## 3. Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (or Next.js) | Single responsive UI for phone + laptop |
| Backend/DB | Supabase (Postgres + Auth + Storage) | Free tier generous; DB + file storage + auth in one product, no custom server needed |
| Photo storage | Supabase Storage | Built-in, integrates directly with the DB rows |
| Coin catalog lookup | Numista API — **free text-search endpoints only** | See caveat in section 4 |
| Camera → data extraction | Claude API (vision) | Extracts visible text (country, year, denomination, mint mark) from a coin photo as structured data |
| Hosting | Vercel/Netlify (frontend) + Supabase (backend) | Free tiers sufficient for personal/single-family use |

Estimated ongoing cost: **$0–5/month** (free tiers cover almost everything; only real marginal cost is per-image Claude API calls during scanning).

---

## 4. IMPORTANT: Numista API caveat (researched, current as of this doc)

Numista's API has two very different tiers of functionality:

- **Free, no-quota endpoints**: catalog search by text (country/year/denomination/etc.), catalog detail retrieval, user collection management (add/edit/list a user's collection). These require an API key (see below) and, for collection-management endpoints specifically, OAuth with the `view_collection`/`edit_collection` scopes on top of the API key.
- **Paid "search by image" endpoint** (actual computer-vision coin identification from a photo): **€100 one-time activation fee + €0.03 per request, with a €100/month minimum charge.** This is priced for commercial users (dealers, marketplaces), not a hobbyist app. Using Numista's own CV endpoint for a personal app would cost €100/month minimum even for occasional scans.

**Decision made: do NOT use Numista's paid image-search endpoint.** Instead:
1. Take the coin photo.
2. Send it to Claude's vision API, prompted to extract visible identifying text/features (country name, year, denomination, mint mark, any visible legends).
3. Feed those extracted values into Numista's **free** text-search endpoint to find matching catalog entries.
4. Present top match(es) to the user to confirm with one tap, then auto-fill the form from the confirmed catalog entry (composition, weight, diameter, mintage, market value, etc.).

This achieves the "scan and auto-fill" UX at near-zero marginal cost instead of $100+/month.

**Also note:** Getting a Numista API key has historically required emailing Numista directly describing your use case and expected request volume, rather than instant self-serve signup — build in a few days' lead time for this before Phase 3 work can be tested against live data. API docs: `https://en.numista.com/api/doc/index.php`.

---

## 5. Data Model

```
coins
├── id
├── country
├── year
├── denomination        -- e.g. "1 Dollar"
├── currency_name        -- e.g. "US Dollar"
├── mint_mark
├── material              -- e.g. "Silver .900"
├── weight_g
├── diameter_mm
├── grade                 -- e.g. "MS-63", "VF", "AU"
├── quantity
├── estimated_value
├── value_currency
├── acquired_date
├── acquired_place
├── acquired_price
├── notes
├── numista_id            -- FK reference to matched Numista catalog entry
├── created_at / updated_at

coin_photos
├── id
├── coin_id (FK)
├── photo_url
├── is_primary            -- flag for main display photo (e.g. obverse)
```

Note: schema is intentionally coin-specific for now. If/when stamps are added, either add a `catalog_type` discriminator column or split into a parallel `stamps` / `stamp_photos` table pair reusing the same patterns.

---

## 6. Phased Build Plan

**Phase 1 — Core CRUD app (manual entry)**
Form to add/edit/delete coins with all fields above. List/grid view. Search and filter by country, year, value. This alone is already a usable replacement for spreadsheet tracking.

**Phase 2 — Photos**
Upload from phone camera or file picker → Supabase Storage. Thumbnails in list view, full images in detail view. Support multiple photos per coin (obverse/reverse/etc.), with an `is_primary` flag.

**Phase 3 — Numista lookup (manual search)**
"Search Numista" action on the add/edit form: user enters country + rough description, gets back candidate catalog entries, taps one to auto-fill denomination, material, weight, diameter, mintage info, and estimated market value.

**Phase 4 — Camera scan + auto-fill**
Photo → Claude vision extraction → auto-run the Phase 3 Numista search with extracted values → show best-match candidates → user confirms → form auto-fills. Confirmation step stays in the loop since OCR from worn/damaged coins won't always be clean.

**Phase 5 — Polish**
- Collection stats (total value, count by country/era/material)
- CSV export (useful as an insurance/backup record)
- Sorting/advanced filtering
- Multi-photo gallery per coin

---

## 7. Suggested Build Order (for Claude Code)

1. Set up Supabase project; create `coins` and `coin_photos` tables per schema above.
2. Build Phase 1 CRUD UI in React; deploy to Vercel; verify usable on both phone browser and laptop browser.
3. Add photo upload (Phase 2).
4. Request a Numista API key (email Numista describing personal, low-volume use — allow lead time for approval); wire up manual search (Phase 3).
5. Add camera-scan flow last (Phase 4), since it depends on Phases 2 and 3 already working.
6. Polish (Phase 5) once core flows are solid.

---

## 8. Open Questions / Things to Decide Next

- Does the collection need multi-user access (e.g., dad + requester both logging coins), or single-user is fine for v1?
- Should stamps be built into this same app now, or kept as a clearly separate future extension?
- Preferred currency for estimated values (single currency, or per-coin currency field as modeled above)?
- Any offline-use requirement (e.g., logging coins with no wifi/data at a coin show), which would push toward a local-first sync approach rather than a simple Supabase-only backend?

---

*End of handoff document. Original planning discussion covered rationale for each decision above in more detail if needed.*
