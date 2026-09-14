import { expect, test } from "@playwright/test";

import {
  e2eAuth,
  getSeededClientOptionName,
  hasCredentials,
  signIn,
  signOut,
} from "./support/auth";

test.describe("project file security workflow", () => {
  test.skip(
    !hasCredentials(e2eAuth.owner) ||
      !hasCredentials(e2eAuth.client) ||
      !hasCredentials(e2eAuth.unassignedClient),
    "Set the admin, assigned client, and unassigned client E2E credentials to run the file security workflow test.",
  );

  test("owner upload, client visibility, cross-client denial, replacement, and deletion", async ({
    page,
  }) => {
    const assignedClientOptionName = getSeededClientOptionName(
      e2eAuth.client.email,
    );

    test.skip(
      !assignedClientOptionName,
      "Set E2E_CLIENT_EMAIL to one of the seeded client users so the owner can assign the project.",
    );

    const unique = Date.now();
    const projectName = `File Security QA ${unique}`;
    const initialFileName = `Delivery packet ${unique}.pdf`;
    const replacementFileName = `Delivery packet revision ${unique}.pdf`;

    await signIn(page, e2eAuth.owner);
    await page.goto("/admin/projects/new");

    await page.getByLabel("Project name").fill(projectName);
    await page.getByRole("combobox", { name: "Assigned client" }).click();
    await page
      .getByRole("option")
      .filter({ hasText: assignedClientOptionName! })
      .first()
      .click();
    await page
      .getByLabel("Project description")
      .fill("Project file security workflow created by Playwright.");
    await page.getByLabel("Deadline").fill("2026-12-31");
    await page.getByLabel("Budget").fill("1400");
    await page.getByLabel("Paid so far").fill("0");
    await page.getByRole("button", { name: "Save Project" }).click();

    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();

    await page.getByLabel("Display name").fill(initialFileName);
    await page.getByLabel("Deliverable file").setInputFiles({
      buffer: Buffer.from("%PDF-1.7 file-security-initial"),
      mimeType: "application/pdf",
      name: `initial-${unique}.pdf`,
    });
    await page.getByRole("button", { name: "Upload file" }).click();
    await expect(page.getByText(initialFileName)).toBeVisible();

    await signOut(page);
    await signIn(page, e2eAuth.client);
    await page.goto("/client/files");
    await expect(page.getByText(initialFileName)).toBeVisible();

    const downloadHref =
      (await page
        .locator(`a[href*="/api/client/files/"]`)
        .filter({ hasText: "Download" })
        .first()
        .getAttribute("href")) ?? "";

    expect(downloadHref).toContain("/api/client/files/");

    await signOut(page);
    await signIn(page, e2eAuth.unassignedClient);
    await page.goto(downloadHref);
    await expect(page.locator("body")).toContainText("File not found.");

    await signOut(page);
    await signIn(page, e2eAuth.owner);
    await page.goto("/admin/files");

    const initialFileCard = page
      .locator("div", { hasText: initialFileName })
      .first();
    await initialFileCard.getByLabel("File actions").click();
    await page.getByRole("menuitem", { name: "Replace file" }).click();
    await page
      .getByRole("dialog")
      .getByLabel("Replacement display name")
      .fill(replacementFileName);
    await page
      .getByRole("dialog")
      .getByLabel("Replacement file")
      .setInputFiles({
        buffer: Buffer.from("%PDF-1.7 file-security-replacement"),
        mimeType: "application/pdf",
        name: `replacement-${unique}.pdf`,
      });
    await page.getByRole("button", { name: "Replace file" }).click();
    await expect(page.getByText(replacementFileName)).toBeVisible();
    await expect(page.getByText(initialFileName)).toHaveCount(0);

    await signOut(page);
    await signIn(page, e2eAuth.client);
    await page.goto("/client/files");
    await expect(page.getByText(replacementFileName)).toBeVisible();
    await expect(page.getByText(initialFileName)).toHaveCount(0);

    await signOut(page);
    await signIn(page, e2eAuth.owner);
    await page.goto("/admin/files");

    const replacementFileCard = page
      .locator("div", { hasText: replacementFileName })
      .first();
    await replacementFileCard.getByLabel("File actions").click();
    await page.getByRole("menuitem", { name: "Delete file" }).click();
    await page.getByRole("button", { name: "Delete file" }).click();
    await expect(page.getByText(replacementFileName)).toHaveCount(0);

    await signOut(page);
    await signIn(page, e2eAuth.client);
    await page.goto("/client/files");
    await expect(page.getByText(replacementFileName)).toHaveCount(0);
  });
});
