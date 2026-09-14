import { expect, test, type Page } from "@playwright/test";

import { e2eAuth, hasCredentials, signIn } from "./support/auth";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(
      documentElement.scrollWidth,
      body?.scrollWidth ?? 0,
    );

    return {
      clientWidth: documentElement.clientWidth,
      scrollWidth,
    };
  });

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

async function visitAndCheck(page: Page, route: string) {
  await page.goto(route);
  await page.locator("main").waitFor({ state: "visible" });
  await expectNoHorizontalOverflow(page);
}

test.describe("mobile responsive protected routes", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.skip(
    !hasCredentials(e2eAuth.owner) || !hasCredentials(e2eAuth.client),
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_CLIENT_EMAIL, and E2E_CLIENT_PASSWORD to run authenticated mobile e2e tests.",
  );

  test("admin routes do not create horizontal overflow on mobile", async ({
    page,
  }) => {
    await signIn(page, e2eAuth.owner);

    const adminRoutes = [
      "/admin/dashboard",
      "/admin/clients",
      "/admin/projects",
      "/admin/tasks",
      "/admin/feedback",
      "/admin/payments",
      "/admin/files",
      "/admin/approvals",
      "/admin/settings",
    ];

    for (const route of adminRoutes) {
      await visitAndCheck(page, route);
    }

    await page.goto("/admin/projects");
    const projectHrefs = await page
      .locator('a[href^="/admin/projects/"]')
      .evaluateAll((links) =>
        links
          .map((link) => (link as HTMLAnchorElement).getAttribute("href"))
          .filter((href): href is string => Boolean(href)),
      );
    const projectDetailHref = projectHrefs.find((href) =>
      /^\/admin\/projects\/[^/]+$/.test(href),
    );

    if (projectDetailHref) {
      await visitAndCheck(page, projectDetailHref);
    }
  });

  test("client routes do not create horizontal overflow on mobile", async ({
    page,
  }) => {
    await signIn(page, e2eAuth.client);

    const clientRoutes = [
      "/client/overview",
      "/client/project",
      "/client/files",
      "/client/feedback",
      "/client/approvals",
      "/client/payments",
    ];

    for (const route of clientRoutes) {
      await visitAndCheck(page, route);
    }
  });
});
