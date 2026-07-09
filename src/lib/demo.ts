export const DEMO_WORKSPACE_SLUG = "deliverflow-demo";
export const DEMO_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";

export function isDemoWorkspaceSlug(slug: string | null | undefined) {
  return slug === DEMO_WORKSPACE_SLUG;
}

export function isDemoWorkspaceId(id: string | null | undefined) {
  return id === DEMO_WORKSPACE_ID;
}
