import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupLoading() {
  return (
    <AuthShell
      title="Create your DeliverFlow workspace"
      description="Start a workspace to manage clients, projects, files, payments, feedback, and approvals."
    >
      <div
        aria-busy="true"
        aria-label="Loading account creation"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="space-y-5">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-10 animate-pulse rounded-md bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-10 animate-pulse rounded-md bg-slate-100" />
          <div className="h-11 animate-pulse rounded-md bg-blue-100" />
        </div>
      </div>
    </AuthShell>
  );
}
