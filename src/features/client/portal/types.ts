export type ClientProjectStatus =
  | "active"
  | "in_progress"
  | "waiting_feedback"
  | "completed";

export type ClientMilestoneStatus =
  | "not_started"
  | "in_progress"
  | "waiting_approval"
  | "approved"
  | "completed";

export type ClientTaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "completed";

export type ClientPaymentStatus = "paid" | "partial" | "unpaid" | "overdue";

export type ClientApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested";

export type ClientFeedbackStatus = "open" | "reviewed" | "resolved";

export type ClientPortalTask = {
  id: string;
  title: string;
  description: string;
  status: ClientTaskStatus;
};

export type ClientPortalMilestone = {
  id: string;
  title: string;
  description: string;
  status: ClientMilestoneStatus;
  dueDate: string;
};

export type ClientPortalUpdate = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type ClientPortalFile = {
  id: string;
  name: string;
  type: "pdf" | "image" | "docx" | "other";
  size: string;
  category: string;
  uploadedAt: string;
  bucketName: string;
  storagePath: string;
};

export type ClientPortalPayment = {
  id: string;
  label: string;
  amountCents: number;
  status: ClientPaymentStatus;
  dueDate: string;
  paidAt?: string;
};

export type ClientPortalFeedback = {
  id: string;
  message: string;
  status: ClientFeedbackStatus;
  createdAt: string;
  adminResponse?: string | null;
};

export type ClientPortalApproval = {
  id: string;
  title: string;
  description: string;
  status: ClientApprovalStatus;
  responseNote?: string;
  requestedAt: string;
  respondedAt?: string | null;
};

export type ClientPortalProject = {
  id: string;
  name: string;
  clientName: string;
  companyName: string;
  description: string;
  status: ClientProjectStatus;
  progress: number;
  currentMilestone: string;
  deadline: string | null;
  liveDemoUrl?: string | null;
  repositoryUrl?: string;
  totalAmountCents: number;
  paidAmountCents: number;
  paymentStatus: ClientPaymentStatus;
  milestones: ClientPortalMilestone[];
  tasks: ClientPortalTask[];
  updates: ClientPortalUpdate[];
  files: ClientPortalFile[];
  payments: ClientPortalPayment[];
  feedback: ClientPortalFeedback[];
  approval: ClientPortalApproval | null;
};
