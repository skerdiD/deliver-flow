import { LogoutButton } from "@/components/auth/logout-button";

type DashboardShellProps = {
  title: string;
  description: string;
  eyebrow: string;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  description,
  eyebrow,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {description}
            </p>
          </div>

          <LogoutButton />
        </header>

        {children}
      </div>
    </main>
  );
}
