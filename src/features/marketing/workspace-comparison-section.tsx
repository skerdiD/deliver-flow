import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  FolderKanban,
  MessageSquareText,
} from "lucide-react";

import {
  MarketingContainer,
  PreviewMetric,
  ProductWindow,
  SectionHeading,
  StatusDot,
} from "@/features/marketing/marketing-shared";
import { MarketingExperienceTabs } from "@/features/marketing/marketing-experience-tabs";
import { MarketingReveal } from "@/features/marketing/marketing-reveal";

const ownerBenefits = [
  "Manage clients, projects, milestones, and files",
  "See feedback, approvals, and payments needing attention",
  "Review delivery analytics across the workspace",
] as const;

const clientBenefits = [
  "Follow progress and the current delivery milestone",
  "Download files and respond with contextual feedback",
  "Approve work, request changes, and review payments",
] as const;

export function WorkspaceComparisonSection() {
  return (
    <section
      id="experiences"
      className="marketing-surface-dark relative isolate scroll-mt-20 overflow-hidden border-y border-white/10 py-20 sm:py-24 lg:py-28"
    >
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_72%_5%,rgba(37,99,235,0.2),transparent_46%)]"
        aria-hidden="true"
      />
      <MarketingContainer className="relative">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <MarketingReveal>
            <SectionHeading
              eyebrow="Two connected experiences"
              title="The same delivery. The right view for each person."
              description="Owners get operational control. Clients get a calm, focused portal. Both stay aligned around one source of truth."
              tone="dark"
            />
          </MarketingReveal>
          <p className="max-w-xl text-sm leading-6 text-slate-400 lg:ml-auto lg:text-right">
            Switch between the views to see how DeliverFlow adapts the same
            project context to each role.
          </p>
        </div>

        <MarketingReveal className="mt-10" variant="scale-fade">
          <MarketingExperienceTabs
            ownerPanel={
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <ExperienceCopy
                  eyebrow="Owner workspace"
                  title="Run delivery from one focused operating view."
                  description="Spot what needs a decision, follow-up, or payment conversation without opening every project."
                  benefits={ownerBenefits}
                  tone="dark"
                />
                <OwnerPreview />
              </div>
            }
            clientPanel={
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <ExperienceCopy
                  eyebrow="Client portal"
                  title="Give clients clarity without exposing internal noise."
                  description="The portal keeps progress, files, approvals, feedback, and payments easy to understand and act on."
                  benefits={clientBenefits}
                  tone="light"
                />
                <ClientPreview />
              </div>
            }
          />
        </MarketingReveal>
      </MarketingContainer>
    </section>
  );
}

function ExperienceCopy({
  eyebrow,
  title,
  description,
  benefits,
  tone,
}: {
  eyebrow: string;
  title: string;
  description: string;
  benefits: readonly string[];
  tone: "dark" | "light";
}) {
  return (
    <div>
      <p
        className={`text-[0.68rem] font-bold uppercase tracking-[0.15em] ${tone === "dark" ? "text-blue-300" : "text-blue-700"}`}
      >
        {eyebrow}
      </p>
      <h3
        className={`mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl ${tone === "dark" ? "text-white" : "text-slate-950"}`}
      >
        {title}
      </h3>
      <p
        className={`mt-4 text-sm leading-6 ${tone === "dark" ? "text-slate-300" : "text-slate-600"}`}
      >
        {description}
      </p>
      <ul className="mt-6 space-y-3">
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className={`flex gap-2.5 text-sm leading-5 ${tone === "dark" ? "text-slate-200" : "text-slate-700"}`}
          >
            <CheckCircle2
              className={`mt-0.5 size-4 shrink-0 ${tone === "dark" ? "text-blue-300" : "text-blue-700"}`}
              aria-hidden="true"
            />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OwnerPreview() {
  return (
    <ProductWindow
      label="OWNER WORKSPACE"
      title="Delivery overview"
      className="border-white/10 shadow-2xl shadow-black/25"
    >
      <div className="bg-slate-50 p-4 text-slate-950 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          <PreviewMetric
            icon={FolderKanban}
            label="Active projects"
            value="8 projects"
            tone="blue"
          />
          <PreviewMetric
            icon={MessageSquareText}
            label="Open feedback"
            value="3 items"
          />
          <PreviewMetric
            icon={CircleDollarSign}
            label="Payments due"
            value="$4,800"
            tone="amber"
          />
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Needs attention</p>
            <span className="text-[0.68rem] font-semibold text-blue-700">
              4 items
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <OwnerAttention
              icon={BadgeCheck}
              title="Approval waiting"
              meta="Website redesign"
              tone="amber"
            />
            <OwnerAttention
              icon={MessageSquareText}
              title="Changes requested"
              meta="Product launch"
              tone="blue"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <BarChart3 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-3 text-[0.68rem] font-semibold">
              <span>Portfolio delivery health</span>
              <span>78%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[78%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </ProductWindow>
  );
}

function ClientPreview() {
  return (
    <ProductWindow
      label="CLIENT PORTAL"
      title="Website redesign"
      className="shadow-2xl shadow-blue-950/10"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Website redesign</p>
            <p className="mt-1 text-xs text-slate-500">
              Northstar Studio · Client project
            </p>
          </div>
          <StatusDot tone="green" label="On track" />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Project progress</span>
            <span>82%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[82%] rounded-full bg-blue-600" />
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ClientAction
            icon={BadgeCheck}
            title="Review approval"
            meta="Homepage design is waiting"
            accent
          />
          <ClientAction
            icon={FileText}
            title="Open shared files"
            meta="12 files available"
          />
          <ClientAction
            icon={MessageSquareText}
            title="Send feedback"
            meta="2 notes still open"
          />
          <ClientAction
            icon={CircleDollarSign}
            title="Review payments"
            meta="$2,400 due Jul 18"
          />
        </div>
      </div>
    </ProductWindow>
  );
}

function OwnerAttention({
  icon: Icon,
  title,
  meta,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  tone: "amber" | "blue";
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-lg ${tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[0.68rem] font-semibold">{title}</p>
        <p className="truncate text-[0.65rem] text-slate-500">{meta}</p>
      </div>
    </div>
  );
}

function ClientAction({
  icon: Icon,
  title,
  meta,
  accent = false,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border p-3 ${accent ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${accent ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">{title}</p>
        <p className="truncate text-[0.68rem] text-slate-500">{meta}</p>
      </div>
    </div>
  );
}
