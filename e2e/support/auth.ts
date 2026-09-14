import type { Page } from "@playwright/test";

export const e2eAuth = {
  owner: {
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
  },
  client: {
    email: process.env.E2E_CLIENT_EMAIL,
    password: process.env.E2E_CLIENT_PASSWORD,
  },
  unassignedClient: {
    email: process.env.E2E_UNASSIGNED_CLIENT_EMAIL,
    password: process.env.E2E_UNASSIGNED_CLIENT_PASSWORD,
  },
};

export function hasCredentials(
  credentials: (typeof e2eAuth)[keyof typeof e2eAuth],
) {
  return Boolean(credentials.email && credentials.password);
}

export async function signIn(
  page: Page,
  credentials: { email?: string; password?: string },
) {
  if (!credentials.email || !credentials.password) {
    throw new Error("Missing Playwright authentication credentials.");
  }

  await page.goto("/login");
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Log out" }).click();
}

export function getSeededClientOptionName(email?: string) {
  switch (email?.toLowerCase()) {
    case "client@deliverflow.demo":
      return "Acme Studio";
    case "sarah@novaagency.com":
      return "Nova Agency";
    case "michael@retailco.com":
      return "RetailCo";
    case "james@creativehub.co":
      return "Creative Hub";
    default:
      return null;
  }
}
