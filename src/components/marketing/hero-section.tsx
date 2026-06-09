import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const heroPoints = [
  "Track what's done, what's next, and what needs approval.",
  "Keep files, updates, approvals, and feedback in one place.",
  "Give clients a clear view without long email threads.",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_34rem)]" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <ShieldCheck className="size-4" />
            Built for freelance project delivery
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Give clients a clear place to follow project progress.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            DeliverFlow helps freelancers manage project updates, files,
            feedback, approvals, and payments while clients track everything
            from one private portal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">
                View demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-3">
            {heroPoints.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-600" />
                <p className="text-sm leading-6 text-slate-600">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                <div className="h-2 w-[68%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <FileText className="size-5 text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  Files ready
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Proposal, brief, invoice, and design preview.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <MessageSquare className="size-5 text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  Feedback open
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Client notes stay tied to the project.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950">
                Approval needed
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Frontend dashboard screens are ready for review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
