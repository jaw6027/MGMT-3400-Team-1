import test from "node:test";
import assert from "node:assert/strict";
import { activities, filterActivities } from "../src/catalog.js";
import { matchesActivityType } from "../src/activity-types.js";
import { demoProfiles, profilePreferences, saveFinderFeedback, FINDER_FEEDBACK_KEY } from "../src/finder.js";

const results = demoProfiles.map(profile => filterActivities(activities, profilePreferences(profile)));
for (const [index, profile] of demoProfiles.entries()) {
  test(`${profile.name} has nonempty relevant results from the normal filter`, () => {
    assert.ok(results[index].length > 0);
    for (const item of results[index]) {
      assert.equal(item.city, profile.city);
      assert.ok(matchesActivityType(item, profile.type));
      assert.ok(item.price !== null && item.price <= Number(profile.budget));
    }
  });
}
test("profiles have different results and manual preference changes affect matches", () => {
  assert.equal(new Set(results.map(items => JSON.stringify(items.map(item => item.id)))).size, 3);
  const prefs = profilePreferences(demoProfiles[0]);
  assert.notDeepEqual(filterActivities(activities, prefs), filterActivities(activities, { ...prefs, budget: "20" }));
  assert.notDeepEqual(filterActivities(activities, prefs), filterActivities(activities, { ...prefs, city: "Austin" }));
  assert.notDeepEqual(filterActivities(activities, prefs), filterActivities(activities, { ...prefs, type: "Nightlife" }));
});
test("feedback persists both ratings and snapshots without changing other browser storage", () => {
  const data = new Map([["alpas-plans", '["chicago-park"]']]);
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const preferences = profilePreferences(demoProfiles[0]);
  const resultIds = results[0].map(item => item.id);
  const entry = saveFinderFeedback(storage, { rating: "helpful", comment: "  Useful!  ", preferences, resultIds });
  preferences.city = "Austin";
  resultIds.length = 0;
  saveFinderFeedback(storage, { rating: "not-helpful", preferences, resultIds });
  const rows = JSON.parse(storage.getItem(FINDER_FEEDBACK_KEY));
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], entry);
  assert.equal(rows[0].preferences.city, "Chicago");
  assert.ok(rows[0].resultIds.length);
  assert.equal(rows[0].comment, "Useful!");
  assert.equal(rows[1].comment, "");
  assert.ok(Number.isFinite(Date.parse(rows[0].createdAt)));
  assert.equal(storage.getItem("alpas-plans"), '["chicago-park"]');
});
test("invalid feedback and unreadable or unavailable storage fail without replacing saved data", () => {
  const input = { rating: "helpful", preferences: profilePreferences(demoProfiles[0]), resultIds: [] };
  let writes = 0;
  for (const raw of ["broken", "{}", JSON.stringify(Array(1000).fill({}))]) {
    assert.throws(() => saveFinderFeedback({ getItem: () => raw, setItem: () => writes++ }, input));
  }
  const storage = { getItem: () => "[]", setItem: () => writes++ };
  assert.throws(() => saveFinderFeedback(storage, { ...input, rating: "other" }));
  assert.throws(() => saveFinderFeedback(storage, { ...input, comment: "x".repeat(1001) }));
  assert.equal(writes, 0);
  assert.throws(() => saveFinderFeedback({ getItem: () => "[]", setItem: () => { throw Error("full"); } }, input));
});
