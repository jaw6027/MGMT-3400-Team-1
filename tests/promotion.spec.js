import { test, expect } from "@playwright/test";

async function openCalculator(page) {
  await page.goto("/");
  await page.getByRole("group", { name: "Organizer and business tools" })
    .getByRole("button", { name: "Promotion calculator", exact: true }).click();
  return page.getByRole("group", { name: "Sample scenario A", exact: true });
}
const metric = (row, name) => row.locator(`[data-metric="${name}"]`);

test("sample scenarios independently recalculate partner revenue, profit, and break-even progress immediately", async ({ page }) => {
  const row = await openCalculator(page);
  const other = page.getByRole("group", { name: "Sample scenario B", exact: true });
  await expect(page.getByRole("dialog")).toContainText("SAMPLE ASSUMPTIONS");
  await expect(metric(row, "revenue")).toHaveText("$1,000.00");
  await expect(metric(row, "costs")).toHaveText("$1,400.00");
  await expect(metric(row, "profit")).toHaveText("-$400.00");
  await expect(metric(row, "breakEvenPartners")).toHaveText("8");
  await expect(metric(row, "additionalPartners")).toHaveText("3");
  await expect(metric(other, "revenue")).toHaveText("$2,250.00");
  await row.getByLabel("Number of paying partners").fill("10");
  await expect(metric(row, "revenue")).toHaveText("$2,000.00");
  await expect(metric(row, "profit")).toHaveText("$400.00");
  await expect(metric(row, "breakEvenPartners")).toHaveText("8");
  await expect(metric(row, "additionalPartners")).toHaveText("0");
  await expect(row).toContainText("Break-even reached");
  await expect(metric(other, "revenue")).toHaveText("$2,250.00");
  await other.getByLabel("Number of paying partners").fill("2");
  await expect(metric(other, "revenue")).toHaveText("$900.00");
  await expect(metric(other, "additionalPartners")).toHaveText("2");
  await expect(metric(row, "revenue")).toHaveText("$2,000.00");
  await row.getByLabel("Number of paying partners").fill("0");
  await expect(metric(row, "revenue")).toHaveText("$0.00");
  await expect(metric(row, "profit")).toHaveText("-$1,200.00");
  await expect(metric(row, "additionalPartners")).toHaveText("8");
});

test("changing each price, frequency, and cost input updates the threshold", async ({ page }) => {
  const row = await openCalculator(page);
  for (const [label, value, threshold, reset] of [
    ["Price per promoted event (USD)", "90", "4", "50"],
    ["Events per partner per year", "2", "15", "4"],
    ["Fixed annual costs (USD)", "2400", "15", "1200"],
    ["Variable cost per promoted event (USD)", "20", "10", "10"],
  ]) {
    await row.getByLabel(label, { exact: true }).fill(value);
    await expect(metric(row, "breakEvenPartners")).toHaveText(threshold);
    await row.getByLabel(label, { exact: true }).fill(reset);
    await expect(metric(row, "breakEvenPartners")).toHaveText("8");
  }
});

test("invalid assumptions remove stale results; zero or negative margins show no misleading threshold", async ({ page }) => {
  const row = await openCalculator(page);
  for (const [label, value] of [
    ["Number of paying partners", ""], ["Number of paying partners", "-1"],
    ["Number of paying partners", "1.5"], ["Price per promoted event (USD)", "0.001"],
  ]) {
    await row.getByLabel(label, { exact: true }).fill(value);
    await expect(row.getByRole("alert")).toBeVisible();
    await expect(metric(row, "revenue")).toHaveCount(0);
    await row.getByLabel(label, { exact: true }).fill(label.includes("Price") ? "50" : "5");
    await expect(metric(row, "revenue")).toHaveText("$1,000.00");
  }
  await row.getByLabel("Price per promoted event (USD)", { exact: true }).fill("10");
  await expect(metric(row, "breakEvenPartners")).toHaveText("Not applicable");
  await expect(metric(row, "additionalPartners")).toHaveText("Not applicable");
  await expect(row).toContainText("No positive contribution");
  await row.getByLabel("Price per promoted event (USD)", { exact: true }).fill("5");
  await expect(row).toContainText("Each additional partner increases the loss");
  await expect(metric(row, "profit")).toHaveText("-$1,300.00");
  await row.getByLabel("Events per partner per year").fill("0");
  await expect(metric(row, "revenue")).toHaveText("$0.00");
  await expect(metric(row, "profit")).toHaveText("-$1,200.00");
  await expect(row).toContainText("No events are promoted");
});

test("calculator retains session assumptions, fits the viewport, and leaves existing app storage alone", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Save See Chicago from the river to plans", exact: true }).click();
  const before = await page.evaluate(() => Object.entries(localStorage));
  await page.getByRole("button", { name: "Promotion calculator", exact: true }).click();
  const row = page.getByRole("group", { name: "Sample scenario A", exact: true });
  await row.getByLabel("Price per promoted event (USD)", { exact: true }).fill("150");
  await expect(metric(row, "revenue")).toHaveText("$3,000.00");
  expect(await page.getByRole("dialog").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  const formulas = page.getByText("How the calculations work", { exact: true });
  await formulas.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".promotion-formulas")).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close dialog" })).toBeFocused();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Promotion calculator", exact: true }).click();
  await expect(row.getByLabel("Price per promoted event (USD)", { exact: true })).toHaveValue("150");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Promotion calculator", exact: true })).toBeFocused();
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(before);
  await page.getByRole("button", { name: /^My plans/ }).click();
  await expect(page.locator("#plan-summary strong")).toHaveText("$55");
  await expect(page.locator(".card .price strong")).toHaveText("$55");
});
