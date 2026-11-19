# Alpas customer research database

This SQLite database stores anonymous customer research based on the proposed Alpas survey. No real customer information has been supplied. The actual database starts empty. Three invented responses are available in a **separate fictional demo database** and must never be presented as research findings.

This is a local research tool, not a shared backend. It does not create accounts, track visitors, collect survey answers automatically, or change the browser-only Audience insights feature. Database commands require **Node.js 24+** for its built-in SQLite module; the existing web app retains its documented Node requirements. No database server, extra packages, or credentials are required.

## Create and inspect

From `/workspace/MGMT-3400-Team-1`:

```sh
npm run db:init
npm run db:demo
npm run db:report
npm run db:report -- demo
npm run db:test
```

`db:init` creates `local-data/alpas-customers.sqlite` and can be rerun without erasing records. `db:demo` creates `local-data/alpas-fictional-demo.sqlite` and refuses to overwrite an existing file. `db:report` reads the customer database, grouping results by source to keep demo imports separate from actual survey responses. Open either file in a SQLite viewer such as DB Browser for SQLite to browse tables or run SQL. Database files and survey exports belong in ignored `local-data/`, outside the public website and Git history. Only the schema, tools, and fictional fixtures are committed. Keep backups securely if collecting real responses.

## What it stores

| Table | Purpose |
| --- | --- |
| `profiles` | Random profile ID, optional broad age range, life stage, local/visitor status, source, and database recording time |
| `survey_responses` | Profile link, discovery frequency, likelihood of trying Alpas, activity budget, optional recent-outing description and must-have feature |
| `selection_options` | Allowed answers for the five multi-select survey questions |
| `response_selections` | Discovery channels, planning difficulties, requested features, activity interests, and barriers selected for each response |
| `completed_imports` | Batch fingerprint and count to prevent importing the exact same batch twice |

The questions match the survey discussed in this project. Age ranges are Under 18, 18–24, 25–34, 35–44, 45–54, 55+, and Prefer not to say. Life stages are Student, Working, Student and working, Retired, Other, and Prefer not to say. Residency accepts Local resident, Visitor, Student living here temporarily, Neither, or Prefer not to say. Missing demographic answers default to Prefer not to say; other unanswered questions are null or have no selections. Names, emails, exact birth dates, gender, income, and precise addresses are not collected. Keep identifying information out of free-text responses as well.

Recording time means when a response was imported, not when someone originally answered. A generated profile represents a response record, not a verified unique customer; repeats can occur. Demographic reports count profiles and include undisclosed answers in their denominator. Requested-feature reports count selections; percentages across multi-select options need not total 100%. Small voluntary samples measure interest rather than proven usage or representative market demand.

## Import actual survey results

Prepare a JSON array of response objects in `local-data/survey.json`, using these keys:

| Key | Answer |
| --- | --- |
| `age`, `stage`, `location` | Demographic categories described above |
| `frequency` | Several times a week; About once a week; A few times a month; Once a month or less; Never |
| `likelihood` | Very likely; Somewhat likely; Neither likely nor unlikely; Somewhat unlikely; Very unlikely |
| `budget` | Free activities only; Under $20; $20–$39; $40–$59; $60 or more; It depends / not sure |
| `recentOuting`, `mustHave` | Optional text, up to 1,500 characters each |
| `selections` | Object with arrays under `discovery_channel`, `planning_difficulty`, `desired_feature`, `activity_interest`, and/or `barrier` |

Use exact selection labels from `options.js`. Omit unanswered fields. The shape is illustrated in `fictional-responses.json`; those records are invented, so do not import them as actual survey answers. Form-provider CSV exports require conversion to this shape; there is no direct Google Forms connection.

```sh
npm run db:survey -- local-data/survey.json
npm run db:report
```

Each import is atomic: an invalid row rolls back the entire batch. Exact duplicate batches are rejected. Import only newly received responses on subsequent runs; overlapping batches cannot be reliably deduplicated because no personal identity is collected. Each batch supports up to 1,000 responses.

## Import the browser demo

On the Alpas page, open browser developer tools and run the following to download a copy of the browser-only survey responses. This only reads the existing storage; it does not clear it or contact a server.

```js
const data = localStorage.getItem('alpas-audience-responses') || '[]';
const url = URL.createObjectURL(new Blob([data], {type: 'application/json'}));
const link = document.createElement('a');
link.href = url;
link.download = 'alpas-audience.json';
link.click();
setTimeout(() => URL.revokeObjectURL(url), 1000);
```

Transfer the downloaded file to `local-data/`, then:

```sh
npm run db:import -- local-data/alpas-audience.json
```

Imports are labeled `browser-demo`; they are not counted as real survey responses. Exporting again after more submissions includes old responses too, so import only new rows to avoid repeats.

## Useful SQL

```sql
-- Largest age groups among actual survey records only.
SELECT * FROM age_summary WHERE source = 'survey' ORDER BY profile_count DESC;

-- Most requested features among actual survey responses.
SELECT * FROM feature_requests WHERE source = 'survey' ORDER BY response_count DESC;

-- Stated interest by age; unanswered likelihood questions are excluded.
SELECT * FROM interest_by_age WHERE source = 'survey';
```

Use the same views with `source = 'fictional-demo'` in the fictional database to demonstrate reporting. To delete a respondent's profile and associated answers, enable `PRAGMA foreign_keys = ON` on that connection and delete the profile by its exact ID. Cascading deletion removes linked responses and selections. The Node tools enable foreign keys automatically. Never expose these files through a static host or commit collected responses to GitHub.
