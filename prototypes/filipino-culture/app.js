'use strict';
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const bilingualText = AlpasCopy.render;
const state = { month: '2026-11', date: '', collection: '' };
const dateText = date => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
const timeText = value => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }).format(new Date(value));
const priceText = event => event.price === null ? 'Price unknown' : event.price === 0 ? 'Free' : '$' + event.price;
const ageText = event => event.age === null ? 'Age restriction unknown' : event.age === 0 ? 'All ages' : event.age + '+';
let storageAvailable = true;
function readSaved(key, fallback, validator) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return validator(value) ? value : fallback;
  } catch { storageAvailable = false; return fallback; }
}
const seedRequests = [
  { title: 'Calendar with location, date, and price filters', priority: 'P0', status: 'Prototype ready' },
  { title: 'Age, mood, interest, and evening filters', priority: 'P0', status: 'Prototype ready' },
  { title: 'Filipino collections and host-provided cultural context', priority: 'P0', status: 'Prototype ready' },
  { title: 'Barkada invitations and shared group plans', priority: 'P1', status: 'Backlog' },
  { title: 'Community review and regional-language support', priority: 'P1', status: 'Backlog' },
  { title: 'Verified organizer submissions and duplicate review', priority: 'P1', status: 'Backlog' },
  { title: 'Save events and opt in to reminders', priority: 'P1', status: 'Backlog' },
  { title: 'Partner promotion with clear sponsored labels', priority: 'P2', status: 'Backlog' }
];
const statuses = ['Backlog', 'In progress', 'Prototype ready', 'Validated'];
const validRequests = value => Array.isArray(value) && value.every(item => item && typeof item.title === 'string' && ['P0', 'P1', 'P2'].includes(item.priority) && statuses.includes(item.status));
// Preserve earlier requests and add new redesign seeds without resetting team edits.
let requests = readSaved('alpas.requests.v1', [], validRequests);
for (const seed of seedRequests) if (!requests.some(request => request.title === seed.title)) requests.push({ ...seed });
const checklist = [
  'Run automated tests and review every failure',
  'Switch between all four demo locations',
  'Select a date and confirm the event detail matches',
  'Check free, paid, and unknown-price results',
  'Verify 18+ and 21+ restrictions are distinct',
  'Confirm sponsored events still obey every filter',
  'Check keyboard use and a narrow/mobile layout',
  'Confirm fictional-event labels before presenting',
  'Check each collection with date, location, and price',
  'Confirm every Tagalog label has its English translation directly underneath',
  'Review host context, language labels, and cultural descriptions with community reviewers'
];
let checks = readSaved('alpas.checks.culture.v3', checklist.map(() => false), value => Array.isArray(value) && value.length === checklist.length && value.every(item => typeof item === 'boolean'));
let latestResults = null;
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { storageAvailable = false; }
  if (!storageAvailable) $('storage-note').textContent = 'Browser storage is unavailable. Changes last only for this session.';
}
function filters() {
  return { location: $('location').value, month: state.month, date: state.date, collection: state.collection, age: $('age').value, maxPrice: $('price').value, startHour: $('time').value, mood: $('mood').value, interest: $('interest').value };
}
function renderCollections() {
  $('collections').innerHTML = [{ id: '', name: 'All gatherings', meaning: 'Explore together', description: 'A little of everything', symbol: '☀' }, ...Alpas.collections].map(collection => `<button class="collection ${state.collection === collection.id ? 'is-active' : ''}" data-collection="${collection.id}" aria-pressed="${state.collection === collection.id}"><span class="collection-symbol" aria-hidden="true">${collection.symbol}</span><span class="bilingual"><strong ${collection.id ? 'lang="tl"' : ''}>${escapeHTML(collection.name)}</strong><span class="translation collection-meaning" lang="en">${escapeHTML(collection.meaning)}</span></span><small>${escapeHTML(collection.description)}</small></button>`).join('');
}
function renderDiscovery() {
  renderCollections();
  const selection = filters();
  const monthEvents = Alpas.search({ ...selection, date: '' });
  const [year, month] = state.month.split('-').map(Number);
  $('month-title').textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));
  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  $('calendar').innerHTML = '<span class="calendar-blank" aria-hidden="true"></span>'.repeat(offset) + Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const date = `${state.month}-${String(day).padStart(2, '0')}`;
    const count = monthEvents.filter(event => Alpas.coversDate(event, date)).length;
    return `<button class="day ${state.date === date ? 'selected' : ''}" data-date="${date}" aria-pressed="${state.date === date}" aria-label="${dateText(date)}, ${count} matching events"><span>${day}</span><span class="date-dot ${count ? 'has-events' : ''}"></span></button>`;
  }).join('');
  const matches = Alpas.search(selection);
  $('results-title').textContent = state.date ? dateText(state.date) : `Around ${selection.location}`;
  $('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'experience' : 'experiences'}`;
  $('events').innerHTML = matches.length ? matches.map(event => `<article class="event-card"><div class="event-art ${event.theme}" aria-hidden="true"><span>${event.icon}</span><small>${event.interest.toUpperCase()}</small></div><div class="event-content"><div class="event-tags">${event.sponsored ? '<span class="sponsored">Sponsored · demo</span>' : '<span>LOCAL FINDS</span>'}${event.status === 'sold-out' ? '<span class="sold-out">Sold out</span>' : ''}<span>${ageText(event)}</span></div><h3><button class="event-title" data-event="${event.id}">${bilingualText(event.title)}</button></h3><p>${dateText(Alpas.localDate(event.start))} · ${timeText(event.start)} PT</p><p>${escapeHTML(event.city)} · ${escapeHTML(event.venue)}</p><div class="card-bottom"><strong>${priceText(event)}</strong><button class="text-button" data-event="${event.id}" aria-label="View ${escapeHTML(event.title)} details">Take a look ↗</button></div></div></article>`).join('') : '<div class="empty"><span>↗</span><h3>A little more room to explore</h3><p>No matches for these filters. Try another date, place, or budget.</p><p class="field-help">Demo events are concentrated on November 28–30, 2026.</p><button class="primary" id="demo-reset">Explore the demo events</button></div>';
}
function resetFilters() {
  state.month = '2026-11'; state.date = ''; state.collection = '';
  $('location').value = 'Bakersfield';
  for (const id of ['age', 'price', 'time', 'mood', 'interest']) $(id).value = '';
  renderDiscovery();
}
for (const id of ['location', 'age', 'time', 'mood', 'interest']) $(id).addEventListener('change', renderDiscovery);
$('collections').addEventListener('click', event => {
  const button = event.target.closest('[data-collection]');
  if (!button) return;
  state.collection = button.dataset.collection;
  renderDiscovery();
  $('collections').querySelector(`[data-collection="${state.collection}"]`).focus();
});
$('price').addEventListener('input', () => { if ($('price').validity.valid) renderDiscovery(); });
$('reset').addEventListener('click', resetFilters);
$('all-dates').addEventListener('click', () => { state.date = ''; renderDiscovery(); });
for (const [id, delta] of [['prev', -1], ['next', 1]]) $(id).addEventListener('click', () => {
  const [year, month] = state.month.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  state.month = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
  state.date = ''; renderDiscovery();
});
$('calendar').addEventListener('click', event => {
  const button = event.target.closest('[data-date]');
  if (button) { state.date = button.dataset.date; renderDiscovery(); $('calendar').querySelector(`[data-date="${state.date}"]`).focus(); }
});
$('events').addEventListener('click', event => {
  if (event.target.closest('#demo-reset')) return resetFilters();
  const button = event.target.closest('[data-event]');
  if (!button) return;
  const item = Alpas.events.find(candidate => candidate.id === button.dataset.event);
  $('event-detail').innerHTML = `<div class="eyebrow">FICTIONAL DEMO EVENT · ${item.id}</div><h2>${bilingualText(item.title)}</h2><p>${bilingualText(item.description)}</p><dl><dt>When</dt><dd>${dateText(Alpas.localDate(item.start))}, ${timeText(item.start)} – ${dateText(Alpas.localDate(item.end))}, ${timeText(item.end)} PT</dd><dt>Where</dt><dd>${escapeHTML(item.venue)}, ${escapeHTML(item.city)}</dd><dt>Admission</dt><dd>${ageText(item)} · ${priceText(item)}</dd><dt>Status</dt><dd>${item.status === 'sold-out' ? 'Sold out' : 'Scheduled'}${item.sponsored ? ' · Sponsored demo placement' : ''}</dd><dt>Moods</dt><dd>${item.moods.join(', ')}</dd></dl><div class="detail-note">No tickets are sold here. Real event listings will include verified organizer details and an external booking link when available.</div>`;
  const context = document.createElement('section');
  context.className = 'cultural-context';
  context.innerHTML = `<h3>Meet the gathering</h3><p><strong>Demo host:</strong> ${escapeHTML(item.host)}</p><p><strong>Event languages:</strong> ${item.languages.map(escapeHTML).join(', ')}</p><p class="field-help">These labels describe the fictional program; translation support is not implied.</p><h3>A little context</h3><p>${bilingualText(item.culturalNote)}</p><p class="field-help">Fictional host and program. Real listings will be reviewed with their organizers.</p>`;
  $('event-detail').querySelector('.detail-note').before(context);
  $('event-dialog').showModal();
});
$('close-dialog').addEventListener('click', () => $('event-dialog').close());
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  for (const view of ['discover', 'team']) $(view).hidden = view !== button.dataset.view;
  document.querySelectorAll('[data-view]').forEach(nav => {
    nav.classList.toggle('active', nav === button);
    if (nav === button) nav.setAttribute('aria-current', 'page'); else nav.removeAttribute('aria-current');
  });
}));
function renderMetrics() {
  const values = [[requests.length, 'Feature requests'], [`${checks.filter(Boolean).length}/${checks.length}`, 'Manual release checks'], [latestResults ? `${latestResults.filter(item => item.passed).length}/${latestResults.length}` : '—', 'Automated scenarios'], [Alpas.events.length, 'Fictional test records']];
  $('metrics').innerHTML = values.map(([value, label]) => `<div class="panel metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
}
function renderRequests() {
  $('requests').innerHTML = requests.map((request, index) => `<div class="request"><span class="priority">${request.priority}</span><span>${bilingualText(request.title)}</span><select data-request="${index}" aria-label="Status of ${escapeHTML(request.title)}">${statuses.map(status => `<option ${status === request.status ? 'selected' : ''}>${status}</option>`).join('')}</select><button class="remove-request" data-remove="${index}" aria-label="Delete request ${escapeHTML(request.title)}">×</button></div>`).join('');
  renderMetrics();
}
$('request-form').addEventListener('submit', event => {
  event.preventDefault();
  const title = $('request-title').value.trim();
  if (!title) return;
  requests.push({ title, priority: $('request-priority').value, status: 'Backlog' });
  save('alpas.requests.v1', requests); $('request-form').reset(); renderRequests();
});
$('requests').addEventListener('change', event => {
  if (!event.target.matches('[data-request]')) return;
  requests[Number(event.target.dataset.request)].status = event.target.value;
  save('alpas.requests.v1', requests); renderMetrics();
});
$('requests').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  requests.splice(Number(button.dataset.remove), 1);
  save('alpas.requests.v1', requests); renderRequests();
});
$('checklist').innerHTML = checklist.map((label, index) => `<label class="check-item"><input type="checkbox" data-check="${index}" ${checks[index] ? 'checked' : ''}><span>${bilingualText(label)}</span></label>`).join('');
$('checklist').addEventListener('change', event => {
  checks[Number(event.target.dataset.check)] = event.target.checked;
  save('alpas.checks.culture.v3', checks); renderMetrics();
});
$('run-tests').addEventListener('click', () => {
  latestResults = Alpas.runTests();
  $('test-results').innerHTML = latestResults.map(result => `<tr><td>${bilingualText(result.name)}</td><td>${result.expected.join(', ') || 'None'}</td><td>${result.actual.join(', ') || 'None'}</td><td><span class="test-status ${result.passed ? 'pass' : 'fail'}">${result.passed ? 'PASS' : 'FAIL'}</span></td></tr>`).join('');
  $('test-summary').textContent = `${latestResults.filter(item => item.passed).length} of ${latestResults.length} scenarios passed · Run ${new Date().toLocaleTimeString()}`;
  renderMetrics();
});
renderDiscovery(); renderRequests();
if (!storageAvailable) $('storage-note').textContent = 'Browser storage is unavailable. Changes last only for this session.';
