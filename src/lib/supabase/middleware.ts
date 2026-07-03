import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/config/routes";
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
    if (isProtectedRoute(pathname)) {
      return redirectWithSessionCookies(
        response,
        buildLoginUrl(request, `${pathname}${request.nextUrl.search}`),
      );
    }

    return response;
  }

  if (pathname === routes.auth.login) {
    return redirectWithSessionCookies(response, buildHomeUrl(request));
  }

  return response;
}

function isProtectedRoute(pathname: string) {
  return (
    pathMatchesPrefix(pathname, "/admin") || pathMatchesPrefix(pathname, "/client")
  );
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function buildLoginUrl(request: NextRequest, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = routes.auth.login;
  url.search = "";

  if (next) {
    url.searchParams.set("next", next);
  }

  return url;
}

function buildHomeUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = routes.home;
  url.search = "";

  return url;
}

function redirectWithSessionCookies(response: NextResponse, url: URL) {
  const redirectResponse = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
