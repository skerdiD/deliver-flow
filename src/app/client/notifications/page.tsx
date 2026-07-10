import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { NotificationsPage } from "@/features/notifications/notifications-page";
import { getNotificationCenterState } from "@/features/notifications/notification-service";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function ClientNotificationsPage() {
  const notificationCenterState = await getNotificationCenterState({
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Client notifications"
        description="See new updates, approval requests, files, and payment reminders without digging through old messages."
      />

      <NotificationsPage
        emptyStateDescription="Project updates, files, approvals, and payment reminders will show here."
        emptyStateTitle="No client notifications yet"
        initialState={notificationCenterState}
      />
    </div>
  );
}
