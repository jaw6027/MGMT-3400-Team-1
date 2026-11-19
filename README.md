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
- Keyword search plus category, activity-type, budget, time-of-day, and season filters
- Nearby trips from Bakersfield, Chicago, New York, and Austin, filtered by driving time and activity type
- Save trip ideas alongside local experiences in My plans
- Bakersfield restaurants, inexpensive outings, concert calendar links, and seasonal event ideas
- Organizer event form with dates, venue, category, price, description, and an HTTPS website
- Organizer submissions appear immediately and persist in the same browser; this is not public publishing
- Price sorting, activity details, and official venue website links
- Saved plans across cities, persisted in browser local storage
- Estimated per-person plan total and responsive layouts
- Keyboard-accessible modal dialogs and announced result counts

## Nearby trips and activity types

Choose **Nearby trips** in the header or **Find a nearby trip** below the city listings. Select a starting city, then combine a driving-time range with an activity type: Outdoors, Theme parks, Nightlife, Date night, Arts & culture, or Sightseeing. The starting city is selected manually; the app does not request your device location. These are curated route ideas, not a general routing engine.

The ranges are **under 60 minutes**, **60–180 minutes inclusive**, and **over 180 minutes**. Driving times are rough one-way estimates from the central starting city to the named destination. They exclude stops and are not calculated from live traffic or a maps API. The starting city stays attached to a saved trip, so changing origins does not change an existing plan. Destination details include seasonal notes, the official website, and an external Google Maps route link to check the actual drive.

Trip costs refer to the described activity, not the entire getaway. Free walking ideas can still involve transport, parking, meals, or lodging costs. Vehicle-based national park fees are left unknown (`price: null`) rather than incorrectly divided into a per-person price. My plans flags unknown prices and explains excluded travel costs. Verify current fees, reservations, seasonal access, and road conditions on the linked official sites.

Edit `src/trips.js` to maintain curated destinations, origins, drive estimates, and type tags. Local experiences also have an **Activity type** selector, which combines with existing filters. Tags may overlap: a waterfront walk can be both Outdoors and Date night. Existing activity categories provide default type tags; entries can set `types` explicitly. If a city has no matching theme parks, the empty state offers Nearby trips.

## Audience insights demo

Choose **Audience insights** in the footer for an optional survey and response dashboard. Broad age ranges, life stage, and local/visitor status are stored under `alpas-audience-responses` in this browser only. No answers are sent to a server; names, dates of birth, emails, and precise locations are not requested. Each question offers Prefer not to say; closing the dialog skips the survey. At least one answer is needed to add a response. The dashboard shows counts and percentages for each category, including undisclosed answers in the denominator, with no automatic tracking.

Each submission counts as a response, including repeat submissions. Results measure this browser's voluntary demo responses, not unique users or app-wide popularity. There is no seeded audience data. Use **Delete demo responses** to remove the survey data without deleting plans or organizer events. Up to 1,000 responses are supported; storage failures keep answers available for retry. Shared analytics would require a backend and a separate implementation.

## Listing data limits

This is an initial prototype using **sample listings and estimated USD prices**, not live events, availability, or verified current pricing. Links lead to official websites for confirmation and booking. Opening hours, age policies, reservations, and extra purchases can vary. Saves are local to one browser; there is no account, server, payment flow, or cloud synchronization.

Edit the curated data in `src/catalog.js`. Each activity has a stable ID, city, title, venue, category, estimated price (or `null` when unknown), time of day, duration, illustration, description, and official URL. Optional `season` and `timing` fields describe typical seasonal availability. Kern County Fair and Village Fest are fall ideas; CALM HolidayLights and the Christmas Parade are winter ideas. These timeframes do not confirm upcoming dates. Haggin Oaks is labeled as a recurring market, not a once-a-year event. Unknown prices are excluded from budget filters, sorted after known prices, and flagged separately in plan totals. Before production, connect a licensed event provider through a server, use actual dates and availability, and distinguish admission from food/drink minimums and fees. Keep provider credentials on the server.

## Organizer submissions

Choose **Add an event** in the header. Complete the event information, choose Free/Paid/Check organizer, and submit using **Add to this browser**. The listing becomes searchable and can be saved to My plans, including after a refresh. Enter actual start/end dates and use the description for exact times, timezone, ticket conditions, and age restrictions. The season filter uses the start date for organizer entries. Past dates are allowed; the app does not claim the submissions are upcoming or verified.

Submissions are stored under `alpas-organizer-events` in local storage, separate from `alpas-plans`. They remain on this browser only and disappear when its site data is cleared. Storage failures retain the form and show an error. Submitted text is rendered as text; website URLs must use HTTPS without embedded credentials. Stored entries are validated again when loaded. No account authentication or public publishing is implemented. Public organizer publishing requires a shared backend, organizer accounts, and a review/moderation workflow in a separate implementation.

## Check and build

```sh
npm test
npm run test:e2e
npm run build
npm run preview
```

Unit tests cover combined filters, seasonal discovery, unknown prices, sorting, saved plans, malformed storage, and organizer input validation and persistence. Playwright tests exercise discovery, seasonal and free options, official links, persistent plans, keyboard dialogs, organizer submission and reload, literal rendering of submitted markup, and storage failures on desktop and mobile.

Browser tests default to `/usr/bin/chromium` in the cloud environment. To use another installed Chromium binary:

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

The production build is written to `dist/` and can be deployed to a static website host. No deployment is configured by this repository.

For annual-event research examples and official calendar links, see [California event references](docs/california-event-reference.md). These references are not verified upcoming events or a popularity ranking.
