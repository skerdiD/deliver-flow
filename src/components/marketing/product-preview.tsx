import {
  CheckCircle2,
  CreditCard,
  FolderKanban,
  MessageSquare,
  Users,
} from "lucide-react";

const adminItems = [
  {
    label: "Active projects",
    value: "3",
    icon: FolderKanban,
  },
  {
    label: "Clients",
    value: "3",
    icon: Users,
  },
  {
    label: "Pending feedback",
    value: "2",
    icon: MessageSquare,
  },
  {
    label: "Outstanding",
    value: "$900",
    icon: CreditCard,
  },
];

const clientItems = [
  {
    title: "Current milestone",
    description: "Backend API integration",
  },
  {
    title: "Latest update",
    description: "Dashboard screens are ready. API work is in progress.",
  },
  {
    title: "Files",
    description: "proposal.pdf, project-brief.docx, invoice.pdf",
  },
];

export function ProductPreview() {
  return (
    <section id="demo" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-blue-600">Product preview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            One workspace for you. One clear portal for your client.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            The admin dashboard helps you manage delivery. The client portal
            helps your client understand progress without asking for updates
            every few days.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Admin Dashboard
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Manage clients, projects, approvals, and payments.
                </p>
              </div>

              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Freelancer view
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {adminItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          {item.value}
                        </p>
                      </div>

                      <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon className="size-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-4 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                <span className="col-span-2">Project</span>
                <span>Status</span>
                <span className="text-right">Progress</span>
              </div>

              {[
                ["SaaS Dashboard MVP", "In progress", "68%"],
                ["Client Portal Build", "Active", "45%"],
                ["Agency Website Redesign", "Review", "90%"],
              ].map(([project, status, progress]) => (
                <div
                  key={project}
                  className="grid grid-cols-4 gap-3 px-4 py-3 text-sm"
                >
                  <span className="col-span-2 font-medium text-slate-950">
                    {project}
                  </span>
                  <span className="text-slate-600">{status}</span>
                  <span className="text-right font-medium text-slate-950">
                    {progress}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Client Portal
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Clear project status for non-technical clients.
                </p>
              </div>

              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Client view
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    SaaS Dashboard MVP
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Nova Agency</p>
                </div>

                <CheckCircle2 className="size-5 text-blue-600" />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-950">68%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[68%] rounded-full bg-blue-600" />
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {clientItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white">
                Approve milestone
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950">
                Send feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
