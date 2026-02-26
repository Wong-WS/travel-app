# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

Install deps: `npm install` (uses `legacy-peer-deps=true` via `.npmrc`).

No test suite is configured.

## Architecture

**Wandermark** — a travel tracking social app. Users log countries/cities visited, view them on an interactive world map, follow other travelers, and compete on a leaderboard.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (auth + postgres + storage) · `react-simple-maps` + `d3-geo` for the SVG world map.

**Deployed to Vercel.** Env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required.

### Route structure

| Route | Type | Auth required |
|---|---|---|
| `/` | Server Component | No |
| `/login` | Client Component | No |
| `/map` | Server → Client | Yes |
| `/feed` | Server Component | Yes |
| `/leaderboard` | Server Component | No |
| `/profile/[username]` | Server → Client | No (follow action requires auth) |

### Supabase integration pattern

- **Server components/actions:** `src/lib/supabase/server.ts` — `createClient()` using `next/headers` cookies
- **Client components:** `src/lib/supabase/client.ts` — `createBrowserClient()`
- **Middleware session refresh:** `src/lib/supabase/middleware.ts` — `updateSession()` (called from `src/proxy.ts` which acts as Next.js middleware)

Note: `src/proxy.ts` is the actual middleware entry point (has the `config` matcher export), even though it's not named `middleware.ts`. Route protection for `/map` and `/feed` is done there.

### Database schema (`supabase/schema.sql`)

Four tables: `profiles` (extends `auth.users`), `visits`, `photos`, `follows`.

- A Postgres trigger auto-updates `profiles.country_count` and `profiles.city_count` on any visit insert/update/delete.
- A trigger auto-creates a `profiles` row on Supabase auth signup, using `username` from `raw_user_meta_data`.
- RLS is enabled on all tables; visits and profiles are publicly readable, writes are owner-only.

### Map component

`WorldMap.tsx` uses `react-simple-maps` with topojson from a CDN (`world-atlas@2/countries-110m.json`). Country ISO codes are resolved from `geo.properties.ISO_A2`; a fallback `COUNTRY_NAME_TO_CODE` map handles edge cases. Visited countries render in blue (`#3B82F6`); city pins (amber dots) render only when `lat`/`lng` are provided on a visit.

### Key component relationships

- `MapClient` (client) wraps `WorldMap` + `AddVisitModal` + sidebar with `VisitCard` list — all owned by the authenticated user
- `ProfileClient` (client) shows another user's `WorldMap` (non-interactive) + their visit cards + follow/unfollow button
- `Navbar` (client) fetches user + profile on mount, listens to `onAuthStateChange`

### Type definitions (`src/types/index.ts`)

`UserProfile`, `Visit` (with optional `photos: Photo[]`), `Photo`, `Follow`, `FeedItem`.

## Deployment

- **Production URL:** https://travel-app-omega-sand.vercel.app
- **Vercel project:** travel-app-omega-sand

## Test Account

Created for browser testing via Chrome automation:

- **Username:** claudetest
- **Email:** claudetest.wandermark@gmail.com
- **Password:** WanderTest2026!

Note: Account was manually confirmed via Supabase SQL (`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '...'`) since email confirmation is enabled on this project.

## Known Bugs (found during testing)

- **Canada (and likely other countries) not highlighted on map after adding a visit.** Root cause: `world-atlas@2/countries-110m.json` topojson does not include `ISO_A2` property, and many country names are missing from the `COUNTRY_NAME_TO_CODE` fallback map in `WorldMap.tsx`. This causes `getCountryCode()` to return `''`, so visits are saved with an empty `country_code` and the map can't match them to highlight the correct country.
