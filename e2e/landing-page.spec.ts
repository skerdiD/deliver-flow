import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ),
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

test.describe("public landing page", () => {
  test.describe.configure({ mode: "serial" });

  test("supports navigation, progressive reveals, and experience tabs", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Keep every project clear. Keep every client confident.",
      }),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

    await page.locator("#how-it-works").scrollIntoViewIfNeeded();
    await expect(
      page.locator("#how-it-works .marketing-scroll-reveal").first(),
    ).toHaveClass(/is-revealed/, { timeout: 10_000 });

    await page.locator("#product").scrollIntoViewIfNeeded();
    const firstProductCard = page.locator("#product .marketing-card").first();
    await expect(firstProductCard).toBeVisible();
    await expect(firstProductCard).toHaveCSS("opacity", "1");

    await page.getByRole("tab", { name: "Client portal" }).click();
    await expect(page.getByRole("tab", { name: "Client portal" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      page.getByRole("tabpanel", { name: "Client portal" }),
    ).toContainText("Give clients clarity");
    await expect(
      page.getByRole("link", { name: "Create workspace" }),
    ).toHaveAttribute("href", "/signup");
    await expectNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("mobile navigation is accessible and the page has no overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Product", exact: true })
      .click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expectNoHorizontalOverflow(page);
  });

  test("reduced motion keeps reveal content immediately visible", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const reveal = page.locator(".marketing-scroll-reveal").first();
    await expect(reveal).toHaveCSS("opacity", "1");
    await expect(reveal).toHaveCSS("transition-duration", "0s");
    await expect(page.locator("#product .marketing-card").first()).toHaveCSS(
      "opacity",
      "1",
    );
  });
});
