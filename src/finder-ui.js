import { demoProfiles, profilePreferences, finderPreferences, preferenceSummary, saveFinderFeedback } from "./finder.js";

export function setupFinder({ openDialog, escape, applyPreferences }) {
  const panel = document.querySelector("#event-finder");
  panel.innerHTML = `<h2>Preference-Based Event Finder</h2>
    <p>Choose your city, interest (Activity type), and budget using the Explore controls, or try a fictional demo profile.</p>
    <div class="finder-profiles" role="group" aria-label="Fictional demo profiles">${demoProfiles.map((profile, index) => `<button class="secondary" type="button" data-finder-profile="${index}">${escape(profile.name)}</button>`).join("")}</div>
    <p id="finder-preferences" role="status"></p>
    <button class="text-button" type="button" id="finder-feedback">Give Event Finder feedback</button>
    <p id="finder-feedback-status" role="status"></p>`;
  let snapshot;
  panel.addEventListener("click", event => {
    const profileButton = event.target.closest("[data-finder-profile]");
    if (profileButton) applyPreferences(profilePreferences(demoProfiles[Number(profileButton.dataset.finderProfile)]));
    if (!event.target.closest("#finder-feedback")) return;
    const context = structuredClone(snapshot);
    openDialog(`<div class="finder-feedback-body"><h2 id="dialog-title">Event Finder feedback</h2>
      <p>${escape(preferenceSummary(context.preferences))} · ${context.resultIds.length} results</p>
      <p>Feedback stays in this browser with these preferences and result IDs. Please avoid personal information.</p>
      <form id="finder-feedback-form" class="finder-feedback-form">
        <fieldset><legend>Were these results helpful?</legend>
          <label><input type="radio" name="rating" value="helpful" required> Helpful</label>
          <label><input type="radio" name="rating" value="not-helpful" required> Not helpful</label></fieldset>
        <label>Optional comment<textarea name="comment" maxlength="1000" rows="4"></textarea></label>
        <p id="finder-feedback-error" role="alert" hidden></p>
        <button class="primary" type="submit">Save Event Finder feedback</button>
      </form></div>`);
    document.querySelector("#finder-feedback-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      try {
        saveFinderFeedback(localStorage, { ...context, ...Object.fromEntries(new FormData(form)) });
      } catch {
        const error = form.querySelector("#finder-feedback-error");
        error.textContent = "Could not save feedback. Check browser storage or the demo response limit and try again. Your answers are still here.";
        error.hidden = false;
        return;
      }
      document.querySelector("#details-dialog").close();
      document.querySelector("#finder-feedback-status").textContent = "Feedback saved in this browser only.";
    });
  });
  return {
    update(state, items) {
      panel.hidden = state.view !== "explore";
      snapshot = { preferences: finderPreferences(state), resultIds: items.map(item => item.id) };
      document.querySelector("#finder-preferences").textContent = `Active preferences: ${preferenceSummary(snapshot.preferences)}`;
    },
  };
}
