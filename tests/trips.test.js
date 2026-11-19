import test from "node:test";
import assert from "node:assert/strict";
import {
  trips,
  tripOrigins,
  travelBand,
  filterTrips,
  directionsUrl,
} from "../src/trips.js";
import { activities, filterActivities, readSaved } from "../src/catalog.js";

test("driving bands cover the 1-hour and 3-hour boundaries without overlap", () => {
  assert.equal(travelBand(59), "nearby");
  assert.equal(travelBand(60), "day");
  assert.equal(travelBand(180), "day");
  assert.equal(travelBand(181), "weekend");
  for (const origin of tripOrigins) {
    const all = filterTrips(trips, { origin });
    const groups = ["nearby", "day", "weekend"].flatMap((band) =>
      filterTrips(trips, { origin, band }),
    );
    assert.equal(new Set(groups.map((item) => item.id)).size, all.length);
    assert.equal(groups.length, all.length);
  }
});
test("starting city, activity type and drive range intersect", () => {
  const parks = filterTrips(trips, {
    origin: "Bakersfield",
    band: "day",
    type: "Theme parks",
  });
  assert.deepEqual(
    parks.map((item) => item.city),
    [
      "Six Flags Magic Mountain — Valencia",
      "Disneyland Resort — Anaheim",
      "Universal Studios Hollywood",
    ],
  );
  assert.equal(
    filterTrips(trips, {
      origin: "Bakersfield",
      band: "nearby",
      type: "Theme parks",
    }).length,
    0,
  );
  assert.ok(
    filterTrips(trips, { origin: "Austin", type: "Theme parks" }).every(
      (item) => item.origin === "Austin",
    ),
  );
  assert.equal(filterTrips(trips, { origin: "Unknown" }).length, 0);
});
test("trip records have valid costs, links and types, and can be saved without changing local activities", () => {
  assert.equal(new Set(trips.map((item) => item.id)).size, trips.length);
  for (const item of trips) {
    assert.ok(item.driveMinutes > 0);
    assert.ok(item.types.length);
    assert.ok(item.costLabel && item.timing && item.description);
    assert.ok(item.price === null || item.price >= 0);
    assert.equal(new URL(item.url).protocol, "https:");
    const directions = new URL(directionsUrl(item));
    assert.equal(directions.searchParams.get("origin"), `${item.origin}, USA`);
    assert.equal(directions.searchParams.get("destination"), item.city);
  }
  assert.deepEqual(
    readSaved({ getItem: () => JSON.stringify([trips[0].id]) }, [
      ...activities,
      ...trips,
    ]),
    [trips[0].id],
  );
  assert.equal(filterActivities(activities, { city: "Chicago" }).length, 6);
});
test("local activity types support outdoors, nightlife, date night, and no-match recovery", () => {
  assert.equal(filterActivities(activities, { type: "Outdoors" }).length, 2);
  assert.deepEqual(
    filterActivities(activities, { type: "Nightlife" }).map((item) => item.id),
    ["chicago-jazz"],
  );
  const dates = filterActivities(activities, {
    type: "Date night",
    budget: "25",
  });
  assert.deepEqual(
    dates.map((item) => item.id),
    ["chicago-jazz", "chicago-pizza"],
  );
  assert.equal(filterActivities(activities, { type: "Theme parks" }).length, 0);
});
