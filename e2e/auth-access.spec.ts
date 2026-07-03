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

test("login page loads with the sign-in form", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("logged-out user cannot access /admin/dashboard", async ({ page }) => {
  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test("logged-out user cannot access /client/overview", async ({ page }) => {
  await page.goto("/client/overview");

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test("invalid invite route fails safely", async ({ page }) => {
  await page.goto("/invite/not-a-valid-token");

  await expect(
    page.getByRole("heading", { name: "Invalid invite" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /back to login/i })).toBeVisible();
});

test.describe("authenticated route access", () => {
  test.skip(
    !adminEmail || !adminPassword || !clientEmail || !clientPassword,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_CLIENT_EMAIL, and E2E_CLIENT_PASSWORD to run authenticated e2e tests.",
  );

  test("client cannot access /admin/dashboard", async ({ page }) => {
    await signIn(page, clientEmail!, clientPassword!);
    await page.goto("/admin/dashboard");

    await expect(page).toHaveURL(/\/client\/overview$/);
    await expect(
      page.getByRole("heading", { name: "Overview" }),
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

  test("client can access /client/overview", async ({ page }) => {
    await signIn(page, clientEmail!, clientPassword!);
    await page.goto("/client/overview");

    await expect(page).toHaveURL(/\/client\/overview$/);
    await expect(
      page.getByRole("heading", { name: "Overview" }),
    ).toBeVisible();
  });
});
