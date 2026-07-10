import {
  BadgeCheck,
  Bell,
  CreditCard,
  FileText,
  MessageSquare,
  RefreshCcw,
} from "lucide-react";

import type { NotificationType } from "@/features/notifications/types";

type NotificationMeta = {
  icon: typeof Bell;
  iconClassName: string;
  label: string;
};

const notificationMeta: Record<NotificationType, NotificationMeta> = {
  approval_accepted: {
    icon: BadgeCheck,
    iconClassName: "bg-emerald-50 text-emerald-600",
    label: "Approval accepted",
  },
  approval_changes_requested: {
    icon: RefreshCcw,
    iconClassName: "bg-amber-50 text-amber-600",
    label: "Changes requested",
  },
  approval_requested: {
    icon: BadgeCheck,
    iconClassName: "bg-blue-50 text-blue-600",
    label: "Approval requested",
  },
  feedback_submitted: {
    icon: MessageSquare,
    iconClassName: "bg-purple-50 text-purple-600",
    label: "Feedback submitted",
  },
  payment_due: {
    icon: CreditCard,
    iconClassName: "bg-sky-50 text-sky-600",
    label: "Payment due",
  },
  payment_overdue: {
    icon: CreditCard,
    iconClassName: "bg-red-50 text-red-600",
    label: "Payment overdue",
  },
  project_file_uploaded: {
    icon: FileText,
    iconClassName: "bg-slate-100 text-slate-700",
    label: "File uploaded",
  },
  project_update_created: {
    icon: Bell,
    iconClassName: "bg-slate-100 text-slate-700",
    label: "Project update",
  },
};

export function getNotificationMeta(type: NotificationType) {
  return notificationMeta[type];
}
