import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PanelTop,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

const proofPoints = [
  [PanelTop, "Shared client portal"],
  [BadgeCheck, "Milestones and approvals"],
  [ShieldCheck, "Secure file sharing"],
  [CircleDollarSign, "Payment tracking"],
  [BellRing, "Notifications"],
  [LayoutDashboard, "Workspace analytics"],
] as const;

const steps = [
  [
    FolderKanban,
    "Create a client workspace",
    "Start with the project scope, key dates, and the right people.",
  ],
  [
    FileText,
    "Share the work in context",
    "Bring updates, files, and milestones into one clean delivery view.",
  ],
  [
    BadgeCheck,
    "Collect clear decisions",
    "Turn approvals and feedback into visible next steps, not loose threads.",
  ],
  [
    CircleDollarSign,
    "Track the delivery rhythm",
    "Keep progress, payment status, and client activity easy to act on.",
  ],
] as const;

export function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-slate-50 text-slate-950">
      <LandingHeader />

      <section className="relative">
        <div
          className="landing-grid absolute inset-x-0 top-0 -z-0 h-[38rem] opacity-70"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[minmax(0,0.88fr)_minmax(34rem,1.12fr)] lg:items-center lg:gap-14 lg:px-10 lg:pb-32">
          <div className="landing-reveal max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm">
              <Sparkles className="size-3.5" />A calmer way to run client
              delivery
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-5xl sm:leading-[1.02] lg:text-[3.8rem]">
              Keep every client confidently in the loop.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              DeliverFlow gives freelancers and small agencies one refined
              workspace for projects, files, approvals, feedback, milestones,
              and payments.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group shadow-lg shadow-slate-950/10"
              >
                <Link href={routes.auth.signup}>
                  Create your workspace{" "}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.auth.login}>
                  Explore the demo <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <InlineCheck label="Owner workspace" />
              <InlineCheck label="Client portal" />
              <InlineCheck label="Built for real delivery" />
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section
        className="border-y border-slate-200/80 bg-white"
        aria-label="DeliverFlow product strengths"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:grid-cols-6 lg:px-10">
          {proofPoints.map(([Icon, label]) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm font-medium text-slate-600"
            >
              <Icon className="size-4 shrink-0 text-blue-700" />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10"
      >
        <SectionIntro
          eyebrow="A delivery system, not another inbox"
          title="A better rhythm for client work."
          description="Move from scattered messages to a shared, visible flow—without loading your team up with project-management overhead."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([Icon, title, description], index) => (
            <article
              key={title}
              className={`landing-reveal landing-delay-${index + 1} group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70`}
            >
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
                  <Icon className="size-5" />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-7 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="border-y border-slate-200/80 bg-white py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionIntro
            eyebrow="Why DeliverFlow"
            title="The operational clarity behind a great client experience."
            description="The tools you need to keep delivery moving—and the polished space clients need to follow it."
            centered
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <FeaturePanel
              className="lg:col-span-7"
              icon={PanelTop}
              eyebrow="CLIENT PORTAL"
              title="A professional home for every client."
              description="Give clients a calm, branded-feeling workspace where they can see progress, review files, and respond with confidence."
              visual={<PortalSnippet />}
            />
            <FeaturePanel
              className="lg:col-span-5"
              icon={BadgeCheck}
              eyebrow="DECISIONS, DOCUMENTED"
              title="Approvals that do not get lost."
              description="Each approval has a clear state, a note, and a next step—so delivery never depends on a buried reply."
              visual={<ApprovalSnippet />}
            />
            <FeaturePanel
              className="lg:col-span-5"
              icon={CircleDollarSign}
              eyebrow="DELIVERY HEALTH"
              title="Payments and priorities in view."
              description="Surface what is open, overdue, and ready to move so you can act before a project stalls."
              visual={<PaymentSnippet />}
            />
            <FeaturePanel
              className="lg:col-span-7"
              icon={BellRing}
              eyebrow="OWNER WORKSPACE"
              title="Know what needs attention, without the noise."
              description="Owner dashboards and analytics turn day-to-day delivery signals into a focused operating view."
              visual={<OwnerSnippet />}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionIntro
            eyebrow="Two sides of one workspace"
            title="Clearer for you. Reassuring for clients."
            description="DeliverFlow gives each side of the relationship the right level of detail, without duplicating work or creating confusion."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceCard
              icon={LayoutDashboard}
              title="Owner workspace"
              items={[
                "Projects and delivery signals",
                "Open feedback and approval queues",
                "Payment and workspace analytics",
              ]}
              tone="slate"
            />
            <ExperienceCard
              icon={UsersRound}
              title="Client portal"
              items={[
                "A simple view of project progress",
                "Files, updates, and milestones",
                "A clear place to approve or request changes",
              ]}
              tone="blue"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-100/70 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                Product-first by design
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                The important work stays visible.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                A focused workspace keeps delivery context together: progress
                when clients need an update, decisions when a milestone is
                ready, and financial status when it matters.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-700" />
                  No fabricated business metrics—just clear product capability.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-700" />
                  Focused views for delivery, feedback, approvals, and payments.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-700" />
                  A polished client experience without extra coordination
                  overhead.
                </li>
              </ul>
            </div>
            <OwnerWorkspacePreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-white shadow-2xl shadow-slate-950/15 sm:px-12 sm:py-16">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 size-48 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <Sparkles className="size-5 text-blue-300" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Deliver work your clients can follow and trust.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Create one clear home for every deliverable, decision, and
              update—then spend less time clarifying the work and more time
              doing it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-white text-slate-950 hover:bg-slate-100"
              >
                <Link href={routes.auth.signup}>
                  Create your workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="border border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={routes.auth.login}>Log in to DeliverFlow</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <BrandLogo subtitle="Client delivery, made clear" />
          <div className="flex gap-5 text-sm text-slate-500">
            <a className="hover:text-slate-950" href="#how-it-works">
              How it works
            </a>
            <a className="hover:text-slate-950" href="#features">
              Why DeliverFlow
            </a>
            <Link className="hover:text-slate-950" href={routes.auth.login}>
              Demo
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href={routes.home} aria-label="DeliverFlow home">
          <BrandLogo subtitle="Client delivery, made clear" />
        </Link>
        <nav
          className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
          aria-label="Primary navigation"
        >
          <a
            className="transition-colors hover:text-slate-950"
            href="#how-it-works"
          >
            How it works
          </a>
          <a
            className="transition-colors hover:text-slate-950"
            href="#features"
          >
            Why DeliverFlow
          </a>
          <Link
            className="transition-colors hover:text-slate-950"
            href={routes.auth.login}
          >
            Demo
          </Link>
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Button asChild variant="ghost">
            <Link href={routes.auth.login}>Log in</Link>
          </Button>
          <Button asChild>
            <Link href={routes.auth.signup}>Create workspace</Link>
          </Button>
        </div>
        <details className="group relative sm:hidden">
          <summary
            className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm [&::-webkit-details-marker]:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-4 group-open:hidden" />
            <X className="hidden size-4 group-open:block" />
          </summary>
          <div className="absolute right-0 top-12 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <a
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              href="#how-it-works"
            >
              How it works
            </a>
            <a
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              href="#features"
            >
              Why DeliverFlow
            </a>
            <Link
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              href={routes.auth.login}
            >
              Explore demo
            </Link>
            <Link
              className="mt-1 block rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              href={routes.auth.signup}
            >
              Create workspace
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
function SectionIntro({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}
function InlineCheck({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckCircle2 className="size-4 text-blue-700" />
      {label}
    </span>
  );
}
function ProductPreview() {
  return (
    <div
      className="landing-reveal landing-delay-2 relative mx-auto w-full max-w-2xl lg:max-w-none"
      aria-label="DeliverFlow client workspace preview"
    >
      <div className="absolute -left-10 top-12 size-40 rounded-full bg-blue-200/45 blur-3xl" />
      <div className="absolute -bottom-12 right-4 size-44 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_32px_80px_-36px_rgba(15,23,42,0.42)] sm:p-4">
        <div className="flex items-center justify-between border-b border-slate-100 px-1 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-slate-950 text-[10px] font-bold text-white">
              DF
            </div>
            <div>
              <p className="text-sm font-semibold">Website Redesign</p>
              <p className="text-xs text-slate-500">Client workspace</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <span className="size-1.5 rounded-full bg-amber-500" />
            In review
          </span>
        </div>
        <div className="grid gap-3 py-4 sm:grid-cols-[1.32fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Project progress</p>
              <span className="text-sm font-semibold">82%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="landing-progress h-full w-[82%] rounded-full bg-blue-600" />
            </div>
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
              <p className="text-[11px] font-semibold tracking-wide text-blue-700">
                CURRENT FOCUS
              </p>
              <p className="mt-1 text-sm font-semibold">
                Homepage design review
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                The revised direction is ready for client feedback.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <div className="landing-pulse size-2 rounded-full bg-emerald-500" />
              Updated a few moments ago
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold">Ready for you</p>
            <div className="mt-3 space-y-3">
              <MiniRow
                icon={FileText}
                title="Design preview"
                meta="Shared today"
              />
              <MiniRow
                icon={BadgeCheck}
                title="Approval request"
                meta="Waiting on client"
              />
              <MiniRow
                icon={MessageSquareText}
                title="Feedback thread"
                meta="2 new notes"
              />
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700">
              Review project
            </div>
          </div>
        </div>
        <div className="grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-3">
          <MiniMetric label="Files shared" value="12" />
          <MiniMetric label="Open feedback" value="2" />
          <MiniMetric label="Next milestone" value="Jul 18" />
        </div>
      </div>
    </div>
  );
}
function MiniRow({
  icon: Icon,
  title,
  meta,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid size-7 place-items-center rounded-md bg-slate-100 text-slate-600">
        <Icon className="size-3.5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-800">{title}</p>
        <p className="text-[11px] text-slate-500">{meta}</p>
      </div>
    </div>
  );
}
function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
function FeaturePanel({
  className,
  icon: Icon,
  eyebrow,
  title,
  description,
  visual,
}: {
  className: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  visual: ReactNode;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 sm:p-6 ${className}`}
    >
      <div className="grid size-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
        <Icon className="size-5" />
      </div>
      <p className="mt-6 text-xs font-semibold tracking-[0.1em] text-blue-700">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      <div className="mt-6">{visual}</div>
    </article>
  );
}
function PortalSnippet() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Project overview</p>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          On track
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <MiniMetric label="Progress" value="82%" />
        <MiniMetric label="Files" value="12" />
        <MiniMetric label="Approvals" value="1 pending" />
      </div>
    </div>
  );
}
function ApprovalSnippet() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-4 text-blue-700" />
        <p className="text-xs font-semibold">Homepage design approval</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Review the latest direction and share a clear response.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className="rounded-md bg-slate-950 px-2 py-2 text-center text-[11px] font-semibold text-white">
          Approve
        </span>
        <span className="rounded-md border border-slate-200 px-2 py-2 text-center text-[11px] font-semibold text-slate-700">
          Request changes
        </span>
      </div>
    </div>
  );
}
function PaymentSnippet() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">Open invoices</span>
        <span className="font-semibold text-slate-950">$3,450</span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between rounded-lg bg-amber-50 px-2.5 py-2 text-[11px]">
          <span className="font-medium text-amber-800">Milestone invoice</span>
          <span className="text-amber-700">Overdue</span>
        </div>
        <div className="flex justify-between rounded-lg bg-slate-50 px-2.5 py-2 text-[11px]">
          <span className="font-medium text-slate-700">Final payment</span>
          <span className="text-slate-500">Due Jul 18</span>
        </div>
      </div>
    </div>
  );
}
function OwnerSnippet() {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <MiniMetric label="Needs attention" value="4 projects" />
      <MiniMetric label="Open feedback" value="3 items" />
      <MiniMetric label="Awaiting approval" value="2 reviews" />
    </div>
  );
}
function ExperienceCard({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  items: readonly string[];
  tone: "slate" | "blue";
}) {
  const isBlue = tone === "blue";
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${isBlue ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-white"}`}
    >
      <div
        className={`grid size-10 place-items-center rounded-xl ${isBlue ? "bg-blue-600 text-white" : "bg-slate-950 text-white"}`}
      >
        <Icon className="size-5" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-5 text-slate-600"
          >
            <CheckCircle2
              className={`mt-0.5 size-4 shrink-0 ${isBlue ? "text-blue-700" : "text-slate-700"}`}
            />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
function OwnerWorkspacePreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_28px_60px_-35px_rgba(15,23,42,0.35)] sm:p-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <p className="text-sm font-semibold">Owner dashboard</p>
          <p className="text-xs text-slate-500">Delivery overview</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          Today
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Active projects" value="8" />
        <MiniMetric label="Open feedback" value="3" />
        <MiniMetric label="Payments due" value="2" />
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold">Needs attention</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-xs">
            <span className="font-medium text-red-800">Payment overdue</span>
            <span className="text-red-700">Review</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs">
            <span className="font-medium text-amber-800">
              Client approval waiting
            </span>
            <span className="text-amber-700">Open</span>
          </div>
        </div>
      </div>
    </div>
  );
}
