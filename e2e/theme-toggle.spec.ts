import { expect, test, type Page } from "@playwright/test";

async function enterDemo(page: Page, role: "admin" | "client") {
  await page.goto("/login");
  await page
    .getByRole("button", {
      name: role === "admin" ? "View admin demo" : "View client demo",
    })
    .click();
}

test.describe("theme toggle", () => {
  test("owner preference persists through reload and admin navigation", async ({
    page,
  }) => {
    await enterDemo(page, "admin");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    const toggle = page.getByRole("button", { name: "Switch to dark mode" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(
      page.getByRole("button", { name: "Switch to light mode" }),
    ).toBeVisible();

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.goto("/admin/projects");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("client can switch back to light mode", async ({ page }) => {
    await enterDemo(page, "client");
    await expect(page).toHaveURL(/\/client\/(dashboard|overview)$/);

    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Switch to light mode" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
