import type { LucideIcon } from "lucide-react";

export type ProjectStatus =
  | "in_progress"
  | "waiting_feedback"
  | "completed"
  | "active";

export type FeedbackStatus = "open" | "reviewed" | "resolved";

export type PaymentStatus = "paid" | "unpaid" | "partial" | "overdue" | "void";

export type ActivityType =
  | "project"
  | "feedback"
  | "payment"
  | "approval"
  | "file";

export type DashboardMetric = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export type DashboardProject = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  deadline: string | null;
  currentMilestone: string;
  paymentStatus: PaymentStatus;
  paymentAmountCents: number;
};

export type DashboardFeedback = {
  id: string;
  client: string;
  project: string;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
};

export type DashboardActivity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
};

export type DashboardPayment = {
  id: string;
  project: string;
  client: string;
  amountCents: number;
  status: PaymentStatus;
  dueDate: string | null;
};

export type DashboardQuickAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type AttentionKind =
  | "payment"
  | "blocked_task"
  | "approval"
  | "feedback"
  | "high_priority_task"
  | "project_setup";

export type DashboardAttentionItem = {
  id: string;
  kind: AttentionKind;
  title: string;
  context: string;
  reason: string;
  badgeLabel: string;
  badgeTone: "blue" | "green" | "yellow" | "red" | "purple" | "slate";
  href: string;
  actionLabel: string;
};

export type DashboardApproval = {
  id: string;
  project: string;
  client: string;
  title: string;
  status: "pending" | "approved" | "changes_requested" | "cancelled";
  requestedAt: string;
  respondedAt?: string | null;
};

export type DashboardProjectUpdate = {
  id: string;
  project: string;
  client: string;
  title: string;
  body: string;
  createdAt: string;
};

export type AdminDashboardData = {
  metrics: DashboardMetric[];
  attentionItems: DashboardAttentionItem[];
  projectProgress: DashboardProject[];
  recentFeedback: DashboardFeedback[];
  recentApprovals: DashboardApproval[];
  recentUpdates: DashboardProjectUpdate[];
  paymentSummary: DashboardPayment[];
  activity: DashboardActivity[];
  quickActions: DashboardQuickAction[];
};
