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
