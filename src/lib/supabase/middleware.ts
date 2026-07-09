import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/config/routes";
import {
  getRouteAccessDecision,
  isProtectedRoute,
  isSupportedRole,
} from "@/lib/supabase/route-protection";
import type { Database } from "@/types/database";

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
    const decision = getRouteAccessDecision(pathname, request.nextUrl.search, {
      status: "unauthenticated",
    });

    if (decision.type === "redirect") {
      return redirectWithSessionCookies(response, buildUrl(request, decision.destination));
    }

    return response;
  }

  if (
    isProtectedRoute(pathname) ||
    pathname === routes.home ||
    pathname === routes.auth.login ||
    pathname === routes.auth.signup
  ) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const profile = profileData as { role: unknown } | null;

    const decision = getRouteAccessDecision(
      pathname,
      request.nextUrl.search,
      profile && isSupportedRole(profile.role)
        ? { status: "authenticated", role: profile.role }
        : profile
          ? { status: "invalid_role" }
          : { status: "missing_profile" },
    );

    if (decision.type === "redirect") {
      return redirectWithSessionCookies(response, buildUrl(request, decision.destination));
    }
  }

  return response;
}

function buildUrl(request: NextRequest, destination: string) {
  const url = request.nextUrl.clone();
  const [pathname, search = ""] = destination.split("?");
  url.pathname = pathname;
  url.search = search ? `?${search}` : "";

  return url;
}

function redirectWithSessionCookies(response: NextResponse, url: URL) {
  const redirectResponse = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
