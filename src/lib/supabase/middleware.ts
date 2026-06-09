import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/config/routes";
import type { Database, UserRole } from "@/types/database";

const protectedPrefixes = ["/admin", "/client"];

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function getDashboardPath(role: UserRole) {
  if (role === "admin") {
    return routes.admin.dashboard;
  }

  return routes.client.dashboard;
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
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = routes.auth.login;
      loginUrl.searchParams.set("next", pathname);

      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const profileResult = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileResult.data as { role: UserRole } | null;

  if (!profile?.role) {
    if (isProtectedRoute(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = routes.auth.login;
      loginUrl.searchParams.set("error", "profile_missing");

      return NextResponse.redirect(loginUrl);
    }

    return response;
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
