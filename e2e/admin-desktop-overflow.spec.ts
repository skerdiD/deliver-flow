import { expect, test, type Page } from "@playwright/test";

import { e2eAuth, hasCredentials, signIn } from "./support/auth";

async function expectNoDesktopTableOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(
      documentElement.scrollWidth,
      body?.scrollWidth ?? 0,
    );
    const tableContainers = Array.from(
      document.querySelectorAll('[data-slot="table-container"]'),
    ).map((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));

    return {
      pageClientWidth: documentElement.clientWidth,
      pageScrollWidth: scrollWidth,
      overflowingTables: tableContainers.filter(
        (table) => table.scrollWidth > table.clientWidth + 2,
      ),
    };
  });

  expect(overflow.pageScrollWidth).toBeLessThanOrEqual(
    overflow.pageClientWidth + 2,
  );
  expect(overflow.overflowingTables).toEqual([]);
}

async function visitAndCheck(page: Page, route: string) {
  await page.goto(route);
  await page.locator("main").waitFor({ state: "visible" });
  await expectNoDesktopTableOverflow(page);
}

test.describe("admin desktop table overflow", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test.skip(
    !hasCredentials(e2eAuth.owner),
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin desktop overflow checks.",
  );

  test("admin table pages fit without horizontal scrolling", async ({
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

    await page.goto("/admin/clients");
    const clientHrefs = await page
      .locator('a[href^="/admin/clients/"]')
      .evaluateAll((links) =>
        links
          .map((link) => (link as HTMLAnchorElement).getAttribute("href"))
          .filter((href): href is string => Boolean(href)),
      );
    const clientDetailHref = clientHrefs.find((href) =>
      /^\/admin\/clients\/[^/]+$/.test(href),
    );

    if (clientDetailHref) {
      await visitAndCheck(page, clientDetailHref);
    }
  });
});
