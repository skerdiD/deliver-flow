import { BrandLogo } from "@/components/shared/brand-logo";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 sm:px-6">
      <section className="w-full max-w-md">
        <BrandLogo
          className="mb-8 justify-center"
          iconClassName="size-10 bg-slate-950"
          subtitle="Private client workspace"
        />

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
