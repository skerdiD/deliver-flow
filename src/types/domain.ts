export type ProjectStatus =
  | "draft"
  | "active"
  | "in_progress"
  | "waiting_feedback"
  | "completed"
  | "archived";

export type TaskStatus = "todo" | "in_progress" | "completed";

export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "waiting_approval"
  | "approved"
  | "completed";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "overdue";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested";

export type FeedbackStatus = "open" | "reviewed" | "resolved";