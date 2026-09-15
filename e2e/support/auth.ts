import { expect, type Page } from "@playwright/test";

type E2ECredentials = {
  email?: string;
  password?: string;
  dashboardPath: string;
};

export const e2eAuth = {
  owner: {
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
    dashboardPath: "/admin/dashboard",
  },
  client: {
    email: process.env.E2E_CLIENT_EMAIL,
    password: process.env.E2E_CLIENT_PASSWORD,
    dashboardPath: "/client/overview",
  },
  unassignedClient: {
    email: process.env.E2E_UNASSIGNED_CLIENT_EMAIL,
    password: process.env.E2E_UNASSIGNED_CLIENT_PASSWORD,
    dashboardPath: "/client/overview",
  },
} satisfies Record<string, E2ECredentials>;

export function hasCredentials(
  credentials: (typeof e2eAuth)[keyof typeof e2eAuth],
) {
  return Boolean(credentials.email && credentials.password);
}

export async function signIn(
  page: Page,
  credentials: E2ECredentials,
) {
  if (!credentials.email || !credentials.password) {
    throw new Error("Missing Playwright authentication credentials.");
  }

  await page.goto("/login");
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // A click resolves before the async Supabase login and cookie write finish.
  // Wait for the role redirect so a following page.goto() cannot abort them.
  await expect(page).toHaveURL(
    (url) => url.pathname === credentials.dashboardPath,
    { timeout: 15_000 },
  );
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Log out" }).click();

  // Ensure the session is cleared before another account signs in.
  await expect(page).toHaveURL((url) => url.pathname === "/login", {
    timeout: 15_000,
  });
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
