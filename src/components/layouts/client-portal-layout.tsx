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
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full min-h-0">
        <ClientSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileSidebar type="client" />

          <AppTopbar
            title="Client Portal"
            description="Track projects, files, feedback, approvals, and payments."
            userName={profile.full_name}
            userRoleLabel="Client"
          />

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}