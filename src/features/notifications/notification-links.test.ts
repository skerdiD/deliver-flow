import { describe, expect, it } from "vitest";

import {
  buildClientProjectActionUrl,
  getClientApprovalNotificationUrl,
  getClientFileNotificationUrl,
  getClientPaymentNotificationUrl,
  getClientUpdateNotificationUrl,
  getOwnerApprovalResponseNotificationUrl,
  getOwnerFeedbackNotificationUrl,
} from "@/features/notifications/notification-links";

describe("notification action URL helpers", () => {
  const projectId = "11111111-1111-4111-8111-111111111111";

  it("builds client project-scoped links with a preserved project id", () => {
    expect(buildClientProjectActionUrl("/client/project", projectId)).toBe(
      `/client/project?projectId=${projectId}`,
    );
    expect(getClientUpdateNotificationUrl(projectId)).toBe(
      `/client/project?projectId=${projectId}`,
    );
    expect(getClientApprovalNotificationUrl(projectId)).toBe(
      `/client/approvals?projectId=${projectId}`,
    );
    expect(getClientFileNotificationUrl(projectId)).toBe(
      `/client/files?projectId=${projectId}`,
    );
    expect(getClientPaymentNotificationUrl(projectId)).toBe(
      `/client/payments?projectId=${projectId}`,
    );
  });

  it("builds owner links back to the project workspace", () => {
    expect(getOwnerFeedbackNotificationUrl(projectId)).toBe(
      `/admin/projects/${projectId}`,
    );
    expect(getOwnerApprovalResponseNotificationUrl(projectId)).toBe(
      `/admin/projects/${projectId}`,
    );
  });
});
