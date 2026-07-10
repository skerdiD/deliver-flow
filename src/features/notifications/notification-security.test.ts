import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();
const notificationServiceSource = readFileSync(
  join(workspaceRoot, "src/features/notifications/notification-service.ts"),
  "utf8",
);
const notificationActionsSource = readFileSync(
  join(workspaceRoot, "src/features/notifications/actions.ts"),
  "utf8",
);

describe("notification security boundaries", () => {
  it("scopes notification reads to the authenticated recipient and workspace", () => {
    expect(notificationServiceSource).toContain(
      "eq(notifications.recipientProfileId, profile.id)",
    );
    expect(notificationServiceSource).toContain(
      "eq(notifications.workspaceId, profile.workspace_id)",
    );
  });

  it("scopes notification updates to the authenticated recipient and workspace", () => {
    expect(notificationServiceSource).toContain(
      "eq(notifications.id, notificationId)",
    );
    expect(notificationServiceSource).toContain(
      "eq(notifications.recipientProfileId, profile.id)",
    );
    expect(notificationServiceSource).toContain(
      "eq(notifications.workspaceId, profile.workspace_id)",
    );
  });

  it("does not trust recipient ids from browser notification actions", () => {
    expect(notificationActionsSource).not.toContain("recipientProfileId");
    expect(notificationActionsSource).toContain(
      "markNotificationAsReadForCurrentUser",
    );
    expect(notificationActionsSource).toContain(
      "markAllNotificationsAsReadForCurrentUser",
    );
  });
});
