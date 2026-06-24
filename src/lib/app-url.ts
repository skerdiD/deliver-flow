import "server-only";

import { headers } from "next/headers";

export async function getAppBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return new URL(configuredUrl).origin;
  }

  const headerStore = await headers();
  const hostHeader =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const host = hostHeader?.split(",")[0]?.trim();
  const protocolHeader =
    headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http";
  const protocol = protocolHeader === "https" ? "https" : "http";

  if (!host || !/^[a-zA-Z0-9.-]+(?::\d+)?$/.test(host)) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}
