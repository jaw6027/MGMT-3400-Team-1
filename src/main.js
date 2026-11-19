import "./style.css";
import {
  activities,
  cities,
  categories,
  filterActivities,
  readSaved,
} from "./catalog.js";

const paths = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  leaf: '<path d="M20 3C8 1 1 8 6 17s17 0 14-14Z"/><path d="m4 21 12-13"/>',
  art: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 4-6 4 7"/>',
  food: '<path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M20 21V3c-4 3-5 8 0 10"/>',
  music:
    '<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  filter:
    '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="17" r="3" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  external:
    '<path d="M14 3h7v7m0-7L11 13M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  sparkle: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sun}</svg>`;
const escape = (str) =>
  String(str).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const categoryIcons = ["grid", "leaf", "art", "food", "music", "pin"];
let initialSaved = [];
try {
  initialSaved = readSaved(window.localStorage);
} catch {
  /* Browsers can deny storage access. */
}
const state = {
  city: "Chicago",
  query: "",
  category: "All experiences",
  budget: "any",
  time: "any",
  sort: "recommended",
  view: "explore",
  saved: initialSaved,
};
let toastTimer;
let returnFocus;

const logo = `<span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="m5 29 13-23h4l13 23h-8l-7-13-7 13Z" fill="currentColor"/><circle cx="20" cy="31" r="3" fill="currentColor"/></svg></span><span>alpas<span class="logo-dot">.</span></span>`;
document.querySelector("#app").innerHTML = `
  <header class="header"><div class="header-inner">
    <a class="brand" href="#" aria-label="Alpas home">${logo}</a>
    <nav aria-label="Main navigation"><button class="nav-link active" id="explore-nav" aria-current="page">Explore</button><button class="nav-link" id="plans-nav">My plans <span class="plan-count">0</span></button></nav>
    <button class="about-link" id="about-nav">A little about Alpas ${icon("arrow")}</button>
  </div></header>
  <main>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow"><span></span> GOOD PLANS START WITH A LITTLE CURIOSITY</div>
        <h1 id="hero-title">New city.<br>New <em>possibilities.</em></h1>
        <p>Find your kind of fun, wherever you are.<br> Discover the spots, sounds, and little adventures<br class="desktop-break"> that make a city worth exploring.</p>
        <div class="hero-note">${icon("sparkle")} Less “what should we do?” More “let’s go.”</div>
      </div>
      <div class="hero-art"><img src="/images/hero.svg" alt="Illustration of a riverboat exploring a warm, sunlit Chicago skyline" width="800" height="600" fetchpriority="high"><span class="art-label">A little change of scenery.</span><div class="floating-note">${icon("pin")} Somewhere new.<br><strong>Something you.</strong><span class="note-star">✳︎</span></div></div>
    </section>
    <section class="explore-section" aria-label="Discover experiences">
      <form class="search-bar" id="search-form" role="search">
        <label class="city-field">${icon("pin")}<span><span class="field-label">WHERE TO?</span><select id="city" aria-label="Choose a city">${cities.map((city) => `<option>${city}</option>`).join("")}</select></span></label>
        <label class="query-field">${icon("search")}<span class="sr-only">Search activities</span><input id="query" type="search" placeholder="What are you in the mood for?" autocomplete="off"></label>
        <button class="primary search-button" type="submit">Find my fun ${icon("arrow")}</button>
      </form>
      <div class="discovery-header"><div><div class="eyebrow" id="section-eyebrow">GO OUT. GET INTO SOMETHING.</div><h2 id="results-title">A little inspiration for <span>Chicago</span><span class="orange-dot">.</span></h2><p id="results-subtitle">Big adventures or small detours. Make the day your own.</p></div><div class="sample-label">${icon("sparkle")} Curated demo collection</div></div>
      <div class="filters-row"><div class="category-list" role="group" aria-label="Activity categories">${categories.map((category, i) => `<button class="category ${i === 0 ? "selected" : ""}" data-category="${category}" aria-pressed="${i === 0}">${icon(categoryIcons[i])}${category}</button>`).join("")}</div><button class="filter-toggle" id="filter-toggle" aria-expanded="false" aria-controls="extra-filters">${icon("filter")} Filters <span id="filter-count"></span></button></div>
      <div class="extra-filters" id="extra-filters" hidden><label>Budget per person<select id="budget"><option value="any">Any budget</option><option value="0">Free</option><option value="20">$20 or less</option><option value="40">$40 or less</option></select></label><label>Time of day<select id="time"><option value="any">Any time</option><option>Daytime</option><option>Evening</option></select></label><button class="text-button" id="reset-filters">Reset filters</button></div>
      <div class="results-toolbar"><p id="result-count" role="status"></p><label class="sort-label">Sort by: <select id="sort" aria-label="Sort experiences"><option value="recommended">Our picks</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
      <div id="plan-summary" hidden></div>
      <div class="cards" id="cards"></div>
      <p class="demo-disclaimer">A little heads-up: these are sample listings and estimated prices, not live availability. Check the official website for current prices, hours, tickets, and age restrictions.</p>
    </section>
    <section class="bottom-banner"><div class="banner-flower" aria-hidden="true">✳︎</div><div><h2>Your next good memory is out there.</h2><p>Save a few favorites. Leave a little room for the unexpected.</p></div><button id="banner-plans">Make a little plan ${icon("arrow")}</button></section>
  </main>
  <footer><a class="brand footer-brand" href="#" aria-label="Alpas home">${logo}</a><p>A little discovery. A lot of possibility.</p><span>Made for going places. © ${new Date().getFullYear()} Alpas</span></footer>
  <dialog id="details-dialog" aria-labelledby="dialog-title"><button class="dialog-close icon-button" aria-label="Close dialog">${icon("close")}</button><div id="dialog-content"></div></dialog>
`;

function notify(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
}
function toggleSaved(id) {
  const item = activities.find((a) => a.id === id);
  if (!item) return;
  const added = !state.saved.includes(id);
  state.saved = added
    ? [...state.saved, id]
    : state.saved.filter((value) => value !== id);
  let persisted = true;
  try {
    localStorage.setItem("alpas-plans", JSON.stringify(state.saved));
  } catch {
    persisted = false;
  }
  render();
  updateDialogSave(id);
  notify(
    `${added ? "Added to" : "Removed from"} your plans.${persisted ? "" : " Browser storage is unavailable; plans will last for this visit."}`,
  );
}
function card(item) {
  const saved = state.saved.includes(item.id);
  return `<article class="card"><div class="card-image"><button class="image-open" data-details="${item.id}" aria-label="View details for ${escape(item.title)}"><img src="/images/${item.image}.svg" alt="" width="800" height="500" loading="lazy"></button><span class="image-tag">${item.tag}</span><button class="save-button ${saved ? "is-saved" : ""}" data-save="${item.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${escape(item.title)}${saved ? " from plans" : " to plans"}">${icon("heart")}</button></div><div class="card-body"><div class="card-category">${item.category}<span>${icon("clock")}${item.duration}</span></div><h3><button data-details="${item.id}">${item.title}</button></h3><p class="venue">${icon("pin")}${item.venue}${state.view === "plans" ? ` · ${item.city}` : ""}</p><div class="card-bottom"><div class="price">${item.price === 0 ? '<strong class="free">Free</strong><span>to explore</span>' : `<strong>$${item.price}</strong><span>est. / person</span>`}</div><button class="details-button" data-details="${item.id}" aria-label="Explore ${escape(item.title)}">Explore ${icon("arrow")}</button></div></div></article>`;
}
function render() {
  const focusedSave = document.activeElement?.closest("[data-save]");
  const focusedId = focusedSave?.dataset.save;
  const focusedCard = focusedSave?.closest(".card");
  const planning = state.view === "plans";
  const items = planning
    ? filterActivities(activities, {
        city: "",
        saved: state.saved,
        sort: state.sort,
      })
    : filterActivities(activities, { ...state, saved: null });
  document
    .querySelectorAll(".plan-count")
    .forEach((el) => (el.textContent = state.saved.length));
  document.querySelector("#hero-title").closest(".hero").hidden = planning;
  document.querySelector("#search-form").hidden = planning;
  document.querySelector(".filters-row").hidden = planning;
  document.querySelector("#extra-filters").hidden =
    planning ||
    document.querySelector("#filter-toggle").getAttribute("aria-expanded") !==
      "true";
  document.querySelector("#section-eyebrow").textContent = planning
    ? "GOOD IDEAS, ALL IN ONE PLACE."
    : "GO OUT. GET INTO SOMETHING.";
  document.querySelector("#results-title").innerHTML = planning
    ? 'Your next <span>little adventures</span><span class="orange-dot">.</span>'
    : `A little inspiration for <span>${escape(state.city)}</span><span class="orange-dot">.</span>`;
  document.querySelector("#results-subtitle").textContent = planning
    ? "The places you want to go. The memories waiting to happen."
    : "Big adventures or small detours. Make the day your own.";
  document.querySelector("#result-count").textContent =
    `${items.length} ${planning ? "saved" : "handpicked"} experience${items.length === 1 ? "" : "s"}${planning ? "" : " to get you going"}`;
  document.querySelector("#cards").innerHTML = items.length
    ? items.map(card).join("")
    : `<div class="empty-state">${icon(planning ? "heart" : "search")}<h3>${planning ? "Good plans start with a favorite." : "A little too off the beaten path."}</h3><p>${planning ? "Tap the heart on any experience to keep it here for later." : "Try a different search or loosen your filters to find more possibilities."}</p><button class="primary" id="empty-action">${planning ? "Find an adventure" : "Clear search & filters"} ${icon("arrow")}</button></div>`;
  const summary = document.querySelector("#plan-summary");
  summary.hidden = !planning || !items.length;
  summary.innerHTML = `<span>${icon("heart")} ${items.length} ideas, endless possibilities.</span><span>Estimated total per person <strong>$${items.reduce((sum, a) => sum + a.price, 0)}</strong></span>`;
  ["explore", "plans"].forEach((view) => {
    const nav = document.querySelector(`#${view}-nav`);
    nav.classList.toggle("active", state.view === view);
    if (state.view === view) nav.setAttribute("aria-current", "page");
    else nav.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-category]").forEach((btn) => {
    const selected = btn.dataset.category === state.category;
    btn.classList.toggle("selected", selected);
    btn.setAttribute("aria-pressed", selected);
  });
  const count = Number(state.budget !== "any") + Number(state.time !== "any");
  document.querySelector("#filter-count").textContent = count
    ? `(${count})`
    : "";
  if (focusedCard && focusedId) {
    const candidate = [...document.querySelectorAll("#cards [data-save]")].find(
      (button) => button.dataset.save === focusedId,
    );
    (
      candidate || document.querySelector("#cards [data-save], #empty-action")
    )?.focus({ preventScroll: true });
  }
}
function changeView(view) {
  state.view = view;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function updateDialogSave(id) {
  const button = document.querySelector("#dialog-save");
  if (button?.dataset.save !== id) return;
  const saved = state.saved.includes(id);
  button.innerHTML = `${icon(saved ? "check" : "heart")} ${saved ? "Saved to my plans" : "Save to my plans"}`;
  button.setAttribute("aria-pressed", saved);
}
function openDialog(html) {
  returnFocus = document.activeElement;
  document.querySelector("#dialog-content").innerHTML = html;
  document.querySelector("#details-dialog").showModal();
}
function showDetails(id) {
  const item = activities.find((a) => a.id === id);
  if (!item) return;
  openDialog(
    `<img class="dialog-image" src="/images/${item.image}.svg" alt="" width="800" height="500"><div class="dialog-body"><div class="eyebrow">${item.city.toUpperCase()} / ${item.category.toUpperCase()}</div><h2 id="dialog-title">${item.title}</h2><p class="venue">${icon("pin")}${item.venue}</p><p class="description">${item.description}</p><div class="detail-facts"><span>${icon("clock")} ${item.duration}</span><span>${icon("sun")} ${item.time}</span><strong>${item.price ? `$${item.price} est. / person` : "Free to explore"}</strong></div><p class="price-note">Demo listing · Prices are estimates. Confirm admission, dates, availability, and restrictions with the venue.</p><div class="dialog-actions"><a class="primary" href="${item.url}" target="_blank" rel="noopener noreferrer">Official website ${icon("external")}<span class="sr-only"> (opens in a new tab)</span></a><button class="secondary" id="dialog-save" data-save="${item.id}"></button></div></div>`,
  );
  updateDialogSave(id);
}
function resetFilters() {
  Object.assign(state, {
    query: "",
    category: "All experiences",
    budget: "any",
    time: "any",
  });
  document.querySelector("#query").value = "";
  document.querySelector("#budget").value = "any";
  document.querySelector("#time").value = "any";
  render();
}

document.addEventListener("click", (event) => {
  const save = event.target.closest("[data-save]");
  if (save) {
    toggleSaved(save.dataset.save);
    return;
  }
  const details = event.target.closest("[data-details]");
  if (details) {
    showDetails(details.dataset.details);
    return;
  }
  const category = event.target.closest("[data-category]");
  if (category) {
    state.category = category.dataset.category;
    render();
    return;
  }
  if (event.target.closest("#empty-action")) {
    if (state.view === "plans") changeView("explore");
    else resetFilters();
  }
  if (event.target.closest(".brand")) {
    event.preventDefault();
    changeView("explore");
  }
});
document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = document.querySelector("#query").value;
  render();
  document
    .querySelector(".discovery-header")
    .scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#city").addEventListener("change", (event) => {
  state.city = event.target.value;
  render();
});
document.querySelector("#query").addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});
document.querySelector("#sort").addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});
["budget", "time"].forEach((key) =>
  document.querySelector(`#${key}`).addEventListener("change", (event) => {
    state[key] = event.target.value;
    render();
  }),
);
document
  .querySelector("#reset-filters")
  .addEventListener("click", resetFilters);
document.querySelector("#filter-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.setAttribute(
    "aria-expanded",
    button.getAttribute("aria-expanded") !== "true",
  );
  render();
});
document
  .querySelector("#explore-nav")
  .addEventListener("click", () => changeView("explore"));
document
  .querySelector("#plans-nav")
  .addEventListener("click", () => changeView("plans"));
document
  .querySelector("#banner-plans")
  .addEventListener("click", () => changeView("plans"));
document
  .querySelector("#about-nav")
  .addEventListener("click", () =>
    openDialog(
      `<div class="about-body"><div class="eyebrow">LESS PLANNING. MORE LIVING.</div><h2 id="dialog-title">Hello, we're Alpas<span class="orange-dot">.</span></h2><p>A new city can mean a thousand possibilities—and no idea where to start. Alpas brings activities, places, estimated prices, and official websites together so making plans feels a little easier.</p><div class="about-steps"><p><strong>01</strong> Pick a city and follow your curiosity.</p><p><strong>02</strong> Find something that fits your mood and budget.</p><p><strong>03</strong> Save your favorites, then visit the official website to plan your visit.</p></div><p class="price-note">This first version uses a curated demo catalog for Chicago, New York, Austin, and Bakersfield. It does not provide live event inventory, ticket booking, or confirmed prices. Saved plans stay in this browser; no account is required.</p></div>`,
    ),
  );
const dialog = document.querySelector("#details-dialog");
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...dialog.querySelectorAll(
      'button, a[href], select, input, [tabindex="0"]',
    ),
  ].filter((el) => !el.disabled);
  const first = focusable[0],
    last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});
dialog.addEventListener("close", () => {
  document.querySelector("#dialog-content").innerHTML = "";
  if (returnFocus?.isConnected) returnFocus.focus();
});
render();
