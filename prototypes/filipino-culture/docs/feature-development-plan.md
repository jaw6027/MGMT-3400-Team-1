# Alpas feature development plan

## Goal and source

Help people find an activity quickly and spend more time experiencing their community. The supplied screenshot suggests a **product test dashboard** that tracks feature requests, release checklists, and calendar/filter test cases, with sample events and expected results for location, date, and price filters. Those suggestions are source material for this plan, separate from the user's request to develop Alpas features.

The local prototype implements a first version of discovery and the dashboard. It builds on `event-collection-plan.md`, which remains the team's plan for acquiring and verifying real event records. All prototype event records are fictional.

## Priorities and acceptance criteria

P0 means needed for the discovery demo; P1 means next toward a usable pilot; P2 means later enhancement. These priorities are proposals for the group.

| Feature | Priority | Implemented prototype behavior | Acceptance criterion |
| --- | --- | --- | --- |
| Monthly discovery calendar | P0 | Browse months, select a date, or view a whole month; dots reflect other active filters | Selecting a date returns only matching occurrences on that Pacific date, including overnight continuations |
| Location selector | P0 | Bakersfield, Orange County, Fresno, Visalia; match city or region | Changing to Orange County includes Santa Ana and Huntington Beach fixtures, with each actual city displayed |
| Price filter | P0 | Maximum admission price, including zero for free | Include price equal to the ceiling; exclude unknown prices when a ceiling is selected |
| Age, time, interest, mood | P0 | Single selection per filter, combined with AND | An 18+ dancing search starting at/after 7 PM returns B03 in Bakersfield on Nov 28 |
| Event details | P0 | Date range, Pacific times, venue/city, price, age, status, and mood | Card and detail values agree; overnight details show both dates; fictional status is clear |
| Product test dashboard | P0 | Shared-engine test runner with expected/actual IDs; feature requests; manual release checklist | All 15 dashboard scenarios pass; request/checklist updates persist locally when storage is available |
| Listing verification | P1 | Approved/status fields demonstrate exclusion of unreviewed and canceled fixtures; no review interface | Production: record source, reviewer, last checked date, duplicate resolution, and an audit trail before publication |
| Save and share events | P1 | Backlog | Save/remove an event and share a stable detail URL; no duplicate saved entries |
| Reminders and changes | P1 | Backlog | Send opted-in reminders in the event's time zone; confirmed cancellations notify affected users |
| Travel and distance search | P1 | Manual region switching only | Production: preserve venue city; allow destination/radius search without requiring device location |
| Organizer and partner tools | P2 | Backlog | Authenticate submitters, review event changes, and provide verified outbound booking links |
| Paid promotion | P2 | Two fictional sponsored cards appear first among matches and carry labels | Sponsored results satisfy every active filter and cannot bypass listing review |

## Filter contract

- Use America/Los_Angeles for the pilot; production event records must retain their own IANA time zone.
- A date includes events that overlap that local calendar day. End timestamps are exclusive, so an event ending at midnight does not occupy the next day.
- The calendar dots count matches for the displayed month using all filters except the selected date. Event counts and results update together.
- “18+ only” selects an event whose minimum admission age is exactly 18. “21+ only” selects a minimum age of 21. An 18+ event is also available to an older attendee, but this control selects the listing restriction, not the attendee's age. Unknown restrictions never match a specific restriction.
- “Starts at or after” compares the original start time, inclusively. A 10 PM event continuing after midnight still meets that start-time filter on the second day. A future “happening after” filter would require different overlap logic.
- Blank price means any price, including unknown. Zero means known free admission. Demo prices are single admission amounts in USD; production must show ranges and known fees rather than imply an all-in price.
- All selected filter dimensions are combined with AND. A mood can match any mood tag on an event. This version supports one selected mood and one selected interest.
- Canceled, postponed, and unapproved events are excluded from discovery. Sold-out events remain visible with a label. A saved-event system should retain cancellation notices rather than silently remove saved events.
- Sponsored placement is applied after filtering. Remaining order is start timestamp, then ID. Production ranking should add promotion dates and an explicit relevance policy.

## Test data and expected results

All dates below are in 2026 and times are Pacific. IDs are stable fixture identifiers in `engine.js`.

| Scenario | Filters | Expected IDs |
| --- | --- | --- |
| Location and date | Bakersfield, Nov 28 | B01, B02, B03, B04, B06 |
| Region change | Orange County, Nov 28 | O01, O02 |
| Date change | Bakersfield, Nov 29 | B04, B05, B10 |
| Free only | Bakersfield, Nov 28, max $0 | B01 |
| Inclusive price boundary | Bakersfield, Nov 28, max $15 | B01, B03 |
| Combined evening outing | Bakersfield, Nov 28, 18+, Dancing, starts ≥7 PM | B03 |
| 21+ restriction | Bakersfield, Nov 28, 21+ | B04 |
| Free family outing | Bakersfield, Nov 29, all ages, Family time, max $0 | B05 |
| Interest | Bakersfield, Nov 28, Arts | B02 |
| Overnight continuation | Bakersfield, Nov 29, Dancing | B04 |
| Empty state | Visalia, Nov 28 | None |
| Month boundary | Bakersfield, December | B09 |
| Fresno coverage | Fresno, Nov 28 | F01 |
| Visalia coverage | Visalia, Nov 29 | V01, V02 |
| Promotion respects price | Bakersfield, Nov 28, Dancing, max $0 | None |

The Node suite adds midnight exclusion, canceled/unapproved visibility, unknown-age exclusion, sponsored order/uniqueness, start-time semantics, and checks across computer time zones. Expected IDs are hand-specified, not generated by the filter being tested. The dashboard tests exercise the shared search engine; manual browser testing is still required for UI wiring and accessibility.

## Group workflow

1. Discuss a request and add a short title with a priority. Use P0 for demo blockers, P1 for pilot requirements, P2 for later ideas.
2. Assign a teammate and acceptance criterion in the team's shared tracker. The local dashboard does not yet store owners or synchronize edits.
3. Move the request from Backlog to In progress, then Prototype ready when it can be demonstrated.
4. Compare actual and expected results, review the UI, and move to Validated only after the team checks it.
5. Before presenting, run automated scenarios and complete the manual release checklist. Neither test scores nor checkmarks certify production readiness.

Suggested responsibilities are discovery/UI, data verification, quality/testing, and organizer/business development; the group can combine roles. A shared backend with authentication and permissions is the next step before using the dashboard collaboratively.

## Proposed development sequence

1. **Class demo:** review this prototype, confirm the filter contract, add representative fixtures, and run the release checklist.
2. **Pilot data:** implement the verification workflow from the existing collection plan; import 40–60 verified records with sources and expiry handling.
3. **Shared pilot:** move events, feature requests, and checks into a database; add team accounts, review permissions, validation, and backups.
4. **User value:** add saved events, stable event URLs, opt-in reminders, and confirmed event-change notices.
5. **Revenue experiments:** validate partner interest and build disclosed promotion campaigns that respect user filters. Ticketing integrations and named partnerships remain proposals until agreements exist.

Before a public pilot, verify real booking destinations, keyboard/screen-reader behavior, narrow-screen layouts, source freshness, and persistent shared data. The prototype demonstrates product behavior rather than a production service.

## Filipino cultural redesign

The app's cultural identity now shapes discovery collections and event context alongside its calendar. These collections welcome people of all backgrounds. They are navigation choices, not labels applied to users.

| Collection name with English underneath | Feature and example | Status |
| --- | --- | --- |
| Kain Tayo<br>Let’s eat | Shared meals and food markets; distinguish free entry from food costs | Working collection filter |
| Barkada<br>Circle of friends | Social outings, contemporary Filipino music, and outdoor meetups | Working collection filter; group invitations remain backlog |
| Pamilya<br>Family | Activities across generations, family crafts, and community picnics | Working collection filter; admission restrictions remain separate |
| Likha<br>Creation | Filipino American artists, workshops, storytelling, and songwriting | Working collection filter |
| Bayanihan<br>Community cooperation | Volunteer opportunities and neighborhood care | Working collection filter with Visalia care-day fixture |

Every authored Tagalog term visible in the interface has English directly beneath it, including repeated terms in titles and descriptions. The shared display glossary also explains food names and the star lantern craft. Authored new terms should be added to the glossary before release. User-entered terms outside the glossary are not automatically translated.

Brand and navigation copy use the same treatment:

- Alpas<br>Break free
- Tara<br>Let’s go
- Tuklas<br>Discovery
- Sama-sama<br>Together
- Kalendaryo<br>Calendar

Fictional event details introduce the host, list program languages, and give context about the activity. Contemporary creativity and community service appear alongside seasonal crafts and food gatherings. Tagalog does not represent all Philippine languages; regional-language support remains a proposed addition. Organizers should describe their own practices and teaching support.

The visual design uses warm cream, deep blue, gold, terracotta, and an original geometric weave. It does not claim to reproduce a named traditional textile. Cultural identity is also expressed through people gathering, sharing food, making art, and helping neighbors.

The dashboard includes cultural feature requests and a manual translation-placement check. Its 19 automated scenarios include collection filtering with location, date, price, and age. Node tests additionally check glossary consistency, stacked translation markup, escaping of user text, and host/context metadata. Visual layout and translations still need group review in a browser before presentation.
