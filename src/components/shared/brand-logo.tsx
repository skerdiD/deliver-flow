import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  subtitle?: string;
};

export function BrandLogo({
  className,
  iconClassName,
  showText = true,
  subtitle,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200",
          iconClassName,
        )}
      >
        <Image
          src="/deliverflow-logo.svg"
          alt=""
          width={28}
          height={28}
          priority
          className="size-8"
        />
      </div>

      {showText ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-5 text-slate-950">
            DeliverFlow
          </p>
          {subtitle ? (
            <p className="truncate text-xs leading-4 text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
