export const activityTypes = [
  "Outdoors",
  "Theme parks",
  "Nightlife",
  "Date night",
  "Arts & culture",
  "Sightseeing",
];
const categoryTypes = {
  Outdoors: ["Outdoors"],
  "Arts & culture": ["Arts & culture", "Date night"],
  "Food & drink": ["Date night"],
  "Music & nightlife": ["Nightlife", "Date night"],
  Sightseeing: ["Sightseeing"],
  "Seasonal events": ["Sightseeing"],
};
export function matchesActivityType(item, type = "all") {
  return (
    type === "all" ||
    (item.types || categoryTypes[item.category] || []).includes(type)
  );
}
