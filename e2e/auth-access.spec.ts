import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const clientEmail = process.env.E2E_CLIENT_EMAIL;
const clientPassword = process.env.E2E_CLIENT_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("logged-out user cannot access /admin/dashboard", async ({ page }) => {
  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fdashboard/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test.describe("authenticated route access", () => {
  test.skip(
    !adminEmail || !adminPassword || !clientEmail || !clientPassword,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_CLIENT_EMAIL, and E2E_CLIENT_PASSWORD to run authenticated e2e tests.",
  );

  test("client cannot access /admin/dashboard", async ({ page }) => {
    await signIn(page, clientEmail!, clientPassword!);
    await page.goto("/admin/dashboard");

    await expect(page).toHaveURL(/\/client\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  });

  test("admin can access /admin/dashboard", async ({ page }) => {
    await signIn(page, adminEmail!, adminPassword!);
    await page.goto("/admin/dashboard");

    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "Delivery overview" }),
    ).toBeVisible();
  });

  test("client can access /client/dashboard", async ({ page }) => {
    await signIn(page, clientEmail!, clientPassword!);
    await page.goto("/client/dashboard");

    await expect(page).toHaveURL(/\/client\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  });
});
