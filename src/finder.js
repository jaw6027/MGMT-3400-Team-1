export const FINDER_FEEDBACK_KEY = "alpas-finder-feedback";
export const demoProfiles = [
  { name: "Free Outdoor Explorer", city: "Chicago", type: "Outdoors", budget: "0" },
  { name: "Music Fan", city: "Austin", type: "Nightlife", budget: "20" },
  { name: "Art Enthusiast", city: "New York", type: "Arts & culture", budget: "40" },
];

export function profilePreferences(profile) {
  return { city: profile.city, type: profile.type, budget: profile.budget,
    query: "", category: "All experiences", time: "any", season: "any", sort: "recommended" };
}

export function finderPreferences(state) {
  return Object.fromEntries(["city", "type", "budget", "query", "category", "time", "season", "sort"]
    .map(key => [key, state[key]]));
}

export function preferenceSummary(prefs) {
  return [prefs.city, prefs.type === "all" ? "All interests" : prefs.type,
    prefs.budget === "any" ? "Any budget" : prefs.budget === "0" ? "Free" : `$${prefs.budget} or less`,
    prefs.category !== "All experiences" && prefs.category,
    prefs.query && `Search: ${prefs.query}`, prefs.time !== "any" && prefs.time,
    prefs.season !== "any" && prefs.season].filter(Boolean).join(" · ");
}

export function saveFinderFeedback(storage, { rating, comment = "", preferences, resultIds }, now = new Date()) {
  if (!["helpful", "not-helpful"].includes(rating)) throw new Error("Choose Helpful or Not helpful.");
  if (typeof comment !== "string" || comment.length > 1000) throw new Error("Keep your comment within 1,000 characters.");
  const rows = JSON.parse(storage.getItem(FINDER_FEEDBACK_KEY) || "[]");
  if (!Array.isArray(rows)) throw new Error("Could not read existing feedback.");
  if (rows.length >= 1000) throw new Error("This browser has reached the 1,000-response demo limit.");
  const entry = { rating, comment: comment.trim(), preferences: finderPreferences(preferences),
    resultIds: [...resultIds], createdAt: now.toISOString() };
  storage.setItem(FINDER_FEEDBACK_KEY, JSON.stringify([...rows, entry]));
  return entry;
}
