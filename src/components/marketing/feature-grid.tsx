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
    title: "Projects",
    description:
      "Create client-ready workspaces with status, progress, deadlines, and context.",
    icon: FolderKanban,
  },
  {
    title: "Tasks",
    description:
      "Track the work that is done, in progress, blocked, or waiting next.",
    icon: CheckCircle2,
  },
  {
    title: "Milestones",
    description:
      "Break delivery into clear phases clients can understand and approve.",
    icon: Flag,
  },
  {
    title: "Files",
    description:
      "Keep briefs, invoices, designs, and handoff assets attached to the project.",
    icon: FileText,
  },
  {
    title: "Feedback",
    description:
      "Collect client notes in one place, tied to the right project history.",
    icon: MessageSquare,
  },
  {
    title: "Payments",
    description:
      "Show what is paid, what is due, and what each payment belongs to.",
    icon: CreditCard,
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up max-w-3xl">
          <p className="text-sm font-medium text-blue-600">Features</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Everything needed to keep project delivery clear.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            DeliverFlow focuses on the handoff details that usually spread
            across messages, folders, invoices, and review threads.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="animate-fade-in-up hover-lift rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="grid size-11 place-items-center rounded-lg bg-blue-50 text-blue-600">
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
