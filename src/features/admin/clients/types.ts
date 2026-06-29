export type AdminClientStatus = "active" | "paused" | "archived";

export type AdminClientProjectStatus =
  | "active"
  | "in_progress"
  | "waiting_feedback"
  | "completed";

export type AdminClientProject = {
  id: string;
  name: string;
  status: AdminClientProjectStatus;
  progress: number;
  budgetCents: number;
  paidCents: number;
  nextMilestone: string;
  deadline: string;
};

export type AdminClient = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  status: AdminClientStatus;
  activeProjects: number;
  totalPaidCents: number;
  latestActivity: string;
  createdAt: string;
  archivedAt: string | null;
  projects: AdminClientProject[];
};
