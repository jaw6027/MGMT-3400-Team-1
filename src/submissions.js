import { cities, categories } from "./catalog.js";
const KEY = "alpas-organizer-events";

function text(value, label, max) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new Error(
      `${label} is required and must be ${max} characters or fewer.`,
    );
  return value.trim();
}
function date(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Enter a valid event date.");
  const parsed = new Date(`${value}T12:00:00Z`);
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  )
    throw new Error("Enter a valid event date.");
  return value;
}
export function validateSubmission(input) {
  const title = text(input.title, "Event title", 100);
  const venue = text(input.venue, "Venue", 100);
  const organizer = text(input.organizer, "Organizer name", 100);
  const description = text(input.description, "Description", 1500);
  if (!cities.includes(input.city)) throw new Error("Choose a supported city.");
  if (!categories.slice(1).includes(input.category))
    throw new Error("Choose an event category.");
  if (!["Daytime", "Evening"].includes(input.time))
    throw new Error("Choose a time of day.");
  const startDate = date(input.startDate);
  const endDate = date(input.endDate || input.startDate);
  if (endDate < startDate)
    throw new Error("The end date must be on or after the start date.");
  let url;
  try {
    url = new URL(input.url);
  } catch {
    throw new Error("Enter a full HTTPS event website URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Use an HTTPS event website URL without login details.");
  let price = null;
  if (input.pricing === "free") price = 0;
  else if (input.pricing === "paid") {
    price = Number(input.price);
    if (
      input.price === "" ||
      input.price == null ||
      !Number.isFinite(price) ||
      price <= 0 ||
      price > 100000
    )
      throw new Error(
        "Enter a ticket price greater than $0 and at most $100,000.",
      );
    price = Math.round(price * 100) / 100;
    if (price === 0) throw new Error("Use Free for a zero-price event.");
  } else if (input.pricing !== "unknown")
    throw new Error("Choose a pricing option.");
  const month = Number(startDate.slice(5, 7));
  const season =
    month <= 2 || month === 12
      ? "Winter"
      : month <= 5
        ? "Spring"
        : month <= 8
          ? "Summer"
          : "Fall";
  return {
    title,
    venue,
    organizer,
    description,
    city: input.city,
    category: input.category,
    time: input.time,
    startDate,
    endDate,
    url: url.href,
    price,
    season,
  };
}
export function createSubmission(input, id = crypto.randomUUID()) {
  const event = validateSubmission(input);
  return {
    ...event,
    id: `organizer-${id}`,
    duration: "See organizer",
    image:
      event.category === "Food & drink"
        ? "food"
        : event.category === "Music & nightlife"
          ? "jazz"
          : event.category === "Outdoors"
            ? "garden"
            : "art",
    tag: "Organizer submission · local",
    source: "organizer",
    timing:
      event.startDate === event.endDate
        ? event.startDate
        : `${event.startDate} – ${event.endDate}`,
  };
}
export function readSubmissions(storage) {
  try {
    const stored = JSON.parse(storage.getItem(KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    const seen = new Set();
    return stored.flatMap((item) => {
      try {
        if (
          typeof item.id !== "string" ||
          !/^organizer-[a-zA-Z0-9-]{1,80}$/.test(item.id) ||
          seen.has(item.id)
        )
          return [];
        const valid = createSubmission(
          {
            ...item,
            pricing:
              item.price === null
                ? "unknown"
                : item.price === 0
                  ? "free"
                  : "paid",
          },
          item.id.slice(10),
        );
        seen.add(valid.id);
        return [valid];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
export function storeSubmissions(storage, events) {
  storage.setItem(KEY, JSON.stringify(events));
}
