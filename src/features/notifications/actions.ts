"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { routes } from "@/config/routes";
import {
  markAllNotificationsAsReadForCurrentUser,
  markNotificationAsReadForCurrentUser,
} from "@/features/notifications/notification-service";

const notificationIdSchema = z.object({
  notificationId: z.string().uuid("Notification id is invalid."),
});

export type NotificationActionResult = {
  success: boolean;
  message: string;
  actionUrl?: string | null;
  updatedCount?: number;
};

function revalidateNotificationSurfaces() {
  revalidatePath(routes.admin.notifications);
  revalidatePath(routes.client.notifications);
}

export async function markNotificationAsReadAction(input: {
  notificationId: string;
}): Promise<NotificationActionResult> {
  const parsed = notificationIdSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Notification request is invalid.",
    };
  }

  const result = await markNotificationAsReadForCurrentUser(
    parsed.data.notificationId,
  );

  revalidateNotificationSurfaces();

  return {
    success: true,
    message: result.updated
      ? "Notification marked as read."
      : "Notification already read.",
    actionUrl: result.actionUrl,
    updatedCount: result.updated ? 1 : 0,
  };
}

export async function markAllNotificationsAsReadAction(): Promise<NotificationActionResult> {
  const result = await markAllNotificationsAsReadForCurrentUser();

  revalidateNotificationSurfaces();

  return {
    success: true,
    message:
      result.updatedCount > 0
        ? "Notifications marked as read."
        : "No unread notifications to update.",
    updatedCount: result.updatedCount,
  };
}
