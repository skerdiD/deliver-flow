import type {
  ClientApprovalStatus,
  ClientFeedbackStatus,
  ClientPortalFeedback,
  ClientPortalProject,
} from "@/features/client/portal/types";

let clientProjectStore: ClientPortalProject = {
  id: "project_saas_mvp",
  name: "SaaS Dashboard MVP",
  clientName: "Sarah Johnson",
  companyName: "Nova Agency",
  description:
    "A SaaS-style dashboard MVP with login, analytics, project tracking, and admin workflows.",
  status: "in_progress",
  progress: 68,
  currentMilestone: "Backend API integration",
  deadline: "2026-07-15",
  liveDemoUrl: "https://demo.deliverflow.dev/saas-dashboard-mvp",
  repositoryUrl: "https://github.com/example/saas-dashboard-mvp",
  totalAmountCents: 240000,
  paidAmountCents: 150000,
  paymentStatus: "partial",
  milestones: [
    {
      id: "milestone_1",
      title: "Project setup and planning",
      description: "Repository, app structure, and delivery plan completed.",
      status: "completed",
      dueDate: "2026-06-01",
    },
    {
      id: "milestone_2",
      title: "Frontend dashboard screens",
      description: "Admin dashboard and project overview screens are ready.",
      status: "completed",
      dueDate: "2026-06-10",
    },
    {
      id: "milestone_3",
      title: "Backend API integration",
      description:
        "Connect project data, protected actions, and Supabase logic.",
      status: "in_progress",
      dueDate: "2026-07-05",
    },
    {
      id: "milestone_4",
      title: "Final review and handoff",
      description: "Final test pass, client review, and delivery notes.",
      status: "not_started",
      dueDate: "2026-07-15",
    },
  ],
  tasks: [
    {
      id: "task_1",
      title: "Build dashboard layout",
      description: "Main admin overview and project cards.",
      status: "completed",
    },
    {
      id: "task_2",
      title: "Create client portal view",
      description: "Progress, files, updates, feedback, and payments.",
      status: "completed",
    },
    {
      id: "task_3",
      title: "Connect project data",
      description: "Prepare the project queries and protected data access.",
      status: "in_progress",
    },
    {
      id: "task_4",
      title: "Add approval flow",
      description:
        "Approve milestone or request changes from the client portal.",
      status: "todo",
    },
  ],
  updates: [
    {
      id: "update_1",
      title: "Dashboard screens completed",
      body: "The main dashboard layout is ready. Current work is focused on connecting project data and approval actions.",
      createdAt: "2026-06-08T10:00:00.000Z",
    },
    {
      id: "update_2",
      title: "API work started",
      body: "Project progress, files, updates, and milestones are being prepared for Supabase integration.",
      createdAt: "2026-06-06T12:00:00.000Z",
    },
    {
      id: "update_3",
      title: "Project structure is ready",
      body: "The base structure is complete. This gives us a clean place to add tasks, milestones, payments, approvals, and files.",
      createdAt: "2026-06-04T15:30:00.000Z",
    },
  ],
  files: [
    {
      id: "file_1",
      name: "proposal.pdf",
      type: "pdf",
      size: "420 KB",
      category: "Proposal",
      uploadedAt: "2026-06-01T09:30:00.000Z",
    },
    {
      id: "file_2",
      name: "homepage-design.png",
      type: "image",
      size: "1.8 MB",
      category: "Design",
      uploadedAt: "2026-06-05T13:20:00.000Z",
    },
    {
      id: "file_3",
      name: "project-brief.docx",
      type: "docx",
      size: "260 KB",
      category: "Brief",
      uploadedAt: "2026-06-02T11:15:00.000Z",
    },
    {
      id: "file_4",
      name: "invoice.pdf",
      type: "pdf",
      size: "180 KB",
      category: "Invoice",
      uploadedAt: "2026-06-03T10:00:00.000Z",
    },
  ],
  payments: [
    {
      id: "payment_1",
      label: "Initial deposit",
      amountCents: 150000,
      status: "paid",
      dueDate: "2026-06-01",
      paidAt: "2026-06-01",
    },
    {
      id: "payment_2",
      label: "Backend integration milestone",
      amountCents: 90000,
      status: "unpaid",
      dueDate: "2026-07-05",
    },
  ],
  feedback: [
    {
      id: "feedback_1",
      message:
        "The dashboard looks clean. Please adjust the analytics chart spacing before the next review.",
      status: "open",
      createdAt: "2026-06-08T09:30:00.000Z",
    },
  ],
  approval: {
    id: "approval_1",
    title: "Frontend development milestone",
    description:
      "The dashboard screens are ready for review. Please approve them or request changes.",
    status: "pending",
    requestedAt: "2026-06-08T10:15:00.000Z",
  },
};

export async function getClientPortalProject() {
  return clientProjectStore;
}

export async function addClientFeedback(message: string) {
  const feedback: ClientPortalFeedback = {
    id: `feedback_${Date.now()}`,
    message,
    status: "open" satisfies ClientFeedbackStatus,
    createdAt: new Date().toISOString(),
  };

  clientProjectStore = {
    ...clientProjectStore,
    feedback: [feedback, ...clientProjectStore.feedback],
  };

  return feedback;
}

export async function respondToClientApproval(input: {
  status: Extract<ClientApprovalStatus, "approved" | "changes_requested">;
  responseNote?: string;
}) {
  clientProjectStore = {
    ...clientProjectStore,
    approval: {
      ...clientProjectStore.approval,
      status: input.status,
      responseNote: input.responseNote,
    },
  };

  return clientProjectStore.approval;
}