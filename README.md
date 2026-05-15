# wo2go

Where can you go by train from Saarbrucken Hbf right now?

**[Live Demo](https://wo2go.vercel.app)**

<!-- TODO: Add screenshot once deployed -->

## Why this exists

If you have a Deutschlandticket and you're at Saarbrucken Hbf, where can you actually go today — directly, no transfers? Existing tools like [direkt.bahn.guru](https://direkt.bahn.guru) (broken since late 2024), [Chronotrains](https://www.chronotrains.com), and [station_reach](https://github.com/felix-geoloek/station_reach) either don't work anymore or lack filtering depth. wo2go fills that gap with better filtering and richer per-destination info.

## Tech stack

- Next.js 16 (App Router, Server Components)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Vercel (deployment)
- [v6.db.transport.rest](https://v6.db.transport.rest) (public Deutsche Bahn API, no key needed)

## Run locally

```bash
git clone https://github.com/zzaaid03/wo2go.git
cd wo2go
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

The home page is a Server Component that fetches all departures from Saarbrucken Hbf for the next 12 hours via the public DB transport API. It aggregates these into a list of unique reachable destinations with stats — fastest travel time, number of connections, and train types. This data is passed as a prop to a Client Component that handles filtering (regional-only for Deutschlandticket holders, major stations only) and language switching (German/English). No database, no auth, no client-side data fetching.

The UI is available in **German** (default) and **English**, switchable via a toggle in the header. The language choice persists across sessions via localStorage.

## Roadmap

- Map view (destinations on a map)
- Station autocomplete (choose any origin)
- Day-trip feasibility filter
- Per-destination drawer with live next departures
- Caching layer with Postgres

## Acknowledgements

- [v6.db.transport.rest](https://v6.db.transport.rest) by Jannis R. for the public transport API
- [direkt.bahn.guru](https://github.com/juliuste/direkt.bahn.guru) by Julius Tens for the original concept
- [Chronotrains](https://www.chronotrains.com) for travel-time visualization inspiration
- [station_reach](https://github.com/felix-geoloek/station_reach) for reachability analysis inspiration
