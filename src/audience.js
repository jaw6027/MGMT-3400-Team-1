export const AUDIENCE_KEY = "alpas-audience-responses";
export const audienceFields = {
  age: { label: "Age range", options: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+", "Prefer not to say"] },
  stage: { label: "Life stage", options: ["Student", "Working", "Student and working", "Retired", "Other", "Prefer not to say"] },
  location: { label: "Local or visiting?", options: ["Local resident", "Visitor", "Prefer not to say"] },
};

export function validateResponse(input) {
  const result = {};
  for (const [key, field] of Object.entries(audienceFields)) {
    if (!field.options.includes(input?.[key])) throw new Error("Choose a valid answer for each question, or Prefer not to say.");
    result[key] = input[key];
  }
  if (Object.values(result).every(value => value === "Prefer not to say")) {
    throw new Error("Choose at least one answer to add a response. You can also close this optional survey.");
  }
  return result;
}

export function readAudience(storage) {
  const raw = storage.getItem(AUDIENCE_KEY);
  if (raw === null) return [];
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows) || rows.length > 1000) throw new Error("Invalid audience data");
  return rows.map(validateResponse);
}

export function saveAudience(storage, rows) {
  if (!Array.isArray(rows) || rows.length > 1000) throw new Error("This demo supports up to 1,000 responses. Delete the demo data to start again.");
  storage.setItem(AUDIENCE_KEY, JSON.stringify(rows.map(validateResponse)));
}

export function summarizeAudience(rows, key) {
  return audienceFields[key].options.map(label => {
    const count = rows.filter(row => row[key] === label).length;
    return { label, count, percent: rows.length ? Math.round(count / rows.length * 100) : 0 };
  });
}
