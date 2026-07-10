import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { NotificationsPage } from "@/features/notifications/notifications-page";
import { getNotificationCenterState } from "@/features/notifications/notification-service";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function AdminNotificationsPage() {
  const notificationCenterState = await getNotificationCenterState({
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Owner notifications"
        description="Follow client responses, fresh feedback, and important delivery events from one queue."
      />

      <NotificationsPage
        emptyStateDescription="Client responses, feedback, and project events will appear here."
        emptyStateTitle="No owner notifications yet"
        initialState={notificationCenterState}
      />
    </div>
  );
}
