import { test, expect } from "@playwright/test";
import { createSubmission, reviewSubmission } from "../src/submissions.js";

const form = {
  title: "Community acoustic evening", venue: "Community hall", organizer: "Local collective",
  description: "Local performers and acoustic music.", city: "Bakersfield", category: "Music & nightlife",
  time: "Evening", startDate: "2099-12-10", endDate: "2099-12-11",
  url: "https://example.org/music", pricing: "paid", price: "12.50",
};
const article = (page, id) => page.locator(`article[aria-labelledby="review-title-organizer-${id}"]`);
async function seed(page, items) {
  await page.goto("/");
  await page.evaluate((events) => localStorage.setItem("alpas-organizer-events", JSON.stringify(events)), items);
  await page.reload();
  await page.getByRole("button", { name: "Team Review", exact: true }).click();
}
async function identify(scope) {
  await scope.getByLabel("Reviewer name").fill("Member 1");
  await scope.getByLabel("Review reason", { exact: true }).fill("Reviewed organizer information.");
}

test("duplicate and stale warnings require explicit resolutions that survive reload", async ({ page }) => {
  const target = createSubmission({ ...form, startDate: "2000-01-01", endDate: "2000-01-02" }, "target");
  const duplicate = createSubmission({ ...form, title: " COMMUNITY   ACOUSTIC EVENING ", startDate: "2000-01-02", endDate: "2000-01-03" }, "duplicate");
  await seed(page, [target, duplicate]);
  const review = article(page, "target");
  await expect(review).toContainText("Possible duplicate");
  await expect(review).toContainText("Stale date");
  await identify(review);
  await review.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(review.getByRole("alert")).toContainText("Explicitly resolve every");
  for (const field of await review.locator("[data-issue]").all()) {
    await field.getByRole("checkbox").check();
    await field.getByLabel("Resolution reason").fill("Confirmed separate session; keep as a historical listing.");
  }
  await review.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(review.locator(".event-status")).toHaveText("Approved");
  await page.reload();
  await page.getByRole("button", { name: "Team Review", exact: true }).click();
  await review.getByText("Verification history", { exact: true }).click();
  await expect(review.locator(".verification-history")).toContainText("Resolved stale");
  await expect(review.locator(".verification-history")).toContainText("Resolved duplicate:organizer-duplicate");
  await expect(review.locator(".verification-history time")).toHaveCount(1);
  // Rejection never requires pretending that warnings were resolved.
  const other = article(page, "duplicate");
  await identify(other);
  await other.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(other.locator(".event-status")).toHaveText("Rejected");
  await page.reload();
  await page.getByLabel("Choose a city").selectOption("Bakersfield");
  await page.getByRole("searchbox").fill("acoustic evening");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.getByRole("button", { name: "Team Review", exact: true }).click();
  await expect(other.locator(".event-status")).toHaveText("Rejected");
});

test("failed cancellation save preserves the reviewer form and approved listing", async ({ page }) => {
  const pending = createSubmission(form, "storage");
  const approved = reviewSubmission(pending, [pending], { action: "approve", reviewer: "Member 1", reason: "Confirmed." });
  await seed(page, [approved]);
  const review = article(page, "storage");
  await identify(review);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "QuotaExceededError"); };
  });
  await review.getByRole("button", { name: "Mark Cancelled" }).click();
  await expect(review.getByRole("alert")).toContainText("Could not save this decision");
  await expect(review.getByLabel("Reviewer name")).toHaveValue("Member 1");
  await expect(review.getByLabel("Review reason", { exact: true })).toHaveValue("Reviewed organizer information.");
  await expect(review.locator(".event-status")).toHaveText("Approved");
  await page.reload();
  await page.getByRole("button", { name: "Team Review", exact: true }).click();
  await expect(review.locator(".event-status")).toHaveText("Approved");
  await review.getByText("Verification history", { exact: true }).click();
  await expect(review.locator(".verification-history li")).toHaveCount(1);
});

test("legacy submissions require review and newly introduced duplicate flags block a stale queue", async ({ page }) => {
  const { status, history, ...legacy } = createSubmission(form, "legacy");
  await seed(page, [legacy]);
  const review = article(page, "legacy");
  await expect(review.locator(".event-status")).toHaveText("Pending");
  await identify(review);
  await page.evaluate((duplicate) => {
    const events = JSON.parse(localStorage.getItem("alpas-organizer-events"));
    localStorage.setItem("alpas-organizer-events", JSON.stringify([...events, duplicate]));
  }, createSubmission(form, "later"));
  await review.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(review.getByRole("alert")).toContainText("Explicitly resolve every");
  await page.reload();
  await page.getByLabel("Choose a city").selectOption("Bakersfield");
  await page.getByRole("searchbox").fill(form.title);
  await expect(page.locator(".card")).toHaveCount(0);
});
