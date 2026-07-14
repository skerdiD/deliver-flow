"use client";

import { Bell, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/features/notifications/actions";
import { NotificationsList } from "@/features/notifications/notifications-list";
import type {
  NotificationCenterState,
  NotificationListItem,
} from "@/features/notifications/types";

type NotificationCenterProps = {
  initialState: NotificationCenterState;
  notificationsHref: string;
};

function markNotificationReadLocally(
  notifications: NotificationListItem[],
  notificationId: string,
) {
  const readAt = new Date().toISOString();

  return notifications.map((notification) =>
    notification.id === notificationId && !notification.readAt
      ? {
          ...notification,
          readAt,
        }
      : notification,
  );
}

export function NotificationCenter({
  initialState,
  notificationsHref,
}: NotificationCenterProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(
    initialState.notifications,
  );
  const [unreadCount, setUnreadCount] = useState(initialState.unreadCount);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isMarkingAll, startMarkAllTransition] = useTransition();
  const [isNavigating, startOpenTransition] = useTransition();
  const hasUnread = unreadCount > 0;
  const visibleUnreadCount = unreadCount > 99 ? "99+" : `${unreadCount}`;

  const menuNotifications = useMemo(
    () => notifications.slice(0, 6),
    [notifications],
  );

  function beginPending(notificationId: string) {
    setPendingIds((current) =>
      current.includes(notificationId) ? current : [...current, notificationId],
    );
  }

  function endPending(notificationId: string) {
    setPendingIds((current) => current.filter((id) => id !== notificationId));
  }

  function markNotificationRead(notification: NotificationListItem) {
    beginPending(notification.id);

    startOpenTransition(async () => {
      const result = await markNotificationAsReadAction({
        notificationId: notification.id,
      });

      if (result.success && !notification.readAt) {
        setNotifications((current) =>
          markNotificationReadLocally(current, notification.id),
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      }

      endPending(notification.id);
    });
  }

  function openNotification(notification: NotificationListItem) {
    beginPending(notification.id);

    startOpenTransition(async () => {
      const result = notification.readAt
        ? { actionUrl: notification.actionUrl, success: true }
        : await markNotificationAsReadAction({
            notificationId: notification.id,
          });

      if (result.success && !notification.readAt) {
        setNotifications((current) =>
          markNotificationReadLocally(current, notification.id),
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      }

      endPending(notification.id);

      if (notification.actionUrl || result.actionUrl) {
        router.push(
          notification.actionUrl ?? result.actionUrl ?? notificationsHref,
        );
        return;
      }

      router.refresh();
    });
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
      setUnreadCount(0);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={
            hasUnread ? `${unreadCount} unread notifications` : "Notifications"
          }
          className="relative rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:border-primary/30 hover:bg-muted hover:text-foreground"
        >
          {isNavigating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Bell className="size-4" />
          )}
          {hasUnread ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary-foreground">
              {visibleUnreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(28rem,92vw)] p-2">
        <div className="flex items-center justify-between gap-3 px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-xs"
            disabled={!hasUnread || isMarkingAll}
            onClick={markAllAsRead}
          >
            {isMarkingAll ? <Loader2 className="size-4 animate-spin" /> : null}
            Mark all as read
          </Button>
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[28rem] overflow-y-auto p-2">
          <NotificationsList
            emptyStateDescription="New updates, approvals, files, and payment reminders will show up here."
            emptyStateTitle="No notifications yet"
            mode="menu"
            notifications={menuNotifications}
            pendingIds={pendingIds}
            onMarkRead={markNotificationRead}
            onOpen={openNotification}
          />
        </div>

        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push(notificationsHref)}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
