import { readSubmissions, reviewSubmission, storeSubmissions, submissionIssues } from "./submissions.js";

export function verificationHistory(item, escape) {
  if (!item.history?.length) return '<p>No team decisions yet.</p>';
  return `<ol class="verification-history">${item.history.map((entry) => `<li><strong>${escape(entry.status[0].toUpperCase() + entry.status.slice(1))}</strong> · Verified by ${escape(entry.reviewer)}<br><time datetime="${escape(entry.timestamp)}">${escape(new Date(entry.timestamp).toLocaleString())}</time><p>Action: ${escape(entry.action)} · Reason: ${escape(entry.reason)}</p>${entry.resolutions.length ? `<ul>${entry.resolutions.map((resolution) => `<li>Resolved ${escape(resolution.key)}: ${escape(resolution.reason)}</li>`).join("")}</ul>` : ""}</li>`).join("")}</ol>`;
}

export function setupReview({ openDialog, escape, getItems, onChange }) {
  const content = document.querySelector("#dialog-content");
  const markup = (items) => `<div class="organizer-body review-body">
    <div class="eyebrow">EVENT VERIFICATION</div><h2 id="dialog-title">Team Review</h2>
    <p class="submission-note">Class prototype: review and visitor listings are saved in this browser only. Reviewer names are self-reported, not authenticated. Existing submissions without review history return to Pending.</p>
    <p>Approve only after checking the organizer's information. Resolve each warning explicitly with a reason. Dates use this browser's local calendar.</p>
    <p id="review-status" role="status"></p>
    ${items.length ? [...items].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending")).map((item) => {
      const issues = submissionIssues(item, [...items, ...getItems()]);
      return `<article class="review-event" aria-labelledby="review-title-${escape(item.id)}">
        <h3 id="review-title-${escape(item.id)}">${escape(item.title)}</h3>
        <p><strong class="event-status ${escape(item.status)}">${escape(item.status[0].toUpperCase() + item.status.slice(1))}</strong> · ${escape(item.organizer)}</p>
        <p>${escape(item.venue)} · ${escape(item.city)} · ${escape(item.category)}<br>${escape(item.startDate)} – ${escape(item.endDate)} · ${escape(item.time)}<br>${item.price === null ? "Price unknown" : `$${escape(item.price)} per person`}</p>
        <p>${escape(item.description)}</p><a class="text-button" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Check organizer website (opens in a new tab)</a>
        ${issues.length ? `<ul class="review-warnings">${issues.map((issue) => `<li>${escape(issue.label)}</li>`).join("")}</ul>` : '<p>No duplicate or stale-date flags.</p>'}
        ${item.status === "pending" || item.status === "approved" ? `<form class="review-form organizer-form" data-review="${escape(item.id)}">
          <label class="wide">Reviewer name<input name="reviewer" required maxlength="100" autocomplete="name"></label>
          <label class="wide">Review reason<textarea name="reason" required maxlength="1500" rows="2"></textarea></label>
          ${item.status === "pending" ? issues.map((issue, index) => `<fieldset class="wide review-resolution" data-issue="${escape(issue.key)}"><legend>Resolve warning ${index + 1}</legend><p>${escape(issue.label)}</p><label class="review-check"><input type="checkbox" name="resolved">I checked and resolved this warning</label><label>Resolution reason<textarea name="resolution" maxlength="1500" rows="2"></textarea></label></fieldset>`).join("") : ""}
          <p class="form-error wide" role="alert" hidden></p>
          <div class="form-actions wide">${item.status === "pending" ? '<button class="primary" name="action" value="approve">Approve</button><button class="secondary" name="action" value="reject">Reject</button>' : '<button class="secondary" name="action" value="cancel">Mark Cancelled</button>'}</div>
        </form>` : ""}
        <details class="review-history"><summary>Verification history</summary>${verificationHistory(item, escape)}</details>
      </article>`;
    }).join("") : '<p>No organizer submissions yet. Use Add an event to submit one for review.</p>'}
  </div>`;

  document.querySelector("#review-nav").addEventListener("click", () => {
    try {
      const items = readSubmissions(localStorage);
      onChange(items);
      openDialog(markup(items));
    } catch {
      openDialog('<div class="organizer-body"><h2 id="dialog-title">Team Review</h2><p role="alert">Browser storage is unavailable. Enable site storage to review saved submissions.</p></div>');
    }
  });
  content.addEventListener("submit", (event) => {
    const form = event.target;
    if (!form.matches("[data-review]")) return;
    event.preventDefault();
    const error = form.querySelector('[role="alert"]');
    let next;
    try {
      // Re-read before deciding so a stale queue cannot approve a new warning unseen.
      const items = readSubmissions(localStorage);
      const item = items.find((value) => value.id === form.dataset.review);
      if (!item) throw new Error("This event is no longer available. Reopen Team Review.");
      const updated = reviewSubmission(item, [...items, ...getItems()], {
        reviewer: form.elements.reviewer.value,
        reason: form.elements.reason.value,
        action: event.submitter?.value,
        resolutions: [...form.querySelectorAll("[data-issue]")].map((field) => ({
          key: field.dataset.issue,
          resolved: field.querySelector('[name="resolved"]').checked,
          reason: field.querySelector('[name="resolution"]').value,
        })),
      });
      next = items.map((value) => value.id === updated.id ? updated : value);
      storeSubmissions(localStorage, next);
    } catch (reason) {
      error.textContent = reason.name === "QuotaExceededError" || reason.name === "SecurityError"
        ? "Could not save this decision. Enable browser storage or free up space and retry. Your answers are still here."
        : reason.message;
      error.hidden = false;
      return;
    }
    onChange(next);
    content.innerHTML = markup(next);
    const status = content.querySelector("#review-status");
    status.textContent = "Decision saved in this browser. Visitor listings have been updated.";
    status.tabIndex = -1;
    status.focus();
  });
}
