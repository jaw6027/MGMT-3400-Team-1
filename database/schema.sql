PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY NOT NULL,
  age_range TEXT NOT NULL CHECK(age_range IN ('Under 18', '18–24', '25–34', '35–44', '45–54', '55+', 'Prefer not to say')),
  life_stage TEXT NOT NULL CHECK(life_stage IN ('Student', 'Working', 'Student and working', 'Retired', 'Other', 'Prefer not to say')),
  residency TEXT NOT NULL CHECK(residency IN ('Local resident', 'Visitor', 'Student living here temporarily', 'Neither', 'Prefer not to say')),
  source TEXT NOT NULL CHECK(source IN ('survey', 'browser-demo', 'fictional-demo')),
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  discovery_frequency TEXT CHECK(discovery_frequency IN ('Several times a week', 'About once a week', 'A few times a month', 'Once a month or less', 'Never')),
  trial_likelihood TEXT CHECK(trial_likelihood IN ('Very likely', 'Somewhat likely', 'Neither likely nor unlikely', 'Somewhat unlikely', 'Very unlikely')),
  activity_budget TEXT CHECK(activity_budget IN ('Free activities only', 'Under $20', '$20–$39', '$40–$59', '$60 or more', 'It depends / not sure')),
  recent_outing TEXT CHECK(length(recent_outing) <= 1500),
  must_have TEXT CHECK(length(must_have) <= 1500),
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS selection_options (
  question TEXT NOT NULL CHECK(question IN ('discovery_channel', 'planning_difficulty', 'desired_feature', 'activity_interest', 'barrier')),
  option TEXT NOT NULL,
  PRIMARY KEY(question, option)
);

CREATE TABLE IF NOT EXISTS response_selections (
  response_id TEXT NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option TEXT NOT NULL,
  PRIMARY KEY(response_id, question, option),
  FOREIGN KEY(question, option) REFERENCES selection_options(question, option)
);

-- Store only an import fingerprint, never an uploaded file's contents or path.
CREATE TABLE IF NOT EXISTS completed_imports (
  fingerprint TEXT PRIMARY KEY NOT NULL,
  response_count INTEGER NOT NULL CHECK(response_count >= 0)
);

CREATE INDEX IF NOT EXISTS response_profile_idx ON survey_responses(profile_id);

-- Separate actual survey, local browser demo, and fictional sample records.
-- Counts describe recorded profiles/responses; they do not establish unique people.
CREATE VIEW IF NOT EXISTS age_summary AS
SELECT source, age_range, count(*) AS profile_count,
       round(100.0 * count(*) / sum(count(*)) OVER (PARTITION BY source), 1) AS percent
FROM profiles GROUP BY source, age_range;

CREATE VIEW IF NOT EXISTS life_stage_summary AS
SELECT source, life_stage, count(*) AS profile_count
FROM profiles GROUP BY source, life_stage;

CREATE VIEW IF NOT EXISTS residency_summary AS
SELECT source, residency, count(*) AS profile_count
FROM profiles GROUP BY source, residency;

CREATE VIEW IF NOT EXISTS interest_by_age AS
SELECT p.source, p.age_range, r.trial_likelihood, count(*) AS response_count
FROM survey_responses r JOIN profiles p ON p.id = r.profile_id
WHERE r.trial_likelihood IS NOT NULL
GROUP BY p.source, p.age_range, r.trial_likelihood;

CREATE VIEW IF NOT EXISTS feature_requests AS
SELECT p.source, s.option AS feature, count(*) AS response_count
FROM response_selections s
JOIN survey_responses r ON r.id = s.response_id
JOIN profiles p ON p.id = r.profile_id
WHERE s.question = 'desired_feature'
GROUP BY p.source, s.option;
