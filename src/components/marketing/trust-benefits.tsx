import { Clock3, FolderClosed, MessagesSquare, ReceiptText } from "lucide-react";

const benefits = [
  {
    title: "Fewer status check messages",
    description:
      "Clients can check the portal instead of asking where the project stands.",
    icon: MessagesSquare,
  },
  {
    title: "Cleaner delivery records",
    description:
      "Updates, files, approvals, and feedback stay connected to the right project.",
    icon: FolderClosed,
  },
  {
    title: "Clearer payment conversations",
    description:
      "Clients can see what is paid, what remains, and what each payment is connected to.",
    icon: ReceiptText,
  },
  {
    title: "Better handoff experience",
    description:
      "The project history stays readable from first update to final approval.",
    icon: Clock3,
  },
];

export function TrustBenefits() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-medium text-blue-600">Why it helps</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Clients trust the process more when they can see it.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                DeliverFlow is not trying to replace your communication. It
                gives your communication a clear home, so clients know what has
                changed, what needs review, and what comes next.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="size-5" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-950">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}