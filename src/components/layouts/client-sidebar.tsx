"use client";

import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { clientNavigation } from "@/config/navigation";
import { routes } from "@/config/routes";

export function ClientSidebar() {
  return (
    <DashboardSidebar
      homeHref={routes.client.dashboard}
      subtitle="Client portal"
      navigation={clientNavigation}
      expandedWidthClass="w-72"
      footerTitle="Project updates"
      footerDescription="Track files, approvals, feedback, and progress in one place."
      preserveProjectId
    />
  );
}
