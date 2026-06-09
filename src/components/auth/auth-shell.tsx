import { CheckCircle2, FolderKanban, ShieldCheck } from "lucide-react";
import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const benefits = [
  "Track what's done, what's next, and what needs approval.",
  "Give clients a clear view of project progress without long email threads.",
  "Keep files, feedback, payments, and approvals organized.",
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.95fr)]">
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 flex w-fit items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                D
              </div>

              <div>
                <p className="text-sm font-semibold leading-none text-slate-950">
                  DeliverFlow
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Client portal for freelancers
                </p>
              </div>
            </Link>

            <div className="mb-6">
              <p className="text-sm font-medium text-blue-600">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>

            {children}
          </div>
        </section>

        <aside className="hidden border-l border-slate-200 bg-white lg:flex lg:items-center">
          <div className="mx-auto w-full max-w-xl px-10">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      SaaS Dashboard MVP
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Nova Agency</p>
                  </div>

                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    In progress
                  </span>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Project progress
                    </span>
                    <span className="font-semibold text-slate-950">68%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 w-[68%] rounded-full bg-blue-600" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <FolderKanban className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Current milestone
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Backend API integration
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-white text-amber-600">
                        <ShieldCheck className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-950">
                          Approval needed
                        </p>
                        <p className="mt-1 text-sm text-amber-800">
                          Frontend dashboard screens are ready for review.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Clear project delivery for both sides.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                DeliverFlow gives freelancers a clean admin workspace and gives
                clients one private place to follow the work.
              </p>

              <div className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-600" />
                    <p className="text-sm leading-6 text-slate-600">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
