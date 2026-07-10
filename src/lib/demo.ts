export const DEMO_WORKSPACE_SLUG = "deliverflow-demo";
export const DEMO_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_ADMIN_EMAIL = "admin@deliverflow.demo";
export const DEMO_CLIENT_EMAIL = "client@deliverflow.demo";
export const DEMO_SHARED_PASSWORD = "Demo123456!";

export type DemoRole = "owner" | "client";

export function getDemoCredentials(role: DemoRole) {
  return role === "owner"
    ? {
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_SHARED_PASSWORD,
      }
    : {
        email: DEMO_CLIENT_EMAIL,
        password: DEMO_SHARED_PASSWORD,
      };
}

export function isDemoWorkspaceSlug(slug: string | null | undefined) {
  return slug === DEMO_WORKSPACE_SLUG;
}

export function isDemoWorkspaceId(id: string | null | undefined) {
  return id === DEMO_WORKSPACE_ID;
}
