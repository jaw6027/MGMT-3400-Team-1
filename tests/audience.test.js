import { test } from "node:test";
import assert from "node:assert/strict";
import { AUDIENCE_KEY, readAudience, saveAudience, summarizeAudience, validateResponse } from "../src/audience.js";

const row = { age: "18–24", stage: "Student", location: "Local resident" };
test("audience responses validate categories and discard identifying extra fields", () => {
  assert.deepEqual(validateResponse({ ...row, name: "Ignore me" }), row);
  assert.throws(() => validateResponse({ ...row, age: "<script>" }));
  assert.throws(() => validateResponse({ age: "Prefer not to say", stage: "Prefer not to say", location: "Prefer not to say" }));
});
test("summary counts responses, ties and unanswered categories with the full denominator", () => {
  const rows = [row, { ...row, age: "25–34" }, { ...row, age: "Prefer not to say" }];
  const summary = summarizeAudience(rows, "age");
  assert.deepEqual(summary.find(item => item.label === "18–24"), { label: "18–24", count: 1, percent: 33 });
  assert.equal(summary.find(item => item.label === "Prefer not to say").count, 1);
  assert.ok(summarizeAudience([], "age").every(item => item.count === 0 && item.percent === 0));
});
test("storage roundtrips, rejects damaged data and propagates storage failures", () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  assert.deepEqual(readAudience(storage), []);
  saveAudience(storage, [row]);
  assert.deepEqual(readAudience(storage), [row]);
  data.set(AUDIENCE_KEY, '[{"age":"invalid"}]');
  assert.throws(() => readAudience(storage));
  data.set(AUDIENCE_KEY, "not json");
  assert.throws(() => readAudience(storage));
  assert.throws(() => saveAudience(storage, Array(1001).fill(row)));
  assert.throws(() => saveAudience({ setItem() { throw Error("Full"); } }, [row]), /Full/);
});
