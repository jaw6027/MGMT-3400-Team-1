import test from "node:test";
import assert from "node:assert/strict";
import { activities, filterActivities, readSaved } from "../src/catalog.js";

test("city, category, budget and time filters intersect", () => {
  const result = filterActivities(activities, {
    city: "Chicago",
    category: "Outdoors",
    budget: "0",
    time: "Daytime",
  });
  assert.deepEqual(
    result.map((a) => a.id),
    ["chicago-park"],
  );
  assert.equal(
    filterActivities(activities, {
      city: "Chicago",
      category: "Outdoors",
      time: "Evening",
    }).length,
    0,
  );
});
test("search matches words across title, venue and description without case sensitivity", () => {
  assert.deepEqual(
    filterActivities(activities, { query: "  CHICAGO river  " }).map(
      (a) => a.id,
    ),
    ["chicago-river"],
  );
  assert.equal(filterActivities(activities, { query: "<script>" }).length, 0);
});
test("saved plans span cities and sort numerically without mutating catalog", () => {
  const original = activities.map((a) => a.id);
  const result = filterActivities(activities, {
    city: "",
    saved: ["nyc-art", "chicago-park", "austin-garden"],
    sort: "price-low",
  });
  assert.deepEqual(
    result.map((a) => a.price),
    [0, 8, 30],
  );
  assert.deepEqual(
    activities.map((a) => a.id),
    original,
  );
});
test("storage recovers from corrupt, invalid and inaccessible values", () => {
  for (const value of ["invalid", "null", "{}", "2"])
    assert.deepEqual(readSaved({ getItem: () => value }), []);
  assert.deepEqual(
    readSaved({
      getItem() {
        throw new Error("blocked");
      },
    }),
    [],
  );
  assert.deepEqual(
    readSaved({ getItem: () => '["chicago-park","unknown","chicago-park",4]' }),
    ["chicago-park"],
  );
});
test("catalog has unique IDs, supported image names, valid prices and official HTTPS links", () => {
  assert.equal(new Set(activities.map((a) => a.id)).size, activities.length);
  for (const activity of activities) {
    assert.ok(Number.isFinite(activity.price) && activity.price >= 0);
    assert.equal(new URL(activity.url).protocol, "https:");
    assert.ok(
      ["river", "garden", "jazz", "art", "park", "food"].includes(
        activity.image,
      ),
    );
  }
});
