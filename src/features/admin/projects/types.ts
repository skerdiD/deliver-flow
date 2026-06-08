export type AdminProjectStatus =
  | "active"
  | "in_progress"
  | "waiting_feedback"
  | "completed"
  | "archived";

export type AdminPaymentStatus = "paid" | "unpaid" | "partial" | "overdue";

export type AdminTaskStatus = "todo" | "in_progress" | "completed";

export type AdminMilestoneStatus =
  | "not_started"
  | "in_progress"
  | "waiting_approval"
  | "completed";

export type AdminApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested";

export type AdminFeedbackStatus = "open" | "reviewed" | "resolved";

export type AdminProjectClient = {
  id: string;
  name: string;
  company: string;
  email: string;
};

export type AdminProjectTask = {
  id: string;
  title: string;
  description: string;
  status: AdminTaskStatus;
  dueDate: string;
};

export type AdminProjectMilestone = {
  id: string;
  title: string;
  description: string;
  status: AdminMilestoneStatus;
  dueDate: string;
};

export type AdminProjectUpdate = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type AdminProjectFeedback = {
  id: string;
  clientName: string;
  message: string;
  status: AdminFeedbackStatus;
  createdAt: string;
};

export type AdminProjectApproval = {
  id: string;
  title: string;
  status: AdminApprovalStatus;
  note: string;
  requestedAt: string;
};

export type AdminProject = {
  id: string;
  name: string;
  description: string;
  client: AdminProjectClient;
  status: AdminProjectStatus;
  progress: number;
  deadline: string;
  liveDemoUrl: string;
  repositoryUrl: string;
  paymentStatus: AdminPaymentStatus;
  budgetCents: number;
  paidCents: number;
  milestones: AdminProjectMilestone[];
  tasks: AdminProjectTask[];
  updates: AdminProjectUpdate[];
  feedback: AdminProjectFeedback[];
  approval: AdminProjectApproval;
  createdAt: string;
};