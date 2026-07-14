import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout";
import { DashboardTheme } from "@/components/theme/dashboard-theme";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { Metadata } from "next";
import { routes } from "@/config/routes";
import { getAdminQuickActionProjects } from "@/features/admin/projects/projects-data";
import { getNotificationCenterState } from "@/features/notifications/notification-service";
import { requireOwnerRole } from "@/lib/supabase/auth";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const profile = await requireOwnerRole();
  const [quickActionProjects, notificationCenterState] = await Promise.all([
    getAdminQuickActionProjects(),
    getNotificationCenterState({
      limit: 8,
    }),
  ]);

  return (
    <ThemeProvider>
      <DashboardTheme>
        <AdminDashboardLayout
          profile={profile}
          quickActionProjects={quickActionProjects}
          notificationCenterState={notificationCenterState}
          notificationsHref={routes.admin.notifications}
        >
          {children}
        </AdminDashboardLayout>
      </DashboardTheme>
    </ThemeProvider>
  );
}
