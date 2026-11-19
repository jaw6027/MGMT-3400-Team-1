# Alpas

Find your kind of fun, wherever you are. Alpas helps travelers and locals discover activities, compare estimated prices, follow official venue links, and keep ideas together in a saved plan.

## Run locally

Requires Node.js 20.19+ or 22.12+ (tested with Node 24).

```sh
npm ci
npm run dev
```

Vite listens on port 5173 by default. The app uses vanilla JavaScript, CSS, and local SVG illustrations; no API keys or external image services are required.

## What works

- Curated sample activities for Chicago, New York, Austin, and Bakersfield
- Keyword search plus category, budget, and time-of-day filters
- Price sorting, activity details, and official venue website links
- Saved plans across cities, persisted in browser local storage
- Estimated per-person plan total and responsive layouts
- Keyboard-accessible modal dialogs and announced result counts

## Data limits

This is an initial prototype using **sample listings and estimated USD prices**, not live events, availability, or verified current pricing. Links lead to official websites for confirmation and booking. Opening hours, age policies, reservations, and extra purchases can vary. Saves are local to one browser; there is no account, server, payment flow, or cloud synchronization.

Edit the curated data in `src/catalog.js`. Each activity has a stable ID, city, title, venue, category, estimated price, time of day, duration, illustration, description, and official URL. Before production, connect a licensed event provider through a server, use actual dates and availability, and distinguish admission from food/drink minimums and fees. Keep provider credentials on the server.

## Check and build

```sh
npm test
npm run test:e2e
npm run build
npm run preview
```

Unit tests cover combined filters, keyword matching, numeric sorting, cross-city plans, data validity, and malformed storage recovery. Playwright tests exercise discovery, empty results, details, official links, persistent plans, dialogs, image loading, and overflow at desktop and mobile sizes.

Browser tests default to `/usr/bin/chromium` in the cloud environment. To use another installed Chromium binary:

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

The production build is written to `dist/` and can be deployed to a static website host. No deployment is configured by this repository.
