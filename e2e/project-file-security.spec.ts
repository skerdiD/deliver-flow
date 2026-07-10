import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const assignedClientEmail = process.env.E2E_CLIENT_EMAIL;
const assignedClientPassword = process.env.E2E_CLIENT_PASSWORD;
const unassignedClientEmail = process.env.E2E_UNASSIGNED_CLIENT_EMAIL;
const unassignedClientPassword = process.env.E2E_UNASSIGNED_CLIENT_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Log out" }).click();
}

function getClientOptionName(email: string) {
  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === "sarah@novaagency.com") {
    return "Nova Agency";
  }

  if (normalizedEmail === "michael@retailco.com") {
    return "RetailCo";
  }

  if (normalizedEmail === "james@creativehub.co") {
    return "Creative Hub";
  }

  return null;
}

test.describe("project file security workflow", () => {
  test.skip(
    !adminEmail ||
      !adminPassword ||
      !assignedClientEmail ||
      !assignedClientPassword ||
      !unassignedClientEmail ||
      !unassignedClientPassword,
    "Set the admin, assigned client, and unassigned client E2E credentials to run the file security workflow test.",
  );

  test("owner upload, client visibility, cross-client denial, replacement, and deletion", async ({
    page,
  }) => {
    const assignedClientOptionName = getClientOptionName(assignedClientEmail!);

    test.skip(
      !assignedClientOptionName,
      "Set E2E_CLIENT_EMAIL to one of the seeded client users so the owner can assign the project.",
    );

    const unique = Date.now();
    const projectName = `File Security QA ${unique}`;
    const initialFileName = `Delivery packet ${unique}.pdf`;
    const replacementFileName = `Delivery packet revision ${unique}.pdf`;

    await signIn(page, adminEmail!, adminPassword!);
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
    await signIn(page, assignedClientEmail!, assignedClientPassword!);
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
    await signIn(page, unassignedClientEmail!, unassignedClientPassword!);
    await page.goto(downloadHref);
    await expect(page.locator("body")).toContainText("File not found.");

    await signOut(page);
    await signIn(page, adminEmail!, adminPassword!);
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
    await signIn(page, assignedClientEmail!, assignedClientPassword!);
    await page.goto("/client/files");
    await expect(page.getByText(replacementFileName)).toBeVisible();
    await expect(page.getByText(initialFileName)).toHaveCount(0);

    await signOut(page);
    await signIn(page, adminEmail!, adminPassword!);
    await page.goto("/admin/files");

    const replacementFileCard = page
      .locator("div", { hasText: replacementFileName })
      .first();
    await replacementFileCard.getByLabel("File actions").click();
    await page.getByRole("menuitem", { name: "Delete file" }).click();
    await page.getByRole("button", { name: "Delete file" }).click();
    await expect(page.getByText(replacementFileName)).toHaveCount(0);

    await signOut(page);
    await signIn(page, assignedClientEmail!, assignedClientPassword!);
    await page.goto("/client/files");
    await expect(page.getByText(replacementFileName)).toHaveCount(0);
  });
});
