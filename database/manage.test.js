import { test } from "node:test";
import assert from "node:assert/strict";
import { openDatabase, addResponse, importAudience, importResponses } from "./manage.js";

const row = { age: "18–24", stage: "Student", location: "Local resident" };
test("database reports separate survey and fictional responses, with foreign key cleanup", () => {
  const db = openDatabase(":memory:");
  try {
    const { profileId } = addResponse(db, { ...row, likelihood: "Very likely", selections: { desired_feature: ["Saved plans"] } });
    addResponse(db, row, "fictional-demo");
    addResponse(db, { ...row, age: "25–34" });
    const age = db.prepare("SELECT * FROM age_summary WHERE source = 'survey' AND age_range = ?").get(row.age);
    assert.equal(age.profile_count, 1);
    assert.equal(age.percent, 50);
    assert.equal(db.prepare("SELECT response_count FROM interest_by_age WHERE source = 'survey'").get().response_count, 1);
    assert.equal(db.prepare("SELECT response_count FROM feature_requests WHERE source = 'survey'").get().response_count, 1);
    db.prepare("DELETE FROM profiles WHERE id = ?").run(profileId);
    assert.equal(db.prepare("SELECT count(*) AS n FROM response_selections").get().n, 0);
    assert.equal(db.prepare("SELECT count(*) AS n FROM survey_responses").get().n, 2);
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  } finally { db.close(); }
});

test("invalid answers and invalid multi-select combinations cannot leave partial profiles", () => {
  const db = openDatabase(":memory:");
  try {
    assert.throws(() => addResponse(db, { ...row, age: "invalid" }));
    assert.throws(() => addResponse(db, { ...row, likelihood: "invalid" }));
    assert.throws(() => addResponse(db, { ...row, selections: { desired_feature: ["Unknown"] } }));
    assert.throws(() => addResponse(db, { ...row, selections: { desired_feature: ["None of these", "Saved plans"] } }));
    assert.equal(db.prepare("SELECT count(*) AS n FROM profiles").get().n, 0);
  } finally { db.close(); }
});

test("imports validate entire batches, reject repeated batches and preserve source labels", () => {
  const db = openDatabase(":memory:");
  try {
    const raw = JSON.stringify([row, { ...row, age: "25–34" }]);
    assert.equal(importAudience(db, raw), 2);
    assert.throws(() => importAudience(db, JSON.stringify(JSON.parse(raw), null, 2)), /already imported/);
    assert.throws(() => importResponses(db, [row, { ...row, budget: "invalid" }]));
    assert.equal(db.prepare("SELECT count(*) AS n FROM profiles").get().n, 2);
    assert.equal(db.prepare("SELECT count(*) AS n FROM completed_imports").get().n, 1);
    assert.equal(db.prepare("SELECT DISTINCT source FROM profiles").get().source, "browser-demo");
  } finally { db.close(); }
});
