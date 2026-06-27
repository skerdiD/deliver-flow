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

test.describe("client delivery workflow", () => {
  test.skip(
    !adminEmail || !adminPassword || !clientEmail || !clientPassword,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_CLIENT_EMAIL, and E2E_CLIENT_PASSWORD to run the delivery workflow e2e test.",
  );

  test("admin requests approval and client approves it", async ({ page }) => {
    const clientOptionName = getClientOptionName(clientEmail!);

    test.skip(
      !clientOptionName,
      "Set E2E_CLIENT_EMAIL to one of the seeded client users so the admin can assign the project to that client.",
    );

    const unique = Date.now();
    const projectName = `Workflow QA ${unique}`;
    const approvalTitle = `Final approval ${unique}`;

    await signIn(page, adminEmail!, adminPassword!);
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

    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
    await expect(page.getByLabel("Deliverable file")).toBeVisible();

    await page.getByLabel("Approval title").fill(approvalTitle);
    await page
      .getByLabel("Request note")
      .fill("Please review and approve this final deliverable.");
    await page.getByRole("button", { name: "Request approval" }).click();
    await expect(page.getByText("Approval requested.")).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await signIn(page, clientEmail!, clientPassword!);

    await expect(page.getByText(projectName)).toBeVisible();
    await page.getByRole("link", { name: /review approvals/i }).first().click();
    await expect(page.getByText(approvalTitle)).toBeVisible();
    await page.getByLabel("Response note").fill("Approved for final delivery.");
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Approved")).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await signIn(page, adminEmail!, adminPassword!);
    await page.goto("/admin/approvals");

    await expect(page.getByText(approvalTitle)).toBeVisible();
    await expect(page.getByText("Approved")).toBeVisible();
  });
});
