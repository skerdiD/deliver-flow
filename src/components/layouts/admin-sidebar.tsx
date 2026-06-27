"use client";

import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { adminNavigation } from "@/config/navigation";

export function AdminSidebar() {
  return (
    <DashboardSidebar
      homeHref="/admin/dashboard"
      subtitle="Admin workspace"
      navigation={adminNavigation}
      expandedWidthClass="w-72"
      footerTitle="Delivery clarity"
      footerDescription="Share progress without messy back-and-forth messages."
    />
  );
}