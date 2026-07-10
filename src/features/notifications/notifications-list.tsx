"use client";

import { Bell, Loader2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { getNotificationMeta } from "@/features/notifications/notification-meta";
import type { NotificationListItem } from "@/features/notifications/types";

type NotificationsListProps = {
  emptyStateDescription: string;
  emptyStateTitle: string;
  mode: "menu" | "page";
  notifications: NotificationListItem[];
  pendingIds?: string[];
  onMarkRead: (notification: NotificationListItem) => void;
  onOpen: (notification: NotificationListItem) => void;
};

function isPendingNotification(
  notificationId: string,
  pendingIds: string[] | undefined,
) {
  return pendingIds?.includes(notificationId) ?? false;
}

function ReadStateBadge({ isRead }: { isRead: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
        isRead ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700",
      )}
    >
      {isRead ? "Read" : "Unread"}
    </span>
  );
}

function NotificationIcon({ type }: { type: NotificationListItem["type"] }) {
  const meta = getNotificationMeta(type);
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl",
        meta.iconClassName,
      )}
      aria-hidden="true"
    >
      <Icon className="size-4" />
    </div>
  );
}

function NotificationRow({
  mode,
  notification,
  pending,
  onMarkRead,
  onOpen,
}: {
  mode: "menu" | "page";
  notification: NotificationListItem;
  pending: boolean;
  onMarkRead: (notification: NotificationListItem) => void;
  onOpen: (notification: NotificationListItem) => void;
}) {
  const isRead = Boolean(notification.readAt);

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        isRead ? "border-slate-200 bg-white" : "border-blue-100 bg-blue-50/50",
      )}
    >
      <div className="flex gap-3">
        <NotificationIcon type={notification.type} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">
              {notification.title}
            </p>
            <ReadStateBadge isRead={isRead} />
            <span className="text-xs text-slate-500">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          {notification.projectName ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              {notification.projectName}
            </p>
          ) : null}

          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
            {notification.message}
          </p>

          <div
            className={cn(
              "mt-3 flex flex-wrap items-center gap-2",
              mode === "menu" ? "justify-between" : "",
            )}
          >
            <Button
              type="button"
              variant={mode === "menu" ? "ghost" : "outline"}
              className={cn(mode === "menu" ? "h-8 px-2 text-xs" : "")}
              disabled={pending}
              onClick={() => onOpen(notification)}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {notification.actionUrl ? "Open" : "Dismiss"}
            </Button>

            {!isRead ? (
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2 text-xs"
                disabled={pending}
                onClick={() => onMarkRead(notification)}
              >
                Mark as read
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsList({
  emptyStateDescription,
  emptyStateTitle,
  mode,
  notifications,
  pendingIds,
  onMarkRead,
  onOpen,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title={emptyStateTitle}
        description={emptyStateDescription}
      />
    );
  }

  return (
    <div className={cn(mode === "menu" ? "space-y-2" : "space-y-3")}>
      {notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          mode={mode}
          notification={notification}
          pending={isPendingNotification(notification.id, pendingIds)}
          onMarkRead={onMarkRead}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
