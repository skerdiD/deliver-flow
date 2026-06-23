type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 sm:px-6">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
            D
          </div>

          <div>
            <p className="text-sm font-semibold leading-none text-slate-950">
              DeliverFlow
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Private client workspace
            </p>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-slate-950">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        {children}
      </section>
    </main>
  );
}
