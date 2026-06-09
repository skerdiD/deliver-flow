import { createServerClient } from "@supabase/ssr";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/config/routes";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { Database, UserRole } from "@/types/database";

const protectedPrefixes = ["/admin", "/client"];

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isSupportedRole(value: unknown): value is UserRole {
  return value === "admin" || value === "client";
}

function getDashboardPath(role: UserRole) {
  if (role === "admin") {
    return routes.admin.dashboard;
  }

  return routes.client.dashboard;
}

function getRequestedPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function buildLoginRedirectUrl(
  request: NextRequest,
  input?: {
    error?: "profile_missing" | "role_invalid";
    next?: string;
  },
) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = routes.auth.login;
  loginUrl.search = "";

  if (input?.next) {
    loginUrl.searchParams.set("next", input.next);
  }

  if (input?.error) {
    loginUrl.searchParams.set("error", input.error);
  }

  return loginUrl;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(
        buildLoginRedirectUrl(request, {
          next: getRequestedPath(request),
        }),
      );
    }

    return response;
  }

  const [profile] = await db
    .select({
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) {
    if (pathname === routes.auth.login) {
      if (request.nextUrl.searchParams.get("error") === "profile_missing") {
        return response;
      }

      return NextResponse.redirect(
        buildLoginRedirectUrl(request, {
          error: "profile_missing",
        }),
      );
    }

    if (isProtectedRoute(pathname) || pathname === routes.home) {
      return NextResponse.redirect(
        buildLoginRedirectUrl(request, {
          error: "profile_missing",
        }),
      );
    }

    return response;
  }

  if (!isSupportedRole(profile.role)) {
    if (pathname === routes.auth.login) {
      if (request.nextUrl.searchParams.get("error") === "role_invalid") {
        return response;
      }

      return NextResponse.redirect(
        buildLoginRedirectUrl(request, {
          error: "role_invalid",
        }),
      );
    }

    return NextResponse.redirect(
      buildLoginRedirectUrl(request, {
        error: "role_invalid",
      }),
    );
  }

  const role = profile.role;

  if (pathname === routes.auth.login) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = getDashboardPath(role);
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    const clientDashboardUrl = request.nextUrl.clone();
    clientDashboardUrl.pathname = routes.client.dashboard;
    clientDashboardUrl.search = "";

    return NextResponse.redirect(clientDashboardUrl);
  }

  if (pathname.startsWith("/client") && role !== "client") {
    const adminDashboardUrl = request.nextUrl.clone();
    adminDashboardUrl.pathname = routes.admin.dashboard;
    adminDashboardUrl.search = "";

    return NextResponse.redirect(adminDashboardUrl);
  }

  return response;
}
