# Alpas

Customer research tools: see [the SQLite database guide](database/README.md) for anonymous survey storage, demographic reports, and browser-demo imports. These tools run locally and do not change the app's browser-only storage.

Find your kind of fun, wherever you are. Alpas helps travelers and locals discover activities, compare estimated prices, follow official venue links, and keep ideas together in a saved plan.

## Recorded demo

[Watch the 21-second Alpas walkthrough](docs/demos/alpas-demo.mp4): browse Bakersfield activities, filter nearby theme parks by driving time, save a trip to My plans, and open the organizer event form. The recording uses the prototype’s sample listings and estimated travel times.

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
- Organizer submissions enter a Pending queue; Team Review approves or rejects them before they appear in Explore
- Duplicate/stale-date warnings, named review decisions, and persistent cancellation history (browser-only prototype)
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

Choose **Add an event** in the header. The existing form collects event details, dates, price, description, and an HTTPS organizer website. **Submit for review** saves the event as **Pending**, hidden from Explore and My plans until approved. New submissions do not publish automatically.

Open **Team Review** in the footer to see pending submissions first, followed by reviewed events. Reviewers must enter their name and a reason for every approval, rejection, or cancellation. Pending events can be approved or rejected; approved events can be cancelled. Rejected and cancelled decisions are final in this small prototype; submit a new event for a corrected listing.

Possible duplicates match title, city, and venue after case/whitespace normalization, with inclusive overlapping start/end dates. Rejected records are excluded from duplicate checks. Undated curated attractions are not treated as dated duplicates. Stale warnings apply when the end date is before today's date in the browser's local calendar; ongoing events and events ending today are not stale. These checks run when the queue opens and again when approval is attempted. Warnings require an explicit resolution checkbox and a resolution reason for each issue before approval. A legitimate separate occurrence or intentionally retained historical listing can be approved with a documented explanation; otherwise reject it. Resolving a warning records the reviewer's explanation, rather than changing event dates automatically.

Approved events appear in the normal Explore results and can be filtered or saved as before. **Mark Cancelled** keeps an event visible with a **Cancelled · no longer available** warning in Explore, details, and saved plans. Its booking link is unavailable and its price is excluded from saved-plan totals. Verification history records reviewer name, timestamp, action, reason, and approval-warning resolutions; it is visible in Team Review and event details and survives reload.

### Professor's acceptance walkthrough

1. Submit a uniquely titled event with a future start/end date using **Add an event → Submit for review**. Select its city and search for its title: it must not appear yet.
2. Open **Team Review** in the footer. Confirm **Pending**. Enter a reviewer name and reason, resolve any warnings explicitly, then choose **Approve**.
3. Close the dialog. Find the event in Explore, open its details, and save it to **My plans**.
4. Reopen **Team Review**, find the approved event, enter the cancellation verifier's name and reason, then choose **Mark Cancelled**.
5. Close the dialog. Confirm the cancellation label in Explore and My plans. Open details to see who verified the cancellation, when, and why.
6. Reload. Confirm the cancelled listing and both review decisions remain in details and Team Review's **Verification history**.

For warning checks, submit two events with matching title/city/venue and overlapping dates, or submit a past event. Approval must fail until every displayed warning is explicitly resolved with a reason. Rejection does not require resolving a warning.

### Prototype storage and limits

All organizer records and verification history remain under `alpas-organizer-events` in this browser, separate from `alpas-plans` and audience surveys. Existing submissions created before the queue was added become Pending without invented approval history. They remain stored, including saved-plan references, but are hidden until reviewed. Reloads preserve valid review history. Storage failures leave the form available for retry and do not apply the decision.

This is a class demonstration of a publication workflow, not shared public publishing. Reviewer names are self-reported; anyone using the browser can review, and browser storage can be edited or cleared. There is no authentication, protected audit log, cross-device database, automatic cancellation feed, or live multi-tab synchronization. Refresh other tabs to see saved decisions; simultaneous writes are not transactional. Static sample attractions remain a separate curated collection, not verified organizer events. Public multi-user operation would require a shared backend and authenticated reviewer permissions.

Submitted text is rendered as text; website URLs must use HTTPS without embedded credentials. Organizer dates are real input dates, whereas curated seasonal listings retain their existing typical-season labels. The organizer form, listing filters, Nearby trips, My plans, and Audience insights remain in the same app.

## Check and build

```sh
npm test
npm run test:e2e
npm run build
npm run preview
```

Unit tests cover combined filters, seasonal discovery, unknown prices, sorting, saved plans, malformed storage, and organizer input validation and persistence. Playwright tests exercise discovery, seasonal and free options, official links, persistent plans, keyboard dialogs, pending submission, approval, cancellation and reload, warning resolutions, rejection, literal rendering of submitted markup, and storage failures on desktop and mobile.

Browser tests default to `/usr/bin/chromium` in the cloud environment. To use another installed Chromium binary:

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

The production build is written to `dist/` and can be deployed to a static website host. No deployment is configured by this repository.

For annual-event research examples and official calendar links, see [California event references](docs/california-event-reference.md). These references are not verified upcoming events or a popularity ranking.
