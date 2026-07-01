import { formatCurrencyFromCents } from "@/lib/format";
import type {
  ApprovalStatus,
  FeedbackStatus,
  PaymentStatus,
  ProjectFileCategory,
  TaskPriority,
  TaskStatus,
} from "@/types/database";

type BadgeTone = "blue" | "green" | "yellow" | "red" | "purple" | "slate";

type AdminProjectContext = {
  projectId: string;
  projectName: string;
  clientName: string;
  clientEmail: string | null;
};

export type AdminTaskRecord = AdminProjectContext & {
  id: string;
  title: string;
  description: string | null;
  milestoneTitle: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  isVisibleToClient: boolean;
  updatedAt: string;
};

export type AdminTasksPageData = {
  tasks: AdminTaskRecord[];
  summary: {
    total: number;
    completed: number;
    blocked: number;
    dueSoon: number;
  };
};

export type AdminFeedbackRecord = AdminProjectContext & {
  id: string;
  message: string;
  status: FeedbackStatus;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminFeedbackPageData = {
  feedback: AdminFeedbackRecord[];
  summary: {
    unread: number;
    reviewed: number;
    resolved: number;
  };
};

export type AdminPaymentRecord = AdminProjectContext & {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string | null;
  paidAt: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  notes: string | null;
};

export type AdminPaymentsPageData = {
  payments: AdminPaymentRecord[];
  summary: {
    totalPaidCents: number;
    outstandingCents: number;
    overdueCount: number;
    pendingCount: number;
  };
};

export type AdminFileRecord = AdminProjectContext & {
  id: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  category: ProjectFileCategory;
  bucketName: string;
  storagePath: string;
  isVisibleToClient: boolean;
  createdAt: string;
};

export type AdminFilesPageData = {
  files: AdminFileRecord[];
  summary: {
    totalFiles: number;
    visibleToClients: number;
    internalOnly: number;
    totalSizeBytes: number;
  };
};

export type AdminApprovalRecord = AdminProjectContext & {
  id: string;
  title: string;
  description: string | null;
  milestoneTitle: string | null;
  status: ApprovalStatus;
  responseNote: string | null;
  requestedAt: string;
  respondedAt: string | null;
};

export type AdminApprovalsPageData = {
  approvals: AdminApprovalRecord[];
  summary: {
    pending: number;
    approved: number;
    changesRequested: number;
  };
};

export type AdminSettingsData = {
  fullName: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export function getTaskStatusMeta(status: TaskStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "completed":
      return { label: "Completed", tone: "green" };
    case "in_progress":
      return { label: "In progress", tone: "blue" };
    case "blocked":
      return { label: "Blocked", tone: "red" };
    default:
      return { label: "To do", tone: "slate" };
  }
}

export function getTaskPriorityMeta(priority: TaskPriority): {
  label: string;
  tone: BadgeTone;
} {
  switch (priority) {
    case "high":
      return { label: "High", tone: "red" };
    case "medium":
      return { label: "Medium", tone: "yellow" };
    default:
      return { label: "Low", tone: "slate" };
  }
}

export function getFeedbackStatusMeta(status: FeedbackStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "resolved":
      return { label: "Resolved", tone: "green" };
    case "reviewed":
      return { label: "Reviewed", tone: "blue" };
    default:
      return { label: "Unread", tone: "yellow" };
  }
}

export function getPaymentStatusMeta(status: PaymentStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "paid":
      return { label: "Paid", tone: "green" };
    case "partial":
      return { label: "Partial", tone: "blue" };
    case "overdue":
      return { label: "Overdue", tone: "red" };
    case "void":
      return { label: "Void", tone: "slate" };
    default:
      return { label: "Unpaid", tone: "yellow" };
  }
}

export function getApprovalStatusMeta(status: ApprovalStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "approved":
      return { label: "Approved", tone: "green" };
    case "changes_requested":
      return { label: "Changes requested", tone: "yellow" };
    case "cancelled":
      return { label: "Cancelled", tone: "slate" };
    default:
      return { label: "Pending", tone: "purple" };
  }
}

export function getFileVisibilityMeta(isVisibleToClient: boolean): {
  label: string;
  tone: BadgeTone;
} {
  if (isVisibleToClient) {
    return { label: "Client", tone: "blue" };
  }

  return { label: "Internal", tone: "slate" };
}

export function getFileCategoryLabel(category: ProjectFileCategory) {
  switch (category) {
    case "brief":
      return "Brief";
    case "deliverable":
      return "Deliverable";
    case "design":
      return "Design";
    case "document":
      return "Document";
    case "invoice":
      return "Invoice";
    default:
      return "Other";
  }
}

export function formatDateLabel(
  value: string | null,
  fallback = "No date set",
) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTimeLabel(
  value: string | null,
  fallback = "Not available",
) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatPaymentAmount(amountCents: number, currency: string) {
  return formatCurrencyFromCents(amountCents, currency);
}

export function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes || sizeBytes <= 0) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = sizeBytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 10 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded} ${units[unitIndex]}`;
}
