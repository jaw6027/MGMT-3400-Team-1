import { test, expect } from "@playwright/test";

test("discovery filters, empty state, city selection and sorting", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".card")).toHaveCount(6);
  await page.getByRole("button", { name: "Outdoors", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(2);
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.getByLabel("Budget per person").selectOption("0");
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toHaveText("Meet you at the Bean");
  await page.getByLabel("Time of day").selectOption("Evening");
  await expect(page.locator(".card")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search & filters" }).click();
  await expect(page.locator(".card")).toHaveCount(6);
  await page.getByRole("searchbox").fill("JAZZ");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.getByRole("searchbox").fill("<script>alert(1)</script>");
  await expect(page.locator(".card")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search & filters" }).click();
  await page.getByLabel("Choose a city").selectOption("New York");
  await expect(page.locator(".card")).toHaveCount(3);
  await page.getByLabel("Sort experiences").selectOption("price-high");
  await expect(page.locator(".card h3").first()).toHaveText(
    "A Greenwich Village kind of night",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("details, official links and persistent cross-city plans", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Explore See Chicago from the river",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: /Official website/ }),
  ).toHaveAttribute("href", "https://www.architecture.org/rivercruise");
  await expect(
    dialog.getByRole("link", { name: /Official website/ }),
  ).toHaveAttribute("rel", "noopener noreferrer");
  await dialog.getByRole("button", { name: "Save to my plans" }).click();
  await expect(
    dialog.getByRole("button", { name: "Saved to my plans" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.getByLabel("Choose a city").selectOption("Austin");
  await page
    .getByRole("button", { name: "Save Find your own patch of calm to plans" })
    .click();
  await page.reload();
  await page.getByRole("button", { name: /^My plans/ }).click();
  await expect(page.locator(".card")).toHaveCount(2);
  await expect(page.locator("#plan-summary")).toContainText("$63");
  await page
    .getByRole("button", {
      name: "Remove See Chicago from the river from plans",
    })
    .click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Remove Find your own patch of calm from plans",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good plans start with a favorite." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Find an adventure" }).click();
  await expect(page.locator(".card")).toHaveCount(6);
});

test("dialog traps keyboard focus, About explains demo, local assets load and layout fits", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "A little about Alpas" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "does not provide live event inventory",
  );
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      document.querySelector("dialog").contains(document.activeElement),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/alpas-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("Bakersfield has local activities, filters, an official calendar and saved plans", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Choose a city").selectOption("Bakersfield");
  await expect(
    page.getByRole("heading", {
      name: "A little inspiration for Bakersfield.",
    }),
  ).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(6);
  await expect(page.locator(".venue")).toContainText([
    "California Living Museum (CALM)",
    "Bakersfield Museum of Art",
    "Bakersfield Fox Theater",
    "Kern County Museum",
    "Hart Memorial Park",
    "Wool Growers Restaurant",
  ]);
  await page
    .getByRole("button", { name: "Music & nightlife", exact: true })
    .click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Explore Make a night of it at the Fox",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "not a confirmed concert listing",
  );
  await expect(
    page.getByRole("link", { name: /Official website/ }),
  ).toHaveAttribute("href", "https://thebakersfieldfox.com/");
  await page.getByRole("button", { name: "Save to my plans" }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: /^My plans/ }).click();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card")).toContainText("Bakersfield Fox Theater");
});
