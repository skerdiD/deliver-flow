import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout";
import { routes } from "@/config/routes";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { getAdminQuickActionProjects } from "@/features/admin/projects/projects-data";
import { getNotificationCenterState } from "@/features/notifications/notification-service";
import { isDemoWorkspaceSlug } from "@/lib/demo";
import { requireOwnerRole } from "@/lib/supabase/auth";
import { eq } from "drizzle-orm";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const profile = await requireOwnerRole();
  const [quickActionProjects, notificationCenterState, workspace] =
    await Promise.all([
      getAdminQuickActionProjects(),
      getNotificationCenterState({
        limit: 8,
      }),
      db
        .select({ slug: workspaces.slug })
        .from(workspaces)
        .where(eq(workspaces.id, profile.workspace_id))
        .limit(1),
    ]);

  return (
    <AdminDashboardLayout
      profile={profile}
      quickActionProjects={quickActionProjects}
      notificationCenterState={notificationCenterState}
      notificationsHref={routes.admin.notifications}
      isDemoWorkspace={isDemoWorkspaceSlug(workspace[0]?.slug)}
    >
      {children}
    </AdminDashboardLayout>
  );
}
