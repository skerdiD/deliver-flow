import type {
  NotificationEntityType,
  NotificationType,
} from "@/types/database";

export type {
  NotificationEntityType,
  NotificationType,
} from "@/types/database";

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  projectId: string | null;
  projectName: string | null;
  actorName: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationCenterState = {
  notifications: NotificationListItem[];
  unreadCount: number;
};
