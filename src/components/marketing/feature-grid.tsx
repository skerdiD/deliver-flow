import {
  CheckCircle2,
  CreditCard,
  FileText,
  Flag,
  FolderKanban,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    title: "Project progress tracking",
    description:
      "Show clients the current status, progress percentage, and what is being worked on now.",
    icon: FolderKanban,
  },
  {
    title: "Milestones and tasks",
    description:
      "Break delivery into clear steps so clients understand what is done and what comes next.",
    icon: Flag,
  },
  {
    title: "Client feedback",
    description:
      "Collect project feedback in one place instead of losing important notes in messages.",
    icon: MessageSquare,
  },
  {
    title: "Approval requests",
    description:
      "Ask clients to approve a milestone or request changes with a clear decision path.",
    icon: CheckCircle2,
  },
  {
    title: "Files and documents",
    description:
      "Keep proposals, briefs, invoices, designs, and handoff files attached to the project.",
    icon: FileText,
  },
  {
    title: "Payment status",
    description:
      "Give clients a simple view of total amount, paid amount, remaining amount, and payment history.",
    icon: CreditCard,
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-blue-600">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Everything needed to keep project delivery clear.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            DeliverFlow focuses on the parts of freelance work that usually
            create confusion: status updates, files, feedback, approvals, and
            payments.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="size-6" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}