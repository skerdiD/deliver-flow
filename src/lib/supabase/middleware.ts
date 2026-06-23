import { createServerClient } from "@supabase/ssr";
import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { clients, profiles } from "@/db/schema";
import {
  getRouteAccessDecision,
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

  // 1. Ask Supabase for the authenticated user. getUser() validates the token
  // with Supabase instead of trusting the local cookie contents.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applyRouteDecision(
      request,
      response,
      getRouteAccessDecision(pathname, request.nextUrl.search, {
        status: "unauthenticated",
      }),
    );
  }

  // 2. Resolve the app profile role from the database. The session alone only
  // proves identity; profiles.role is the authorization source of truth.
  const [profile] = await db
    .select({
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) {
    return applyRouteDecision(
      request,
      response,
      getRouteAccessDecision(pathname, request.nextUrl.search, {
        status: "missing_profile",
      }),
    );
  }

  if (!isSupportedRole(profile.role)) {
    return applyRouteDecision(
      request,
      response,
      getRouteAccessDecision(pathname, request.nextUrl.search, {
        status: "invalid_role",
      }),
    );
  }

  if (profile.role === "client") {
    const [client] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.profileId, user.id), eq(clients.status, "active")))
      .limit(1);

    if (!client) {
      return applyRouteDecision(
        request,
        response,
        getRouteAccessDecision(pathname, request.nextUrl.search, {
          status: "missing_client",
        }),
      );
    }
  }

  // 3. Apply role-based route policy. Admin and client layouts also call
  // requireRole(), so direct server renders remain protected if proxy is
  // bypassed or future routes are added under these segments.
  return applyRouteDecision(
    request,
    response,
    getRouteAccessDecision(pathname, request.nextUrl.search, {
      status: "authenticated",
      role: profile.role,
    }),
  );
}

function applyRouteDecision(
  request: NextRequest,
  response: NextResponse,
  decision: ReturnType<typeof getRouteAccessDecision>,
) {
  if (decision.type === "allow") {
    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  const [pathname, search = ""] = decision.destination.split("?");
  redirectUrl.pathname = pathname;
  redirectUrl.search = search;

  return redirectWithSessionCookies(response, redirectUrl);
}

function redirectWithSessionCookies(response: NextResponse, url: URL) {
  const redirectResponse = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
