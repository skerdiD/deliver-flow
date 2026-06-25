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
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <ClientSidebar />

        <div className="min-w-0 flex-1 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
          <MobileSidebar type="client" />

          <AppTopbar
            title="Client Portal"
            description="Check progress, files, feedback, and approvals."
            userName={profile.full_name}
            userRoleLabel="Client"
          />

          <main className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
