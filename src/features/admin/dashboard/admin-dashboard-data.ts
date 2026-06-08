import {
  CheckCircle2,
  CreditCard,
  FolderKanban,
  MessageSquare,
  PlusCircle,
  Send,
  Upload,
  Users,
} from "lucide-react";

import type {
  DashboardActivity,
  DashboardFeedback,
  DashboardMetric,
  DashboardPayment,
  DashboardProject,
  DashboardQuickAction,
} from "@/features/admin/dashboard/types";
import { formatCurrencyFromCents } from "@/lib/format";

export const adminDashboardProjects: DashboardProject[] = [
  {
    id: "project_agency_redesign",
    name: "Agency Website Redesign",
    client: "Creative Hub",
    status: "waiting_feedback",
    progress: 90,
    deadline: "2026-06-25",
    currentMilestone: "Final design review",
    paymentStatus: "paid",
    paymentAmountCents: 50000,
  },
  {
    id: "project_saas_mvp",
    name: "SaaS Dashboard MVP",
    client: "Nova Agency",
    status: "in_progress",
    progress: 68,
    deadline: "2026-07-15",
    currentMilestone: "Backend API integration",
    paymentStatus: "partial",
    paymentAmountCents: 150000,
  },
  {
    id: "project_client_portal",
    name: "Client Portal Build",
    client: "RetailCo",
    status: "active",
    progress: 45,
    deadline: "2026-08-20",
    currentMilestone: "Authentication and client access",
    paymentStatus: "unpaid",
    paymentAmountCents: 220000,
  },
];

export const adminDashboardFeedback: DashboardFeedback[] = [
  {
    id: "feedback_1",
    client: "Nova Agency",
    project: "SaaS Dashboard MVP",
    message:
      "The dashboard looks clean. Please adjust the analytics chart spacing before the next review.",
    status: "open",
    createdAt: "2026-06-08T09:30:00.000Z",
  },
  {
    id: "feedback_2",
    client: "RetailCo",
    project: "Client Portal Build",
    message:
      "The portal flow makes sense. Can we make the payment section easier to notice?",
    status: "reviewed",
    createdAt: "2026-06-07T16:20:00.000Z",
  },
  {
    id: "feedback_3",
    client: "Creative Hub",
    project: "Agency Website Redesign",
    message:
      "The homepage is much better now. Please make the call-to-action section more direct.",
    status: "open",
    createdAt: "2026-06-06T13:00:00.000Z",
  },
];

export const adminDashboardPayments: DashboardPayment[] = [
  {
    id: "payment_1",
    project: "Agency Website Redesign",
    client: "Creative Hub",
    amountCents: 50000,
    status: "paid",
    dueDate: "2026-06-03",
  },
  {
    id: "payment_2",
    project: "SaaS Dashboard MVP",
    client: "Nova Agency",
    amountCents: 90000,
    status: "unpaid",
    dueDate: "2026-07-05",
  },
  {
    id: "payment_3",
    project: "SaaS Dashboard MVP",
    client: "Nova Agency",
    amountCents: 150000,
    status: "partial",
    dueDate: "2026-06-01",
  },
  {
    id: "payment_4",
    project: "Client Portal Build",
    client: "RetailCo",
    amountCents: 220000,
    status: "unpaid",
    dueDate: "2026-07-20",
  },
];

export const adminDashboardActivity: DashboardActivity[] = [
  {
    id: "activity_1",
    type: "approval",
    title: "Frontend milestone is waiting for approval",
    description: "Nova Agency needs to review the latest dashboard screens.",
    createdAt: "2026-06-08T10:15:00.000Z",
  },
  {
    id: "activity_2",
    type: "feedback",
    title: "New feedback from Creative Hub",
    description: "They asked for a stronger call-to-action section.",
    createdAt: "2026-06-07T15:40:00.000Z",
  },
  {
    id: "activity_3",
    type: "payment",
    title: "Payment marked as partial",
    description: "Client Portal Build has a partial deposit recorded.",
    createdAt: "2026-06-06T11:10:00.000Z",
  },
  {
    id: "activity_4",
    type: "file",
    title: "Project brief uploaded",
    description: "A new brief file was added to SaaS Dashboard MVP.",
    createdAt: "2026-06-05T14:00:00.000Z",
  },
];

export const adminDashboardQuickActions: DashboardQuickAction[] = [
  {
    title: "Create project",
    description: "Start a new delivery workspace for a client.",
    href: "/admin/projects",
    icon: PlusCircle,
  },
  {
    title: "Add client",
    description: "Save client details and prepare account access.",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Upload file",
    description: "Attach briefs, invoices, designs, or delivery files.",
    href: "/admin/projects",
    icon: Upload,
  },
  {
    title: "Send update",
    description: "Share progress without messy back-and-forth messages.",
    href: "/admin/projects",
    icon: Send,
  },
];

export function getAdminDashboardMetrics(): DashboardMetric[] {
  const activeProjects = adminDashboardProjects.filter(
    (project) => project.status === "active" || project.status === "in_progress",
  ).length;

  const pendingFeedback = adminDashboardFeedback.filter(
    (feedback) => feedback.status === "open",
  ).length;

  const completedMilestones = 7;

  const outstandingPaymentCents = adminDashboardPayments
    .filter((payment) => payment.status === "unpaid" || payment.status === "partial")
    .reduce((total, payment) => total + payment.amountCents, 0);

  return [
    {
      title: "Active projects",
      value: String(activeProjects),
      description: "Projects currently moving",
      icon: FolderKanban,
    },
    {
      title: "Pending feedback",
      value: String(pendingFeedback),
      description: "Client notes to review",
      icon: MessageSquare,
    },
    {
      title: "Completed milestones",
      value: String(completedMilestones),
      description: "Delivered across projects",
      icon: CheckCircle2,
    },
    {
      title: "Outstanding payments",
      value: formatCurrencyFromCents(outstandingPaymentCents),
      description: "Unpaid or partially paid",
      icon: CreditCard,
    },
  ];
}