import { AUDIENCE_KEY, audienceFields, readAudience, saveAudience, summarizeAudience, validateResponse } from "./audience.js";

export function setupAudience(openDialog) {
  const content = document.querySelector("#dialog-content");
  const markup = () => {
    let rows = [], unavailable = false;
    try { rows = readAudience(localStorage); } catch { unavailable = true; }
    return `<div class="organizer-body audience-body">
      <div class="eyebrow">GET TO KNOW OUR AUDIENCE</div>
      <h2 id="dialog-title">Audience insights</h2>
      <p class="submission-note">Browser-only class demo. Answers are optional and stay on this browser; nothing is sent to Alpas. Each submission counts as one response, including repeats. These results do not measure unique people or the full Alpas audience.</p>
      ${unavailable ? '<p class="form-error" role="alert">Saved responses could not be read. Browser storage may be unavailable or damaged. Delete demo responses to reset damaged data.</p>' : ''}
      <section aria-label="Response summary"><h3>${rows.length} survey response${rows.length === 1 ? '' : 's'}</h3>
      <p>Percentages include “Prefer not to say” and may not total 100% due to rounding. Small, voluntary samples cannot establish popularity.</p>
      ${rows.length ? Object.entries(audienceFields).map(([key, field]) => `<h4>${field.label}</h4><ul class="audience-chart">${summarizeAudience(rows, key).map(row => `<li><span>${row.label}</span><strong>${row.count} (${row.percent}%)</strong><meter min="0" max="100" value="${row.percent}" aria-label="${row.label}: ${row.count} responses, ${row.percent}%">${row.percent}%</meter></li>`).join('')}</ul>`).join('') : '<p>No responses yet. Add an optional response below to try the dashboard.</p>'}
      </section>
      <h3>Optional audience survey</h3><p>Choose broad categories only. We do not ask for names, birth dates, email addresses, or precise locations. Choose “Prefer not to say” for any question, or close this dialog to skip.</p>
      <form id="audience-form" class="organizer-form">
      ${Object.entries(audienceFields).map(([key, field]) => `<label class="wide">${field.label}<select name="${key}">${['Prefer not to say', ...field.options.filter(value => value !== 'Prefer not to say')].map(value => `<option>${value}</option>`).join('')}</select></label>`).join('')}
      <p class="form-error wide" id="audience-error" role="alert" hidden></p>
      <div class="form-actions wide"><button class="primary" type="submit"${unavailable ? ' disabled' : ''}>Add survey response</button></div>
      </form>
      <button class="text-button audience-delete" id="delete-audience" type="button">Delete demo responses</button>
      <p id="audience-status" role="status"></p>
    </div>`;
  };
  document.querySelector("#audience-nav").addEventListener("click", () => openDialog(markup()));
  content.addEventListener("submit", event => {
    if (event.target.id !== "audience-form") return;
    event.preventDefault();
    const error = document.querySelector("#audience-error");
    try {
      const row = validateResponse(Object.fromEntries(new FormData(event.target)));
      const rows = readAudience(localStorage);
      saveAudience(localStorage, [...rows, row]);
    } catch (reason) {
      error.textContent = reason.message.startsWith("Choose") || reason.message.startsWith("This demo") ? reason.message : "Could not save your response. Enable browser storage or free up space and try again. Your answers are still here.";
      error.hidden = false;
      return;
    }
    content.innerHTML = markup();
    document.querySelector("#audience-status").textContent = "Response saved in this browser only.";
    content.querySelector('[name="age"]').focus();
  });
  content.addEventListener("click", event => {
    if (!event.target.closest("#delete-audience")) return;
    try {
      localStorage.removeItem(AUDIENCE_KEY);
      content.innerHTML = markup();
      document.querySelector("#audience-status").textContent = "Demo responses deleted from this browser.";
      document.querySelector("#delete-audience").focus();
    } catch {
      document.querySelector("#audience-status").textContent = "Could not delete responses. Enable browser storage and try again.";
    }
  });
}
