# Alpas prototype

This chat's completed Filipino-culture prototype lives in `prototypes/filipino-culture/`, independently of the repository's existing application. Its HTML, styles, scripts, sample events, tests, and documentation are kept together here. The repository's root app and documentation are preserved.

A local class prototype of Alpas discovery and a product test dashboard, based on the screenshot's suggestions to track feature requests, release checklists, and calendar/filter test cases.

## Open the prototype

Open `index.html` in a modern browser. No install or account is required. The interface uses optional Google Fonts and falls back to system fonts offline. All app logic and fictional sample events are local.

The demo starts in **November 2026**, where its sample events are concentrated on **November 28–30**, with one overnight event continuing into December 1. Reset returns to the sample month. Previous/next month controls let you inspect other months.

## Try a group demonstration

1. Choose Bakersfield and November 28: five events match.
2. Set a maximum price of 0: only the free market remains.
3. Reset, choose November 28, select admission 18+, mood Dancing, and starts at/after 7 PM: only the Filipino pop dance social remains.
4. Change to Orange County with those filters: the Santa Ana dance social appears.
5. Reset, choose November 29, and open the 21+ after-dark event to see its overnight schedule.
6. Open Team dashboard, add a request, change its status, and tick a manual check.
7. Select Run tests: the 19 expected-result scenarios should pass.
8. Choose the shared-meals collection and set maximum price to zero: the food market has free admission, with food purchases clearly separate.
9. Choose Visalia, November 29, and the community-cooperation collection: the neighborhood care day appears.

## Filipino culture and bilingual copy

The redesign includes five cultural discovery collections: shared meals, friends' outings, family activities, creativity, and community cooperation. Each Tagalog collection name has an English translation directly below it. The same stacked translation treatment appears in navigation, the brand, event titles, descriptions, and seeded team requests. `bilingual.js` supplies the common glossary and escapes text before rendering it.

Warm cream, deep blue, terracotta, and gold accompany an original geometric weave graphic. The motif does not reproduce or claim to represent a specific regional textile. Fictional event details identify hosts, program languages, and cultural context. Production organizers should provide and review that context; the sample language labels do not imply interpretation services.

Requests and manual checklist selections persist in browser local storage when available. Browser storage is not shared between teammates; file-based storage behavior varies by browser. Automated results apply to this session and do not check off manual review items.

## Verify the shared search logic

With Node.js 18 or later:

```powershell
cd prototypes/filipino-culture
node --test tests/engine.test.cjs
```

Run these commands from the repository root, or run only the `node` command if already in this prototype folder. Its own package configuration keeps these tests independent of the parent application's module settings.

The Node tests use the same engine as the prototype and include additional boundary and time-zone checks. No packages are required. See `docs/feature-development-plan.md` for priorities, acceptance rules, and production follow-up work.

## Files

- `index.html`: discovery and team dashboard screens.
- `styles.css`: responsive styling.
- `app.js`: UI interactions and local request/checklist storage.
- `engine.js`: fictional fixtures, shared filters, and dashboard test scenarios.
- `bilingual.js`: shared Tagalog-to-English display glossary.
- `tests/engine.test.cjs`: automated engine checks.

This prototype has no production database, accounts, verified live events, organizer tools, notifications, or ticket transactions. Existing references to ticketing and venue partners describe potential future relationships.
