import { routes } from "@/config/routes";
import type { UserRole } from "@/types/database";

type AuthRouteState =
  | { status: "unauthenticated" }
  | { status: "missing_profile" }
  | { status: "missing_client" }
  | { status: "invalid_role" }
  | { status: "authenticated"; role: UserRole };

type RouteAccessDecision =
  | { type: "allow" }
  | { type: "redirect"; destination: string };

const protectedRolePrefixes: Record<UserRole, string> = {
  admin: "/admin",
  client: "/client",
};

export function isSupportedRole(value: unknown): value is UserRole {
  return value === "admin" || value === "client";
}

export function getDashboardPathForRole(role: UserRole) {
  if (role === "admin") {
    return routes.admin.dashboard;
  }

  return routes.client.dashboard;
}

export function isProtectedRoute(pathname: string) {
  return Object.values(protectedRolePrefixes).some((prefix) =>
    pathMatchesPrefix(pathname, prefix),
  );
}

export function getRouteAccessDecision(
  pathname: string,
  search: string,
  authState: AuthRouteState,
): RouteAccessDecision {
  const requestedPath = `${pathname}${search}`;

  // Proxy handles the fast path for navigation: unauthenticated users go to
  // login, known users stay inside their role area, and invalid account states
  // are sent back to login with a stable error code. Server layouts still call
  // requireRole(), so this is not the only authorization boundary.
  if (authState.status === "unauthenticated") {
    if (!isProtectedRoute(pathname)) {
      return { type: "allow" };
    }

    return {
      type: "redirect",
      destination: buildLoginPath({ next: requestedPath }),
    };
  }

  if (authState.status === "missing_profile") {
    return getInvalidAccountDecision(pathname, "profile_missing");
  }

  if (authState.status === "missing_client") {
    return getInvalidAccountDecision(pathname, "client_missing");
  }

  if (authState.status === "invalid_role") {
    return getInvalidAccountDecision(pathname, "role_invalid");
  }

  if (isAuthRoute(pathname) || pathname === routes.home) {
    return {
      type: "redirect",
      destination: getDashboardPathForRole(authState.role),
    };
  }

  const requiredRole = getRequiredRoleForPath(pathname);

  if (requiredRole && requiredRole !== authState.role) {
    return {
      type: "redirect",
      destination: getDashboardPathForRole(authState.role),
    };
  }

  return { type: "allow" };
}

function getInvalidAccountDecision(
  pathname: string,
  error: "profile_missing" | "client_missing" | "role_invalid",
): RouteAccessDecision {
  if (isAuthRoute(pathname)) {
    return { type: "allow" };
  }

  if (!isProtectedRoute(pathname) && pathname !== routes.home) {
    return { type: "allow" };
  }

  return {
    type: "redirect",
    destination: buildLoginPath({ error }),
  };
}

function getRequiredRoleForPath(pathname: string): UserRole | null {
  if (pathMatchesPrefix(pathname, protectedRolePrefixes.admin)) {
    return "admin";
  }

  if (pathMatchesPrefix(pathname, protectedRolePrefixes.client)) {
    return "client";
  }

  return null;
}

function isAuthRoute(pathname: string) {
  return pathname === routes.auth.login;
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function buildLoginPath(input?: {
  error?: "profile_missing" | "client_missing" | "role_invalid";
  next?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input?.next) {
    searchParams.set("next", input.next);
  }

  if (input?.error) {
    searchParams.set("error", input.error);
  }

  const query = searchParams.toString();

  return query ? `${routes.auth.login}?${query}` : routes.auth.login;
}
