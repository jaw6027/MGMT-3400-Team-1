import { test, expect } from "@playwright/test";

test("audience survey summarizes local responses, persists and deletes only survey data", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("alpas-plans", '["chicago-river"]'),
  );
  await page
    .getByRole("button", { name: "Audience insights", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("No responses yet.", { exact: false }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Add survey response" }).click();
  await expect(dialog.getByRole("alert")).toContainText("at least one answer");
  await dialog.getByLabel("Age range").selectOption("18–24");
  await dialog.getByLabel("Life stage").selectOption("Student");
  await dialog.getByLabel("Local or visiting?").selectOption("Local resident");
  await dialog.getByRole("button", { name: "Add survey response" }).click();
  await expect(
    dialog.getByRole("heading", { name: "1 survey response", exact: true }),
  ).toBeVisible();
  await dialog.getByLabel("Age range").selectOption("25–34");
  await dialog.getByRole("button", { name: "Add survey response" }).click();
  await expect(
    dialog.getByRole("meter", { name: "18–24: 1 responses, 50%", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Audience insights", exact: true })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "2 survey responses", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Delete demo responses" }).click();
  await expect(
    dialog.getByRole("heading", { name: "0 survey responses", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("alpas-plans"))).toBe(
    '["chicago-river"]',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("audience storage failure preserves answers and does not count a response", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Audience insights", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Age range").selectOption("18–24");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw Error("Storage full");
    };
  });
  await dialog.getByRole("button", { name: "Add survey response" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Could not save");
  await expect(dialog.getByLabel("Age range")).toHaveValue("18–24");
  await expect(
    dialog.getByRole("heading", { name: "0 survey responses", exact: true }),
  ).toBeVisible();
});

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
  for (const image of await page.locator("img:visible").all()) {
    await image.scrollIntoViewIfNeeded();
  }
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
  await expect(page.locator(".card")).toHaveCount(20);
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
  await expect(page.locator(".card")).toHaveCount(2);
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

test("Bakersfield seasonal listings, free ideas and uncertain prices work together", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Choose a city").selectOption("Bakersfield");
  await page
    .getByRole("button", { name: "Seasonal events", exact: true })
    .click();
  await expect(page.locator(".card")).toHaveCount(4);
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.getByLabel("Season", { exact: true }).selectOption("Winter");
  await expect(page.locator(".card")).toHaveCount(2);
  await page
    .getByRole("button", {
      name: "Explore See the season sparkle at CALM",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "seasonal dates are typical, not confirmed",
  );
  await expect(page.getByRole("dialog")).toContainText(
    "Check price with organizer",
  );
  await page.getByRole("button", { name: "Save to my plans" }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: /^My plans/ }).click();
  await expect(page.locator("#plan-summary")).toContainText("1 price to check");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByLabel("Budget per person").selectOption("0");
  await expect(page.locator(".card")).toHaveCount(5);
  await expect(page.locator(".card")).not.toContainText(["Check price"]);
});

test("organizer submits for review, reviewer approves and cancels, history survives reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add an event +" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(
    "submissions start Pending and stay hidden from Explore",
  );
  const title = "Acoustic night <img src=x onerror=alert(1)>";
  await page.getByLabel("Event title", { exact: true }).fill(title);
  await page.getByLabel("Organizer name").fill("Neighbors & friends");
  await page.getByLabel("Venue", { exact: true }).fill("Local community hall");
  await page.getByLabel("Event city").selectOption("Bakersfield");
  await page.getByLabel("Event category").selectOption("Music & nightlife");
  await page.getByLabel("Start date").fill("2027-12-10");
  await page.getByLabel("End date").fill("2027-12-09");
  await page.getByLabel("Event time of day").selectOption("Evening");
  await page.getByLabel("Admission", { exact: true }).selectOption("paid");
  await page.getByLabel("Ticket price per person (USD)").fill("12.50");
  await page.getByLabel("Event website").fill("https://example.org/event");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Bring a friend. Doors at 7pm. All ages.");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "end date must be on or after",
  );
  await page.getByLabel("End date").fill("2027-12-10");
  await page.getByLabel("Event website").fill("http://example.org/event");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("alert")).toContainText("Use an HTTPS");
  await page.getByLabel("Event website").fill("https://example.org/event");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".card h3").filter({ hasText: title })).toHaveCount(0);
  await page.getByRole("button", { name: "Team Review", exact: true }).click();
  const review = page.locator(".review-event").filter({ hasText: title });
  await expect(review.locator(".event-status")).toHaveText("Pending");
  await expect(review.locator("h3 img")).toHaveCount(0);
  await review.getByLabel("Reviewer name").fill("Member 1");
  await review.getByLabel("Review reason", { exact: true }).fill("Confirmed event details with organizer.");
  await review.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(review.locator(".event-status")).toHaveText("Approved");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".card h3").first()).toHaveText(title);
  await expect(page.locator(".card").first()).toContainText("$12.5");
  await expect(page.locator(".card").first()).toContainText(
    "Organizer submission · local",
  );
  await expect(page.locator(".card h3 img")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Choose a city").selectOption("Bakersfield");
  await page.getByRole("searchbox").fill("Acoustic night");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator(".card .save-button").click();
  await page.reload();
  await page.getByRole("button", { name: /^My plans/ }).click();
  await expect(page.locator(".card h3")).toHaveText(title);
  await page.locator(".details-button").click();
  await expect(dialog).toContainText("Neighbors & friends");
  await expect(dialog).toContainText("Verified by Member 1");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Team Review", exact: true }).click();
  await review.getByLabel("Reviewer name").fill("Member 2");
  await review.getByLabel("Review reason", { exact: true }).fill("Organizer confirmed cancellation.");
  await review.getByRole("button", { name: "Mark Cancelled" }).click();
  await expect(review.locator(".event-status")).toHaveText("Cancelled");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".card")).toContainText("Cancelled");
  await expect(page.locator("#plan-summary")).toContainText("excluded from the estimated total");
  await expect(page.locator("#plan-summary strong")).toHaveText("$0");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByLabel("Choose a city").selectOption("Bakersfield");
  await page.getByRole("searchbox").fill("Acoustic night");
  await expect(page.locator(".card")).toContainText("Cancelled");
  await page.reload();
  await page.getByRole("button", { name: /^My plans/ }).click();
  await expect(page.locator(".card")).toContainText("Cancelled");
  await page.locator(".details-button").click();
  await expect(dialog).toContainText("Cancelled · no longer available");
  await expect(dialog).toContainText("Verified by Member 2");
  await expect(dialog).toContainText("Organizer confirmed cancellation.");
  await expect(dialog.locator("time")).toHaveCount(2);
  await expect(dialog.getByRole("link", { name: /Official website/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Team Review", exact: true }).click();
  await review.getByText("Verification history", { exact: true }).click();
  await expect(review).toContainText("Verified by Member 2");
  await expect(review.getByRole("button", { name: "Approve", exact: true })).toHaveCount(0);
});

test("failed event storage preserves the form and does not claim success", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add an event +" }).click();
  await page
    .getByLabel("Event title", { exact: true })
    .fill("Community picnic");
  await page.getByLabel("Organizer name").fill("Neighbors");
  await page.getByLabel("Venue", { exact: true }).fill("Park");
  await page.getByLabel("Start date").fill("2027-06-01");
  await page.getByLabel("Event website").fill("https://example.org/picnic");
  await page.getByLabel("Description", { exact: true }).fill("Bring a picnic.");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
  });
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "could not save this event",
  );
  await expect(page.getByLabel("Event title", { exact: true })).toHaveValue(
    "Community picnic",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(6);
});
