import {
  BarChart3,
  ChartNoAxesCombined,
  BadgeCheck,
  BriefcaseBusiness,
  CreditCard,
  Files,
  Flag,
  FolderKanban,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

import { routes } from "@/config/routes";

export const adminNavigation = [
  {
    title: "Dashboard",
    href: routes.admin.dashboard,
    icon: BarChart3,
  },
  {
    title: "Analytics",
    href: routes.admin.analytics,
    icon: ChartNoAxesCombined,
  },
  {
    title: "Clients",
    href: routes.admin.clients,
    icon: Users,
  },
  {
    title: "Projects",
    href: routes.admin.projects,
    icon: FolderKanban,
  },
  {
    title: "Notes",
    href: routes.admin.notes,
    icon: FileText,
  },
  {
    title: "Milestones",
    href: routes.admin.milestones,
    icon: Flag,
  },
  {
    title: "Feedback",
    href: routes.admin.feedback,
    icon: MessageSquare,
  },
  {
    title: "Payments",
    href: routes.admin.payments,
    icon: CreditCard,
  },
  {
    title: "Files",
    href: routes.admin.files,
    icon: Files,
  },
  {
    title: "Approvals",
    href: routes.admin.approvals,
    icon: BadgeCheck,
  },
  {
    title: "Settings",
    href: routes.admin.settings,
    icon: Settings,
  },
] as const;

export const clientNavigation = [
  {
    title: "Overview",
    href: routes.client.dashboard,
    icon: Home,
  },
  {
    title: "Project",
    href: routes.client.project,
    icon: BriefcaseBusiness,
  },
  {
    title: "Files",
    href: routes.client.files,
    icon: Files,
  },
  {
    title: "Feedback",
    href: routes.client.feedback,
    icon: MessageSquare,
  },
  {
    title: "Approvals",
    href: routes.client.approvals,
    icon: BadgeCheck,
  },
  {
    title: "Payments",
    href: routes.client.payments,
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: routes.client.settings,
    icon: Settings,
  },
] as const;
