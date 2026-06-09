import { CheckCircle2 } from "lucide-react";

const adminItems = [
  "Create and manage clients",
  "Create projects and assign them to clients",
  "Add milestones, tasks, updates, and files",
  "Track feedback, approvals, and payments",
  "Control what clients can see",
];

const clientItems = [
  "View assigned project progress",
  "Check milestones, tasks, and updates",
  "Download files and documents",
  "Send feedback tied to the project",
  "Approve milestones or request changes",
];

export function AdminClientComparison() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-blue-600">Admin vs Client</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Two views, one shared source of truth.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Freelancers need control. Clients need clarity. DeliverFlow keeps
            both sides focused on the same project information.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <ComparisonCard
            label="Admin dashboard"
            title="For the freelancer"
            description="Manage delivery work, update clients, and keep every project organized."
            items={adminItems}
          />

          <ComparisonCard
            label="Client portal"
            title="For the client"
            description="Follow progress, review updates, send feedback, and approve work from one private portal."
            items={clientItems}
          />
        </div>
      </div>
    </section>
  );
}

type ComparisonCardProps = {
  label: string;
  title: string;
  description: string;
  items: string[];
};

function ComparisonCard({
  label,
  title,
  description,
  items,
}: ComparisonCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
        {label}
      </span>

      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <p className="text-sm leading-6 text-slate-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}