import * as Sentry from "@sentry/nextjs";

import { scrubSentryEvent } from "@/lib/sentry-privacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn,
  enabled: Boolean(dsn) && isProduction,
  sendDefaultPii: false,
  tracesSampleRate: isProduction ? 0.02 : 0,
  beforeSend: scrubSentryEvent,
});
