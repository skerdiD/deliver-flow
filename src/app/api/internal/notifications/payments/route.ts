import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import {
  getNotificationCronSecret,
  scanAndCreatePaymentNotifications,
} from "@/features/notifications/payment-notifications";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

function hasValidCronSecret(request: Request) {
  const secret = getNotificationCronSecret();

  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization ?? "");

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

async function handleRequest(request: Request) {
  if (!hasValidCronSecret(request)) {
    return jsonError("Not found.", 404);
  }

  const result = await scanAndCreatePaymentNotifications();

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}
