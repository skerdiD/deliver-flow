import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const benefits = [
  "Track what is done, next, and waiting for approval.",
  "Give clients one clear place to follow progress.",
  "Keep files, feedback, payments, and approvals organized.",
];

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.78fr)]">
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 flex w-fit items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
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
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
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
          <div className="mx-auto w-full max-w-md px-10">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
                  <span className="font-medium text-slate-700">Progress</span>
                  <span className="font-semibold text-slate-950">68%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[68%] rounded-full bg-blue-600" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">
                      Current milestone
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-950">
                      Backend API integration
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="text-xs font-medium uppercase text-amber-700">
                    Approval needed
                  </p>
                  <p className="mt-1 text-sm font-medium text-amber-950">
                    Frontend dashboard screens
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600" />
                  <p className="text-sm leading-6 text-slate-600">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
