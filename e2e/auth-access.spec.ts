import { expect, test } from "@playwright/test";

import { e2eAuth, hasCredentials, signIn } from "./support/auth";

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
  await expect(
    page.getByRole("link", { name: /back to login/i }),
  ).toBeVisible();
});

test.describe("authenticated route access", () => {
  test.skip(
    !hasCredentials(e2eAuth.owner) || !hasCredentials(e2eAuth.client),
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_CLIENT_EMAIL, and E2E_CLIENT_PASSWORD to run authenticated e2e tests.",
  );

  test("client cannot access /admin/dashboard", async ({ page }) => {
    await signIn(page, e2eAuth.client);
    await page.goto("/admin/dashboard");

    await expect(page).toHaveURL(/\/client\/overview$/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("client cannot access /admin/analytics", async ({ page }) => {
    await signIn(page, e2eAuth.client);
    await page.goto("/admin/analytics");

    await expect(page).toHaveURL(/\/client\/overview$/);
  });

  test("admin can access /admin/dashboard", async ({ page }) => {
    await signIn(page, e2eAuth.owner);
    await page.goto("/admin/dashboard");

    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "Delivery overview" }),
    ).toBeVisible();
  });

  test("admin can use workspace analytics", async ({ page }) => {
    await signIn(page, e2eAuth.owner);
    await page.goto("/admin/analytics");

    await expect(page).toHaveURL(/\/admin\/analytics$/);
    await expect(
      page.getByRole("heading", { name: "Analytics" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Analytics" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Performance metrics" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Project health" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "90 days" }).click();
    await expect(page).toHaveURL(/\?range=90d$/);
  });

  test("client can access /client/overview", async ({ page }) => {
    await signIn(page, e2eAuth.client);
    await page.goto("/client/overview");

    await expect(page).toHaveURL(/\/client\/overview$/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });
});
