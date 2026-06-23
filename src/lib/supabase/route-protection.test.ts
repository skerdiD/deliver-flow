import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { routes } from "@/config/routes";
import { getRouteAccessDecision } from "@/lib/supabase/route-protection";

describe("route protection policy", () => {
  it("redirects unauthenticated users from admin routes to login with next", () => {
    assert.deepEqual(
      getRouteAccessDecision("/admin/projects", "?status=active", {
        status: "unauthenticated",
      }),
      {
        type: "redirect",
        destination: "/login?next=%2Fadmin%2Fprojects%3Fstatus%3Dactive",
      },
    );
  });

  it("redirects unauthenticated users from client routes to login with next", () => {
    assert.deepEqual(
      getRouteAccessDecision("/client/dashboard", "", {
        status: "unauthenticated",
      }),
      {
        type: "redirect",
        destination: "/login?next=%2Fclient%2Fdashboard",
      },
    );
  });

  it("allows admins into admin routes and redirects them away from client routes", () => {
    assert.deepEqual(
      getRouteAccessDecision("/admin/dashboard", "", {
        status: "authenticated",
        role: "admin",
      }),
      { type: "allow" },
    );

    assert.deepEqual(
      getRouteAccessDecision("/client/dashboard", "", {
        status: "authenticated",
        role: "admin",
      }),
      {
        type: "redirect",
        destination: routes.admin.dashboard,
      },
    );
  });

  it("allows clients into client routes and redirects them away from admin routes", () => {
    assert.deepEqual(
      getRouteAccessDecision("/client/files", "", {
        status: "authenticated",
        role: "client",
      }),
      { type: "allow" },
    );

    assert.deepEqual(
      getRouteAccessDecision("/admin/payments", "", {
        status: "authenticated",
        role: "client",
      }),
      {
        type: "redirect",
        destination: routes.client.dashboard,
      },
    );
  });

  it("redirects authenticated users away from auth routes and home to their dashboard", () => {
    assert.deepEqual(
      getRouteAccessDecision(routes.auth.login, "", {
        status: "authenticated",
        role: "client",
      }),
      {
        type: "redirect",
        destination: routes.client.dashboard,
      },
    );

    assert.deepEqual(
      getRouteAccessDecision(routes.home, "", {
        status: "authenticated",
        role: "admin",
      }),
      {
        type: "redirect",
        destination: routes.admin.dashboard,
      },
    );
  });

  it("sends invalid account states to login with stable error codes", () => {
    assert.deepEqual(
      getRouteAccessDecision("/admin/dashboard", "", {
        status: "missing_profile",
      }),
      {
        type: "redirect",
        destination: "/login?error=profile_missing",
      },
    );

    assert.deepEqual(
      getRouteAccessDecision("/client/dashboard", "", {
        status: "invalid_role",
      }),
      {
        type: "redirect",
        destination: "/login?error=role_invalid",
      },
    );
  });
});
