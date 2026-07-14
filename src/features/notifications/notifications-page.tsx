"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/features/notifications/actions";
import { NotificationsList } from "@/features/notifications/notifications-list";
import type {
  NotificationCenterState,
  NotificationListItem,
} from "@/features/notifications/types";

type NotificationsPageProps = {
  emptyStateDescription: string;
  emptyStateTitle: string;
  initialState: NotificationCenterState;
};

export function NotificationsPage({
  emptyStateDescription,
  emptyStateTitle,
  initialState,
}: NotificationsPageProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(
    initialState.notifications,
  );
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isMarkingAll, startMarkAllTransition] = useTransition();
  const hasUnread = notifications.some((notification) => !notification.readAt);

  function beginPending(notificationId: string) {
    setPendingIds((current) =>
      current.includes(notificationId) ? current : [...current, notificationId],
    );
  }

  function endPending(notificationId: string) {
    setPendingIds((current) => current.filter((id) => id !== notificationId));
  }

  function markNotificationReadLocally(notificationId: string) {
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId && !notification.readAt
          ? {
              ...notification,
              readAt,
            }
          : notification,
      ),
    );
  }

  function openNotification(notification: NotificationListItem) {
    beginPending(notification.id);

    void (async () => {
      const result = notification.readAt
        ? { actionUrl: notification.actionUrl, success: true }
        : await markNotificationAsReadAction({
            notificationId: notification.id,
          });

      if (result.success && !notification.readAt) {
        markNotificationReadLocally(notification.id);
      }

      endPending(notification.id);

      if (notification.actionUrl || result.actionUrl) {
        router.push(notification.actionUrl ?? result.actionUrl ?? "/");
        return;
      }

      router.refresh();
    })();
  }

  function markNotificationRead(notification: NotificationListItem) {
    beginPending(notification.id);

    void (async () => {
      const result = await markNotificationAsReadAction({
        notificationId: notification.id,
      });

      if (result.success && !notification.readAt) {
        markNotificationReadLocally(notification.id);
      }

      endPending(notification.id);
    })();
  }

  function markAllAsRead() {
    startMarkAllTransition(async () => {
      const result = await markAllNotificationsAsReadAction();

      if (!result.success || result.updatedCount === 0) {
        return;
      }

      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) =>
          notification.readAt
            ? notification
            : {
                ...notification,
                readAt,
              },
        ),
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {hasUnread
              ? "Unread notifications need attention"
              : "Everything is up to date"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a notification to jump to the relevant project surface, or mark
            it as read here.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={!hasUnread || isMarkingAll}
          onClick={markAllAsRead}
        >
          {isMarkingAll ? <Loader2 className="size-4 animate-spin" /> : null}
          Mark all as read
        </Button>
      </div>

      <NotificationsList
        emptyStateDescription={emptyStateDescription}
        emptyStateTitle={emptyStateTitle}
        mode="page"
        notifications={notifications}
        pendingIds={pendingIds}
        onMarkRead={markNotificationRead}
        onOpen={openNotification}
      />
    </div>
  );
}
