import { AppTopbar } from "@/components/layouts/app-topbar";
import { ClientSidebar } from "@/components/layouts/client-sidebar";
import { MobileSidebar } from "@/components/layouts/mobile-sidebar";
import type { Profile } from "@/types/database";

type ClientPortalLayoutProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function ClientPortalLayout({
  profile,
  children,
}: ClientPortalLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <ClientSidebar />

        <div className="min-w-0 flex-1">
          <MobileSidebar type="client" />

          <AppTopbar
            title="Client Portal"
            description="Check progress, files, feedback, and approvals."
            userName={profile.full_name}
            userRoleLabel="Client"
          />

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
