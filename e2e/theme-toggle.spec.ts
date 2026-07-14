import { expect, test, type Page } from "@playwright/test";

async function enterDemo(page: Page, role: "admin" | "client") {
  await page.goto("/login");
  const destination =
    role === "admin"
      ? /\/admin\/dashboard$/
      : /\/client\/(dashboard|overview)$/;

  await page
    .getByRole("button", {
      name: role === "admin" ? "View admin demo" : "View client demo",
    })
    .click();

  await page.waitForURL(destination, { timeout: 60_000 });
}

test.describe("theme toggle", () => {
  test.describe.configure({ timeout: 120_000 });

  test("owner preference persists through reload and admin navigation", async ({
    page,
  }) => {
    await enterDemo(page, "admin");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    const toggle = page.getByRole("button", { name: "Switch to dark mode" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("[data-dashboard-theme]")).toHaveAttribute(
      "data-dashboard-theme",
      "dark",
    );
    await expect(
      page.getByRole("button", { name: "Switch to light mode" }),
    ).toBeVisible();

    await page.reload();
    await expect(page.locator("[data-dashboard-theme]")).toHaveAttribute(
      "data-dashboard-theme",
      "dark",
    );

    await page.goto("/admin/projects");
    await expect(page.locator("[data-dashboard-theme]")).toHaveAttribute(
      "data-dashboard-theme",
      "dark",
    );
  });

  test("client can switch back to light mode", async ({ page }) => {
    await enterDemo(page, "client");
    await expect(page).toHaveURL(/\/client\/(dashboard|overview)$/);

    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("[data-dashboard-theme]")).toHaveAttribute(
      "data-dashboard-theme",
      "dark",
    );

    await page.getByRole("button", { name: "Switch to light mode" }).click();
    await expect(page.locator("[data-dashboard-theme]")).toHaveAttribute(
      "data-dashboard-theme",
      "light",
    );

    await page.reload();
    await expect(page.locator("[data-dashboard-theme]")).toHaveAttribute(
      "data-dashboard-theme",
      "light",
    );
  });

  test("landing and login remain light with no theme toggle", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });
    const publicPage = await context.newPage();

    await publicPage.goto("/");
    await expect(publicPage.locator("html")).not.toHaveClass(/dark/);
    await expect(publicPage.locator("[data-dashboard-theme]")).toHaveCount(0);
    await expect(
      publicPage.getByRole("button", { name: /Switch to (dark|light) mode/ }),
    ).toHaveCount(0);

    await publicPage.goto("/login");
    await expect(publicPage.locator("html")).not.toHaveClass(/dark/);
    await expect(publicPage.locator("[data-dashboard-theme]")).toHaveCount(0);
    await expect(
      publicPage.getByRole("button", { name: /Switch to (dark|light) mode/ }),
    ).toHaveCount(0);

    await context.close();
  });
});
