"use client";

import { clientNavigation } from "@/config/navigation";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";

export function ClientSidebar() {
  return (
    <DashboardSidebar
      homeHref="/client/dashboard"
      subtitle="Client portal"
      navigation={clientNavigation}
      expandedWidthClass="w-64"
      footerTitle="Project status"
      footerDescription="Track completed work, next steps, and anything waiting for approval."
    />
  );
}
