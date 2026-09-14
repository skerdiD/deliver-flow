import { expect, test } from "@playwright/test";

import {
  e2eAuth,
  getSeededClientOptionName,
  hasCredentials,
  signIn,
} from "./support/auth";

test.describe("client delivery workflow", () => {
  test.skip(
    !hasCredentials(e2eAuth.owner) || !hasCredentials(e2eAuth.client),
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_CLIENT_EMAIL, and E2E_CLIENT_PASSWORD to run the delivery workflow e2e test.",
  );

  test("admin requests approval and client approves it", async ({ page }) => {
    const clientOptionName = getSeededClientOptionName(e2eAuth.client.email);

    test.skip(
      !clientOptionName,
      "Set E2E_CLIENT_EMAIL to one of the seeded client users so the admin can assign the project to that client.",
    );

    const unique = Date.now();
    const projectName = `Workflow QA ${unique}`;
    const approvalTitle = `Final approval ${unique}`;

    await signIn(page, e2eAuth.owner);
    await page.goto("/admin/projects/new");

    await page.getByLabel("Project name").fill(projectName);
    await page.getByRole("combobox", { name: "Assigned client" }).click();
    await page
      .getByRole("option")
      .filter({ hasText: clientOptionName! })
      .first()
      .click();
    await page
      .getByLabel("Project description")
      .fill("QA workflow project created by Playwright.");
    await page.getByLabel("Deadline").fill("2026-12-31");
    await page.getByLabel("Budget").fill("1200");
    await page.getByLabel("Paid so far").fill("0");
    await page.getByRole("button", { name: "Save Project" }).click();

    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();
    await expect(page.getByLabel("Deliverable file")).toBeVisible();

    await page.getByLabel("Approval title").fill(approvalTitle);
    await page
      .getByLabel("Request note")
      .fill("Please review and approve this final deliverable.");
    await page.getByRole("button", { name: "Request approval" }).click();
    await expect(page.getByText("Approval requested.")).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await signIn(page, e2eAuth.client);

    await expect(page.getByText(projectName)).toBeVisible();
    const clientNotificationsButton = page.getByRole("button", {
      name: /notifications/i,
    });
    await expect(clientNotificationsButton).toBeVisible();
    await clientNotificationsButton.click();
    await expect(page.getByText("New approval request")).toBeVisible();
    await expect(page.getByText(approvalTitle)).toBeVisible();
    await page.getByRole("button", { name: "Open" }).first().click();
    await expect(page).toHaveURL(/\/client\/approvals\?projectId=/);
    await expect(
      page.getByRole("button", { name: /^Notifications$/ }),
    ).toBeVisible();

    await page.goto("/client/notifications");
    await expect(page.getByText("Read").first()).toBeVisible();
    await expect(page.getByText(approvalTitle)).toBeVisible();
    await page.getByLabel("Response note").fill("Approved for final delivery.");
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Approved")).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await signIn(page, e2eAuth.owner);
    const ownerNotificationsButton = page.getByRole("button", {
      name: /notifications/i,
    });
    await ownerNotificationsButton.click();
    await expect(page.getByText("Approval accepted")).toBeVisible();
    await expect(page.getByText(approvalTitle)).toBeVisible();
    await page.goto("/admin/approvals");

    await expect(page.getByText(approvalTitle)).toBeVisible();
    await expect(page.getByText("Approved")).toBeVisible();
  });
});
