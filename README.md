# wo2go

Find out where you can go by train right now from a station (fast, local-first search).

**Live Demo:** https://wo2go.vercel.app

<!-- TODO: Add screenshot after deployment -->

## What's new (May 2026)

- Per-train UI: individual trains are now shown as cards and sorted by departure time. See `components/departure-card.tsx` and `components/departures-client.tsx`.
- Better filters: filter labels are visible across themes and we've added a **High-speed** filter (IC / ICE). See `components/filter-bar.tsx` and `types/index.ts`.
- Product colors: trains (RE, RB, S, IC, ICE) now have distinct badge colors via `lib/format.ts`.
- High-speed-only view: new `highSpeedOnly` filter to show only IC/ICE services.
- Runtime theming (dark mode): theme state, persistence (`wo2go-theme`), and runtime CSS variable overrides were added in `components/language-provider.tsx`. A small `ThemeToggle` component (`components/theme-toggle.tsx`) is available and placed in the header (`components/header.tsx`).
- Destinations loader robustness: the client loader uses an `AbortController`, exponential backoff for partial reattempts, and a short fail-safe timer to avoid stuck overlays (`components/destinations-loader.tsx`).
- Dev mock for Berlin Hbf: a small mock dataset for `stationId === '8011160'` was added to the API to help test the UI (`app/api/departures/route.ts`).
- Debugging preserved: extra logs and safety timers are kept in place to help diagnose flaky overlay/navigation edge cases.

## Why this exists

If you have a Deutschlandticket and you're at a station, wo2go helps you quickly see where you can go without transfers (or with preferred filters). It prioritizes a local-first UX: fast server-side aggregation with a responsive client filter layer.

## Tech stack

- Next.js (App Router, Server Components)
- TypeScript
- Tailwind CSS + shadcn/ui
- v6.db.transport.rest (public Deutsche Bahn transport API)

## Run locally

```bash
git clone https://github.com/zzaaid03/wo2go.git
cd wo2go
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

Quick checks while developing

- To see the Berlin Hbf dev mock (sample departures and destinations), visit: `http://localhost:3000/station/8011160` (dev-only mock).
- Toggle theme using the sun/moon button in the header; the choice is persisted to `localStorage` under the key `wo2go-theme`.
- Run type-checks: `npx tsc --noEmit`.

## Developer notes

- New components and important files:
	- `components/departure-card.tsx`
	- `components/departures-client.tsx`
	- `components/destinations-loader.tsx`
	- `components/filter-bar.tsx`
	- `components/language-provider.tsx` (theme + language context)
	- `components/theme-toggle.tsx` (header toggle)
	- `app/api/departures/route.ts` (dev mock + API shape)
	- `lib/format.ts` (product color mapping)

- Filters include `regionalOnly`, `majorStationsOnly`, and `highSpeedOnly`. Types were updated and UI wiring added.
- The client loader implements an abortable fetch with retries and a short fail-safe timeout to avoid infinite overlays.

## Roadmap / Next steps

- Add a small `system` theme option (follow OS preference) and an explicit mock toggle (query param) for easier testing.
- Map view and station autocomplete.
- Cache layer and optional Postgres persistence for heavy-traffic deployments.

## Contributing

- Run linting and type-checks before opening a PR:

```bash
npm run lint
npx tsc --noEmit
```

- Commit messages follow the `feat/fix/docs` conventions used in this repo.

## Acknowledgements

- [v6.db.transport.rest](https://v6.db.transport.rest)
- [direkt.bahn.guru](https://github.com/juliuste/direkt.bahn.guru)
- [Chronotrains](https://www.chronotrains.com)
- [station_reach](https://github.com/felix-geoloek/station_reach)

