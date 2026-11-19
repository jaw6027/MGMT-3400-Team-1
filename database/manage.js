import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";
import { validateResponse } from "../src/audience.js";
import { selectionOptions } from "./options.js";

const root = fileURLToPath(new URL("../", import.meta.url));
export function openDatabase(path) {
  if (path !== ":memory:") mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  const insert = db.prepare("INSERT OR IGNORE INTO selection_options(question, option) VALUES (?, ?)");
  for (const [question, options] of Object.entries(selectionOptions)) {
    for (const option of options) insert.run(question, option);
  }
  return db;
}

// Call within a transaction when writing a batch.
export function addResponse(db, input, source = "survey") {
  const profileId = randomUUID(), responseId = randomUUID();
  const selections = input.selections ?? {};
  for (const [question, answers] of Object.entries(selections)) {
    if (!selectionOptions[question] || !Array.isArray(answers) || new Set(answers).size !== answers.length || answers.some(answer => !selectionOptions[question].includes(answer))) {
      throw new Error("Invalid survey selections");
    }
    if (["desired_feature", "planning_difficulty"].includes(question) && answers.length > 3) throw new Error("Choose up to three options");
    const exclusive = { desired_feature: "None of these", planning_difficulty: "I don’t usually have difficulty", barrier: "Nothing comes to mind" }[question];
    if (exclusive && answers.includes(exclusive) && answers.length > 1) throw new Error("An exclusive answer cannot be combined with other answers");
  }
  // A savepoint keeps single responses atomic even inside an import transaction.
  db.exec("SAVEPOINT add_response");
  try {
    db.prepare("INSERT INTO profiles(id, age_range, life_stage, residency, source) VALUES (?, ?, ?, ?, ?)")
      .run(profileId, input.age ?? "Prefer not to say", input.stage ?? "Prefer not to say", input.location ?? "Prefer not to say", source);
    db.prepare("INSERT INTO survey_responses(id, profile_id, discovery_frequency, trial_likelihood, activity_budget, recent_outing, must_have) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(responseId, profileId, input.frequency ?? null, input.likelihood ?? null, input.budget ?? null, input.recentOuting ?? null, input.mustHave ?? null);
    const insert = db.prepare("INSERT INTO response_selections(response_id, question, option) VALUES (?, ?, ?)");
    for (const [question, answers] of Object.entries(selections)) {
      for (const answer of answers) insert.run(responseId, question, answer);
    }
    db.exec("RELEASE add_response");
    return { profileId, responseId };
  } catch (error) {
    db.exec("ROLLBACK TO add_response; RELEASE add_response");
    throw error;
  }
}

export function importAudience(db, raw) {
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows) || rows.length > 1000) throw new Error("Expected an audience export array of up to 1,000 responses");
  const validated = rows.map(validateResponse);
  return importResponses(db, validated, "browser-demo");
}

export function importResponses(db, rows, source = "survey") {
  if (!Array.isArray(rows) || rows.length > 1000 || rows.some(row => !row || typeof row !== "object" || Array.isArray(row))) throw new Error("Expected an array of up to 1,000 survey response objects");
  const fingerprint = createHash("sha256").update(source + JSON.stringify(rows)).digest("hex");
  if (db.prepare("SELECT 1 FROM completed_imports WHERE fingerprint = ?").get(fingerprint)) throw new Error("This response batch was already imported");
  db.exec("BEGIN");
  try {
    for (const row of rows) addResponse(db, row, source);
    db.prepare("INSERT INTO completed_imports VALUES (?, ?)").run(fingerprint, rows.length);
    db.exec("COMMIT");
    return rows.length;
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}

function main() {
  const [command, inputPath] = process.argv.slice(2);
  if (!["init", "demo", "import", "survey", "report"].includes(command) || (["import", "survey"].includes(command) && !inputPath)) {
    throw new Error("Usage: node database/manage.js init|demo|report OR import|survey <responses.json>");
  }
  const path = resolve(root, "local-data", command === "demo" || (command === "report" && inputPath === "demo") ? "alpas-fictional-demo.sqlite" : "alpas-customers.sqlite");
  if (command === "demo" && existsSync(path)) throw new Error("Demo database already exists; it was left unchanged");
  if (command === "report" && !existsSync(path)) throw new Error("Run npm run db:init first");
  const db = openDatabase(path);
  try {
    if (command === "import") console.log(`Imported ${importAudience(db, readFileSync(resolve(inputPath), "utf8"))} browser-demo responses.`);
    if (command === "survey") console.log(`Imported ${importResponses(db, JSON.parse(readFileSync(resolve(inputPath), "utf8")))} survey responses.`);
    if (command === "demo") {
      db.exec("BEGIN");
      try {
        for (const row of JSON.parse(readFileSync(new URL("./fictional-responses.json", import.meta.url), "utf8"))) addResponse(db, row, "fictional-demo");
        db.exec("COMMIT");
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    }
    if (command === "report") {
      for (const view of ["age_summary", "life_stage_summary", "residency_summary", "interest_by_age", "feature_requests"]) {
        console.log(view);
        console.table(db.prepare(`SELECT * FROM ${view}`).all());
      }
    }
    console.log(`Database: ${path}`);
  } finally { db.close(); }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
