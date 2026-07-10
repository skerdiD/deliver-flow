export type AdminProjectStatus =
  | "active"
  | "in_progress"
  | "waiting_feedback"
  | "completed"
  | "archived";

export type AdminPaymentStatus =
  | "paid"
  | "unpaid"
  | "partial"
  | "overdue"
  | "void";

export type AdminTaskStatus = "todo" | "in_progress" | "completed";

export type AdminMilestoneStatus =
  | "not_started"
  | "in_progress"
  | "waiting_approval"
  | "approved"
  | "completed";

export type AdminApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested"
  | "cancelled";

export type AdminFeedbackStatus = "open" | "reviewed" | "resolved";
export type AdminProjectFileScanStatus =
  | "pending"
  | "clean"
  | "infected"
  | "failed";

export type AdminProjectActivity = {
  id: string;
  actorName: string | null;
  actorRole: "owner" | "client" | "system";
  type: string;
  message: string;
  createdAt: string;
};

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
  priority?: "low" | "medium" | "high";
  isVisibleToClient?: boolean;
};

export type AdminProjectMilestone = {
  id: string;
  title: string;
  description: string;
  status: AdminMilestoneStatus;
  dueDate: string;
  position?: number;
  approvalStatus?: AdminApprovalStatus | null;
};

export type AdminProjectUpdate = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isVisibleToClient?: boolean;
  viewedAt?: string | null;
};

export type AdminProjectFeedback = {
  id: string;
  clientName: string;
  message: string;
  status: AdminFeedbackStatus;
  adminResponse: string | null;
  createdAt: string;
};

export type AdminProjectApproval = {
  id: string;
  title: string;
  status: AdminApprovalStatus;
  note: string;
  milestoneTitle?: string | null;
  responseNote?: string | null;
  requestedAt: string;
  respondedAt?: string | null;
  viewedAt?: string | null;
};

export type AdminProjectFile = {
  id: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  category: string;
  originalFileName: string;
  scanStatus: AdminProjectFileScanStatus;
  uploadedByName: string | null;
  isVisibleToClient: boolean;
  createdAt: string;
  viewedAt?: string | null;
};

export type AdminProjectPayment = {
  id: string;
  amountCents: number;
  currency: string;
  status: AdminPaymentStatus;
  dueDate: string | null;
  paidAt: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  notes: string | null;
  viewedAt?: string | null;
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
  files?: AdminProjectFile[];
  payments?: AdminProjectPayment[];
  feedback: AdminProjectFeedback[];
  approvals?: AdminProjectApproval[];
  approval: AdminProjectApproval;
  activity: AdminProjectActivity[];
  clientLastSeenAt: string | null;
  createdAt: string;
  archivedAt: string | null;
};
