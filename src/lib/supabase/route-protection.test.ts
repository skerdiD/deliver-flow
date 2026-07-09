import { describe, expect, it } from "vitest";

import { routes } from "@/config/routes";
import {
  getDashboardPathForRole,
  getRouteAccessDecision,
  isProtectedRoute,
  isSupportedRole,
} from "@/lib/supabase/route-protection";

describe("route protection policy", () => {
  it("redirects unauthenticated users from admin routes to login with next", () => {
    expect(
      getRouteAccessDecision("/admin/projects", "?status=active", {
        status: "unauthenticated",
      }),
    ).toEqual({
        type: "redirect",
        destination: "/login?next=%2Fadmin%2Fprojects%3Fstatus%3Dactive",
      });
  });

  it("redirects unauthenticated users from client routes to login with next", () => {
    expect(
      getRouteAccessDecision("/client/overview", "", {
        status: "unauthenticated",
      }),
    ).toEqual({
        type: "redirect",
        destination: "/login?next=%2Fclient%2Foverview",
      });
  });

  it("allows owners into admin routes and redirects them away from client routes", () => {
    expect(
      getRouteAccessDecision("/admin/dashboard", "", {
        status: "authenticated",
        role: "owner",
      }),
    ).toEqual({ type: "allow" });

    expect(
      getRouteAccessDecision("/client/overview", "", {
        status: "authenticated",
        role: "owner",
      }),
    ).toEqual({
        type: "redirect",
        destination: routes.admin.dashboard,
      });
  });

  it("allows clients into client routes and redirects them away from admin routes", () => {
    expect(
      getRouteAccessDecision("/client/files", "", {
        status: "authenticated",
        role: "client",
      }),
    ).toEqual({ type: "allow" });

    expect(
      getRouteAccessDecision("/admin/payments", "", {
        status: "authenticated",
        role: "client",
      }),
    ).toEqual({
        type: "redirect",
        destination: routes.client.dashboard,
      });
  });

  it("redirects authenticated users away from auth routes and home to their dashboard", () => {
    expect(
      getRouteAccessDecision(routes.auth.login, "", {
        status: "authenticated",
        role: "client",
      }),
    ).toEqual({
        type: "redirect",
        destination: routes.client.dashboard,
      });

    expect(
      getRouteAccessDecision(routes.auth.signup, "", {
        status: "authenticated",
        role: "owner",
      }),
    ).toEqual({
        type: "redirect",
        destination: routes.admin.dashboard,
      });

    expect(
      getRouteAccessDecision(routes.home, "", {
        status: "authenticated",
        role: "owner",
      }),
    ).toEqual({
        type: "redirect",
        destination: routes.admin.dashboard,
      });
  });

  it("sends invalid account states to login with stable error codes", () => {
    expect(
      getRouteAccessDecision("/admin/dashboard", "", {
        status: "missing_profile",
      }),
    ).toEqual({
        type: "redirect",
        destination: "/login?error=profile_missing",
      });

    expect(
      getRouteAccessDecision("/client/overview", "", {
        status: "invalid_role",
      }),
    ).toEqual({
        type: "redirect",
        destination: "/login?error=role_invalid",
      });

    expect(
      getRouteAccessDecision("/client/overview", "", {
        status: "missing_client",
      }),
    ).toEqual({
        type: "redirect",
        destination: "/login?error=client_missing",
      });
  });

  it("allows invalid account states to view login error pages without loops", () => {
    expect(
      getRouteAccessDecision(routes.auth.login, "?error=profile_missing", {
        status: "missing_profile",
      }),
    ).toEqual({ type: "allow" });

    expect(
      getRouteAccessDecision(routes.auth.login, "?error=client_missing", {
        status: "missing_client",
      }),
    ).toEqual({ type: "allow" });
  });

  it("recognizes protected route prefixes and supported roles", () => {
    expect(isProtectedRoute("/admin/dashboard")).toBe(true);
    expect(isProtectedRoute("/admin/projects/project_123")).toBe(true);
    expect(isProtectedRoute("/client/project")).toBe(true);
    expect(isProtectedRoute("/client/project/project_123")).toBe(true);
    expect(isProtectedRoute("/client/approvals")).toBe(true);
    expect(isProtectedRoute("/login")).toBe(false);
    expect(isProtectedRoute("/api/client/files/file_123/download")).toBe(false);
    expect(isSupportedRole("owner")).toBe(true);
    expect(isSupportedRole("client")).toBe(true);
    expect(isSupportedRole("admin")).toBe(false);
    expect(isSupportedRole("guest")).toBe(false);
  });

  it("protects dynamic admin and client detail routes by role", () => {
    expect(
      getRouteAccessDecision("/admin/projects/project_123", "", {
        status: "authenticated",
        role: "client",
      }),
    ).toEqual({
        type: "redirect",
        destination: routes.client.dashboard,
      });

    expect(
      getRouteAccessDecision("/client/project/project_123", "", {
        status: "authenticated",
        role: "owner",
      }),
    ).toEqual({
        type: "redirect",
        destination: routes.admin.dashboard,
      });
  });

  it("maps roles to their dashboard redirect targets", () => {
    expect(getDashboardPathForRole("owner")).toBe(routes.admin.dashboard);
    expect(getDashboardPathForRole("client")).toBe(routes.client.dashboard);
  });
});
