import { test, expect } from "@playwright/test";
import { activities, filterActivities } from "../src/catalog.js";
import { demoProfiles, profilePreferences, FINDER_FEEDBACK_KEY } from "../src/finder.js";
import { createSubmission, reviewSubmission } from "../src/submissions.js";

const cards = page => page.locator("#cards .card");
const ids = page => cards(page).locator(".image-open").evaluateAll(nodes => nodes.map(node => node.dataset.details));

test("three profiles match normal filtering and manual city, interest and budget changes update results", async ({ page }) => {
  await page.goto("/");
  const observed = [];
  for (const profile of demoProfiles) {
    await page.getByRole("button", { name: profile.name, exact: true }).click();
    const expected = filterActivities(activities, profilePreferences(profile)).map(item => item.id);
    expect(expected.length).toBeGreaterThan(0);
    await expect(cards(page)).toHaveCount(expected.length);
    expect(await ids(page)).toEqual(expected);
    observed.push(expected);
    await expect(page.locator("#finder-preferences")).toContainText(profile.city);
    await expect(page.locator("#finder-preferences")).toContainText(profile.type);
    await expect(page.getByLabel("Choose a city")).toHaveValue(profile.city);
    await expect(page.getByRole("region", { name: "Discover experiences", exact: true }).getByLabel("Activity type", { exact: true })).toHaveValue(profile.type);
    await expect(page.getByLabel("Budget per person")).toHaveValue(profile.budget);
  }
  expect(new Set(observed.map(value => JSON.stringify(value))).size).toBe(3);
  await page.getByRole("button", { name: "Free Outdoor Explorer", exact: true }).click();
  await page.getByLabel("Budget per person").selectOption("20");
  expect(await ids(page)).not.toEqual(observed[0]);
  await expect(page.locator("#finder-preferences")).toContainText("$20 or less");
  await page.getByLabel("Choose a city").selectOption("Austin");
  await expect(cards(page)).toHaveCount(1);
  expect(await ids(page)).toEqual(["austin-garden"]);
  await page.getByRole("region", { name: "Discover experiences", exact: true }).getByLabel("Activity type", { exact: true }).selectOption("Nightlife");
  expect(await ids(page)).toEqual(["austin-music"]);
  await expect(page.locator("#finder-preferences")).toContainText("Nightlife");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "My plans", exact: false }).first().click();
  await expect(page.locator("#event-finder")).toBeHidden();
});

test("feedback saves both ratings, comment and current preferences/results across reload", async ({ page }) => {
  await page.goto("/");
  for (const [index, label] of ["Helpful", "Not helpful"].entries()) {
    const profile = demoProfiles[index];
    await page.getByRole("button", { name: profile.name, exact: true }).click();
    const resultIds = await ids(page);
    await page.getByRole("button", { name: "Give Event Finder feedback", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("radio", { name: label, exact: true }).check();
    if (!index) await dialog.getByLabel("Optional comment").fill("<script>Useful matches</script>");
    await dialog.getByRole("button", { name: "Save Event Finder feedback", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator("#finder-feedback-status")).toContainText("saved in this browser only");
    const rows = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), FINDER_FEEDBACK_KEY);
    expect(rows[index].resultIds).toEqual(resultIds);
    expect(rows[index].preferences).toEqual(profilePreferences(profile));
    expect(rows[index].rating).toBe(index ? "not-helpful" : "helpful");
    expect(rows[index].comment).toBe(index ? "" : "<script>Useful matches</script>");
    await page.reload();
  }
  const rows = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), FINDER_FEEDBACK_KEY);
  expect(rows).toHaveLength(2);
});

test("feedback storage failure keeps answers and permits retry", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Give Event Finder feedback", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "Helpful", exact: true }).check();
  await dialog.getByLabel("Optional comment").fill("Keep my response");
  await page.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw Error("full"); }; });
  await dialog.getByRole("button", { name: "Save Event Finder feedback", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Could not save feedback");
  await expect(dialog.getByLabel("Optional comment")).toHaveValue("Keep my response");
  await expect(dialog.getByRole("radio", { name: "Helpful", exact: true })).toBeChecked();
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  await dialog.getByRole("button", { name: "Save Event Finder feedback", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test("matching approved organizer events join profile results while pending and rejected stay hidden", async ({ page }) => {
  const input = { title: "Community park walk", venue: "Demo Park", organizer: "Walk collective", description: "A free outdoor gathering.", city: "Chicago", category: "Outdoors", time: "Daytime", startDate: "2099-06-10", endDate: "2099-06-10", url: "https://example.org/walk", pricing: "free", price: "" };
  const pending = createSubmission(input, "pending-finder");
  const item = createSubmission({ ...input, title: "Approved park walk" }, "approved-finder");
  const approved = reviewSubmission(item, [item], { action: "approve", reviewer: "Team", reason: "Checked listing." });
  const other = createSubmission({ ...input, title: "Rejected park walk" }, "rejected-finder");
  const rejected = reviewSubmission(other, [other], { action: "reject", reviewer: "Team", reason: "Not suitable." });
  await page.goto("/");
  await page.evaluate(items => localStorage.setItem("alpas-organizer-events", JSON.stringify(items)), [pending, approved, rejected]);
  await page.reload();
  await page.getByRole("button", { name: "Free Outdoor Explorer", exact: true }).click();
  expect(await ids(page)).toEqual([approved.id, ...filterActivities(activities, profilePreferences(demoProfiles[0])).map(item => item.id)]);
  await page.reload();
  await page.getByRole("button", { name: "Free Outdoor Explorer", exact: true }).click();
  await expect(cards(page).filter({ hasText: "Approved park walk" })).toHaveCount(1);
});
