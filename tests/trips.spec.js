import { test, expect } from "@playwright/test";

test("pick a starting city, drive range and activity type with useful empty recovery", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nearby trips", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Trips from Bakersfield" }),
  ).toBeVisible();
  await expect(page.locator("#trip-cards .card")).toHaveCount(18);
  await page.getByRole("button", { name: /Under 1 hour/ }).click();
  await expect(page.locator("#trip-cards .card")).toHaveCount(3);
  await page
    .getByRole("combobox", { name: "Activity type", exact: true })
    .selectOption("Theme parks");
  await expect(
    page.getByRole("heading", { name: "No curated trips in this range yet." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset trip filters" }).click();
  await expect(page.locator("#trip-cards .card")).toHaveCount(18);
  await page
    .getByRole("combobox", { name: "Activity type", exact: true })
    .selectOption("Theme parks");
  await page.getByRole("button", { name: /1–3 hours/ }).click();
  await expect(page.locator("#trip-cards .card")).toHaveCount(3);
  await expect(page.locator("#trip-cards")).toContainText(
    "Six Flags Magic Mountain",
  );
  await page
    .getByLabel("Starting city", { exact: true })
    .selectOption("Chicago");
  await expect(
    page.getByRole("heading", { name: "Trips from Chicago" }),
  ).toBeVisible();
  await expect(page.locator("#trip-cards .card")).toHaveCount(1);
  await expect(page.locator("#trip-cards")).toContainText(
    "Six Flags Great America",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("trip details explain estimates and costs, and saved trips survive reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nearby trips", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Explore Stand among the giant sequoias",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("About 2 hr 50 min one way by car");
  await expect(dialog).toContainText("per vehicle, not per person");
  await expect(dialog).toContainText("winter can bring snow");
  await expect(
    dialog.getByRole("link", { name: /Official website/ }),
  ).toHaveAttribute("href", "https://www.nps.gov/seki/");
  const route = new URL(
    await dialog
      .getByRole("link", { name: /Check driving route/ })
      .getAttribute("href"),
  );
  expect(route.searchParams.get("origin")).toBe("Bakersfield, USA");
  expect(route.searchParams.get("destination")).toContain("Giant Forest");
  await dialog.getByRole("button", { name: "Save to my plans" }).click();
  await expect(
    dialog.getByRole("button", { name: "Saved to my plans" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#trip-cards .save-button.is-saved")).toHaveCount(
    1,
  );
  await page.reload();
  await page.getByRole("button", { name: /^My plans/ }).click();
  await expect(page.locator("#cards .card")).toHaveCount(1);
  await expect(page.locator("#cards")).toContainText("from Bakersfield");
  await expect(page.locator("#plan-summary")).toContainText("1 price to check");
  await expect(page.locator("#plan-summary")).toContainText(
    "vehicle-based park fees are not included",
  );
  await page.locator("#cards .details-button").click();
  await expect(dialog).toContainText("TRIPS FROM BAKERSFIELD");
  await dialog.getByRole("button", { name: "Saved to my plans" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Good plans start with a favorite." }),
  ).toBeVisible();
});

test("local activity types compose with existing filters and can lead to nearby theme parks", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Activity type", exact: true })
    .selectOption("Date night");
  await expect(page.locator("#cards .card")).toHaveCount(3);
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.getByLabel("Budget per person").selectOption("20");
  await expect(page.locator("#cards .card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Activity type", exact: true }),
  ).toHaveValue("all");
  await page
    .getByRole("combobox", { name: "Activity type", exact: true })
    .selectOption("Nightlife");
  await expect(page.locator("#cards .card")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Activity type", exact: true })
    .selectOption("Theme parks");
  await expect(page.locator("#cards .card")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Look beyond the city in Nearby trips" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Trips from Chicago" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: "Clear search & filters" }).click();
  await expect(page.locator("#cards .card")).toHaveCount(6);
});
