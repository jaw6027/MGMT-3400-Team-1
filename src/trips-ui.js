import { activityTypes } from "./activity-types.js";
import {
  trips,
  tripOrigins,
  travelBands,
  filterTrips,
  driveTime,
  directionsUrl,
} from "./trips.js";

export function tripDetails(item, { escape, icon }) {
  return `<img class="dialog-image" src="/images/${escape(item.image)}.svg" alt="" width="800" height="500"><div class="dialog-body"><div class="eyebrow">TRIPS FROM ${escape(item.origin.toUpperCase())}</div><h2 id="dialog-title">${escape(item.title)}</h2><p class="venue">${icon("pin")}${escape(item.city)}</p><p class="description">${escape(item.description)}</p><div class="availability-note"><strong>${icon("clock")} About ${driveTime(item.driveMinutes)} one way by car</strong>Estimated from central ${escape(item.origin)}. Traffic, stops, weather, and the exact route can change this time.</div><p class="trip-cost"><strong>Activity costs</strong>${escape(item.costLabel)}</p><p class="availability-note"><strong>When to go</strong>${escape(item.timing)}</p><p class="price-note">Curated trip idea, not a live route or booking. Activity estimates exclude fuel, transport, meals, and lodging. Confirm current access, reservations, prices, and road conditions on official sites.</p><div class="dialog-actions"><a class="primary" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Official website ${icon("external")}<span class="sr-only"> (opens in a new tab)</span></a><button class="secondary" id="dialog-save" data-save="${escape(item.id)}"></button><a class="secondary" href="${escape(directionsUrl(item))}" target="_blank" rel="noopener noreferrer">Check driving route ${icon("external")}<span class="sr-only"> (opens in a new tab)</span></a></div></div>`;
}

export function setupTrips({ card, escape, icon }) {
  const container = document.querySelector("#trips-section");
  let origin = "Bakersfield",
    band = "all",
    type = "all";
  container.innerHTML = `<div class="trip-heading"><div class="eyebrow">A LITTLE FARTHER. A LITTLE DIFFERENT.</div><h1>Good days start <em>from here.</em></h1><p>A nearby escape or a weekend away. Find a little adventure worth the drive.</p></div><div class="trip-controls"><label for="trip-origin">${icon("pin")} Starting city</label><select id="trip-origin">${tripOrigins.map((city) => `<option>${escape(city)}</option>`).join("")}</select><label for="trip-type">Activity type</label><select id="trip-type"><option value="all">All types</option>${activityTypes.map((type) => `<option>${escape(type)}</option>`).join("")}</select><span>No location permission needed.</span></div><div class="trip-bands" role="group" aria-label="Estimated one-way driving time">${travelBands.map((item) => `<button data-band="${item.value}" aria-pressed="${item.value === "all"}"><strong>${item.label}</strong><span>${item.note}</span></button>`).join("")}</div><div class="trip-result-heading"><h2 id="trip-title">Trips from Bakersfield</h2><p id="trip-count" role="status"></p></div><p class="trip-disclaimer">Drive times are rough one-way estimates from the starting city center, not live traffic. Activity costs are separate from travel and lodging. Check official sites and your route before setting out.</p><div class="cards" id="trip-cards"></div>`;
  let active = false;
  function render(visible = active) {
    active = visible;
    if (!active) {
      container.querySelector("#trip-cards").innerHTML = "";
      return;
    }
    const items = filterTrips(trips, { origin, band, type });
    container.querySelector("#trip-title").textContent = `Trips from ${origin}`;
    container.querySelector("#trip-count").textContent =
      `${items.length} trip ${items.length === 1 ? "idea" : "ideas"}`;
    container.querySelector("#trip-cards").innerHTML = items.length
      ? items.map(card).join("")
      : `<div class="empty-state">${icon("pin")}<h3>No curated trips in this range yet.</h3><p>Try another activity type, driving-time range, or starting city.</p><button class="primary" id="all-trip-distances">Reset trip filters ${icon("arrow")}</button></div>`;
    container
      .querySelectorAll("[data-band]")
      .forEach((button) =>
        button.setAttribute("aria-pressed", button.dataset.band === band),
      );
  }
  container
    .querySelector("#trip-origin")
    .addEventListener("change", (event) => {
      origin = event.target.value;
      render();
    });
  container.querySelector("#trip-type").addEventListener("change", (event) => {
    type = event.target.value;
    render();
  });
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-band]");
    if (button) {
      band = button.dataset.band;
      render();
    }
    if (event.target.closest("#all-trip-distances")) {
      band = "all";
      type = "all";
      container.querySelector("#trip-type").value = "all";
      render();
    }
  });
  render(false);
  return {
    render,
    setFilters(filters) {
      if (tripOrigins.includes(filters.origin)) origin = filters.origin;
      if (filters.type === "all" || activityTypes.includes(filters.type))
        type = filters.type;
      band = "all";
      container.querySelector("#trip-origin").value = origin;
      container.querySelector("#trip-type").value = type;
    },
  };
}
