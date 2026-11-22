import test from "node:test";
import assert from "node:assert/strict";
import {
  createSubmission,
  readSubmissions,
  storeSubmissions,
  validateSubmission,
} from "../src/submissions.js";
import { filterActivities, readSaved } from "../src/catalog.js";
const form = {
  title: "Local music night",
  venue: "Community hall",
  organizer: "Local collective",
  description: "An evening of local acoustic music.",
  city: "Bakersfield",
  category: "Music & nightlife",
  time: "Evening",
  startDate: "2027-12-10",
  endDate: "2027-12-11",
  url: "https://example.org/music",
  pricing: "paid",
  price: "12.50",
};

test("organizer event roundtrip preserves details and can be filtered and saved", () => {
  const item = createSubmission(form, "test-1");
  assert.equal(item.price, 12.5);
  assert.equal(item.season, "Winter");
  assert.equal(item.source, "organizer");
  let stored;
  const storage = {
    setItem: (_key, value) => {
      stored = value;
    },
    getItem: () => stored,
  };
  storeSubmissions(storage, [item]);
  assert.deepEqual(readSubmissions(storage), [item]);
  assert.deepEqual(
    filterActivities([item], {
      city: "Bakersfield",
      budget: "20",
      season: "Winter",
    }),
    [item],
  );
  assert.deepEqual(
    readSaved({ getItem: () => JSON.stringify([item.id]) }, [item]),
    [item.id],
  );
});
test("rejects unsafe links, unsupported cities, invalid dates and invalid prices", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://example.org",
    "https://user:password@example.org",
    "not a link",
  ])
    assert.throws(() => validateSubmission({ ...form, url }));
  for (const patch of [
    { title: "  " },
    { city: "Unknown" },
    { category: "All experiences" },
    { startDate: "2027-02-30" },
    { endDate: "2027-01-01" },
    { price: "" },
    { price: "-1" },
    { price: "NaN" },
    { price: "0.001" },
  ])
    assert.throws(() => validateSubmission({ ...form, ...patch }));
});
test("distinguishes unknown admission from free and handles damaged stored entries", () => {
  const free = createSubmission(
    { ...form, pricing: "free", endDate: "" },
    "free",
  );
  const unknown = createSubmission({ ...form, pricing: "unknown" }, "unknown");
  assert.equal(free.price, 0);
  assert.equal(unknown.price, null);
  assert.deepEqual(
    filterActivities([free, unknown], { city: "Bakersfield", budget: "0" }),
    [free],
  );
  assert.deepEqual(readSubmissions({ getItem: () => "{broken" }), []);
  assert.deepEqual(
    readSubmissions({
      getItem: () =>
        JSON.stringify([
          free,
          free,
          { ...free, id: '\" onclick=evil' },
          { ...unknown, url: "javascript:evil()" },
        ]),
    }),
    [free],
  );
  assert.throws(
    () =>
      storeSubmissions(
        {
          setItem() {
            throw new Error("quota");
          },
        },
        [free],
      ),
    /quota/,
  );
});

test("review lifecycle requires identity and reasons, persists history, and blocks invalid transitions", async () => {
  const { reviewSubmission, isPublicSubmission } = await import("../src/submissions.js");
  const pending = createSubmission(form, "review");
  const now = new Date("2027-01-01T12:00:00Z");
  assert.equal(pending.status, "pending");
  assert.equal(isPublicSubmission(pending), false);
  const input = { action: "approve", reviewer: "Member 1", reason: "Organizer confirmed details." };
  assert.throws(() => reviewSubmission(pending, [pending], { ...input, reviewer: " " }, now), /Reviewer name/);
  assert.throws(() => reviewSubmission(pending, [pending], { ...input, reason: " " }, now), /Review reason/);
  assert.throws(() => reviewSubmission(pending, [pending], { ...input, action: "cancel" }, now), /not allowed/);
  const approved = reviewSubmission(pending, [pending], input, now);
  assert.equal(isPublicSubmission(approved), true);
  const cancelled = reviewSubmission(approved, [approved], { action: "cancel", reviewer: "Member 2", reason: "Venue closed." }, now);
  assert.equal(cancelled.status, "cancelled");
  assert.equal(isPublicSubmission(cancelled), true);
  assert.deepEqual(cancelled.history.map(({ action, reviewer }) => [action, reviewer]), [["approve", "Member 1"], ["cancel", "Member 2"]]);
  assert.equal(cancelled.history[1].timestamp, now.toISOString());
  assert.throws(() => reviewSubmission(cancelled, [cancelled], input, now), /not allowed/);
  assert.deepEqual(readSubmissions({ getItem: () => JSON.stringify([cancelled]) }), [cancelled]);
  const rejected = reviewSubmission(pending, [pending], { ...input, action: "reject" }, now);
  assert.equal(isPublicSubmission(rejected), false);
  assert.throws(() => reviewSubmission(rejected, [rejected], input, now), /not allowed/);
});

test("duplicate checks normalize text and use inclusive date overlap; stale means end before today", async () => {
  const { submissionIssues } = await import("../src/submissions.js");
  const item = createSubmission(form, "first");
  const duplicate = createSubmission({ ...form, title: " LOCAL   MUSIC NIGHT ", venue: " COMMUNITY HALL ", startDate: "2027-12-11", endDate: "2027-12-12" }, "second");
  const issues = submissionIssues(item, [item, duplicate], "2027-12-11");
  assert.deepEqual(issues.map(({ key }) => key), ["duplicate:organizer-second"]);
  assert.equal(submissionIssues(item, [item, { ...duplicate, city: "Austin" }], "2027-12-11").length, 0);
  assert.equal(submissionIssues(item, [item, { ...duplicate, venue: "Other hall" }], "2027-12-11").length, 0);
  assert.equal(submissionIssues(item, [item, { ...duplicate, startDate: "2027-12-12" }], "2027-12-11").length, 0);
  assert.deepEqual(submissionIssues(item, [item, { ...duplicate, status: "rejected" }], "2027-12-12").map(({ key }) => key), ["stale"]);
  assert.equal(submissionIssues(item, [{ ...duplicate, startDate: undefined, endDate: undefined }], "2027-12-11").length, 0);
});

test("all current flags need explicit resolution with reasons; rejection does not", async () => {
  const { submissionIssues, reviewSubmission } = await import("../src/submissions.js");
  const item = createSubmission(form, "flagged");
  const other = createSubmission(form, "other");
  const items = [item, other];
  const now = new Date("2028-01-01T12:00:00Z");
  const input = { action: "approve", reviewer: "Reviewer", reason: "Checked." };
  assert.throws(() => reviewSubmission(item, items, input, now), /Explicitly resolve/);
  const resolutions = submissionIssues(item, items, "2028-01-01").map(({ key }) => ({ key, resolved: true, reason: "Checked with organizer; historical listing / separate session confirmed." }));
  assert.throws(() => reviewSubmission(item, items, { ...input, resolutions: resolutions.slice(0, 1) }, now), /Explicitly resolve/);
  assert.throws(() => reviewSubmission(item, items, { ...input, resolutions: resolutions.map((r) => ({ ...r, reason: " " })) }, now), /Resolution reason/);
  const approved = reviewSubmission(item, items, { ...input, resolutions }, now);
  assert.equal(approved.history[0].resolutions.length, 2);
  assert.deepEqual(readSubmissions({ getItem: () => JSON.stringify([approved]) }), [approved]);
  assert.equal(reviewSubmission(item, items, { ...input, action: "reject" }, now).status, "rejected");
});

test("legacy records become pending; a stored status cannot bypass a missing or malformed history", () => {
  const item = createSubmission(form, "legacy");
  const { status, history, ...legacy } = item;
  assert.deepEqual(readSubmissions({ getItem: () => JSON.stringify([legacy]) }), [item]);
  assert.equal(readSubmissions({ getItem: () => JSON.stringify([{ ...item, status: "approved" }]) })[0].status, "pending");
  assert.deepEqual(readSubmissions({ getItem: () => JSON.stringify([{ ...item, history: [{ action: "cancel", status: "cancelled", timestamp: "invalid" }] }]) }), []);
});
