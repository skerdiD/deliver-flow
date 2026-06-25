import type { Event } from "@sentry/nextjs";

const sensitiveKeyPattern =
  /authorization|cookie|password|token|secret|key|dsn|signature|signed|invite|storagepath|filepath|file_path|feedback|approval|message|responseNote/i;

const sensitivePathPattern =
  /\/invite\/[^/?#]+|\/api\/client\/files\/[^/?#]+\/download/gi;

function redactUrl(value: string) {
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(sensitivePathPattern, (match) => {
      if (match.startsWith("/invite/")) {
        return "/invite/[redacted]";
      }

      return "/api/client/files/[redacted]/download";
    });

    return url.toString();
  } catch {
    return value.replace(sensitivePathPattern, (match) => {
      if (match.startsWith("/invite/")) {
        return "/invite/[redacted]";
      }

      return "/api/client/files/[redacted]/download";
    });
  }
}

function scrubValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactUrl(value);
  }

  if (Array.isArray(value)) {
    return value.map(scrubValue);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[redacted]" : scrubValue(entry),
    ]),
  );
}

type SentryRequestHeaders = NonNullable<Event["request"]>["headers"];

export function scrubSentryEvent<T extends Event>(event: T): T {
  if (event.request) {
    event.request = {
      ...event.request,
      url: event.request.url ? redactUrl(event.request.url) : event.request.url,
      query_string: undefined,
      cookies: undefined,
      headers: event.request.headers
        ? (scrubValue(event.request.headers) as SentryRequestHeaders)
        : event.request.headers,
      data: event.request.data ? "[redacted]" : event.request.data,
    };
  }

  if (event.extra) {
    event.extra = scrubValue(event.extra) as Event["extra"];
  }

  if (event.contexts) {
    event.contexts = scrubValue(event.contexts) as Event["contexts"];
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      message:
        typeof breadcrumb.message === "string"
          ? redactUrl(breadcrumb.message)
          : breadcrumb.message,
      data: breadcrumb.data
        ? (scrubValue(breadcrumb.data) as typeof breadcrumb.data)
        : breadcrumb.data,
    }));
  }

  return event;
}
