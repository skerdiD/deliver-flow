import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  FolderKanban,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const heroPoints = [
  "One admin workspace for projects, files, approvals, feedback, and payments.",
  "One private client portal for progress, decisions, and handoff details.",
  "Fewer scattered messages, status checks, and lost project context.",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:px-8 lg:py-24">
        <div className="animate-fade-in-up flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-100">
            <ShieldCheck className="size-4" />
            Built for client delivery
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Deliver client work without the chaos.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            DeliverFlow gives freelancers one workspace to manage projects,
            files, approvals, feedback, and payments while clients get one
            private place to follow delivery progress.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-blue-600 text-white hover:bg-blue-500 sm:w-auto"
            >
              <Link href="/login">
                Open workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:max-w-xl">
            {heroPoints.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-300" />
                <p className="text-sm leading-6 text-slate-300">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in-up animate-delay-150 lg:py-4">
          <div className="animate-subtle-float rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-blue-950/40 backdrop-blur">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
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
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Project progress
                  </span>
                  <span className="font-semibold text-slate-950">68%</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="animate-progress-grow h-2 rounded-full bg-blue-600 [--progress-width:68%]" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <FolderKanban className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Current milestone
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        Backend API integration
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-medium uppercase text-amber-700">
                    Approval needed
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-950">
                    Frontend dashboard screens
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <PreviewItem
                  icon={FileText}
                  title="File"
                  value="invoice.pdf"
                />
                <PreviewItem
                  icon={MessageSquare}
                  title="Update"
                  value="API work started"
                />
                <PreviewItem
                  icon={ReceiptText}
                  title="Payment"
                  value="$900 due"
                />
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid size-7 place-items-center rounded-full bg-green-100 text-green-700">
                  <Check className="size-4" />
                </div>
                <p className="text-sm text-slate-600">
                  Client sees the same delivery status in their private portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type PreviewItemProps = {
  icon: typeof FileText;
  title: string;
  value: string;
};

function PreviewItem({ icon: Icon, title, value }: PreviewItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <Icon className="size-4 text-blue-600" />
      <p className="mt-2 text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
