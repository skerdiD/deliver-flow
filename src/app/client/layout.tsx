import { ClientPortalLayout } from "@/components/layouts/client-portal-layout";
import { DashboardTheme } from "@/components/theme/dashboard-theme";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { Metadata } from "next";
import { routes } from "@/config/routes";
import { getClientAssignedProjects } from "@/features/client/portal/portal-data";
import { getNotificationCenterState } from "@/features/notifications/notification-service";
import { requireRole } from "@/lib/supabase/auth";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ClientLayout({ children }: ClientLayoutProps) {
  const profile = await requireRole("client");
  const [projects, notificationCenterState] = await Promise.all([
    getClientAssignedProjects(),
    getNotificationCenterState({
      limit: 8,
    }),
  ]);

  return (
    <ThemeProvider>
      <DashboardTheme>
        <ClientPortalLayout
          profile={profile}
          projects={projects}
          notificationCenterState={notificationCenterState}
          notificationsHref={routes.client.notifications}
        >
          {children}
        </ClientPortalLayout>
      </DashboardTheme>
    </ThemeProvider>
  );
}
