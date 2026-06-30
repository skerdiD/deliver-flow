import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-7 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-950 sm:text-[1.75rem]">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>

      {children ? (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:[&>*]:w-auto lg:justify-end [&>*]:w-full">
          {children}
        </div>
      ) : null}
    </div>
  );
}
