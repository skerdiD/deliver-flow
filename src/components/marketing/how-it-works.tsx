const steps = [
  {
    number: "01",
    title: "Create a client and project",
    description:
      "Add the client, create the project, set the deadline, and assign the work to the right client account.",
  },
  {
    number: "02",
    title: "Share updates and files",
    description:
      "Post progress updates, attach files, track milestones, and keep payment status visible.",
  },
  {
    number: "03",
    title: "Client reviews and responds",
    description:
      "The client can view progress, send feedback, approve a milestone, or request changes.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-blue-600">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            A simple delivery flow from first update to final approval.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            The process stays clear for both sides. You manage the work, and the
            client always knows where to look.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white">
                {step.number}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}