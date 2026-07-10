import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const listSource = readFileSync(
  join(process.cwd(), "src/features/notifications/notifications-list.tsx"),
  "utf8",
);

describe("notification UI states", () => {
  it("renders an explicit empty state for notifications", () => {
    expect(listSource).toContain("<EmptyState");
    expect(listSource).toContain("emptyStateTitle");
    expect(listSource).toContain("emptyStateDescription");
  });

  it("shows read and unread labels in the notification list", () => {
    expect(listSource).toContain('{isRead ? "Read" : "Unread"}');
    expect(listSource).toContain("Mark as read");
  });
});
