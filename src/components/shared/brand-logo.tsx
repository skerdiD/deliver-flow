import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  size?: "default" | "marketing";
  showText?: boolean;
  subtitle?: string;
};

export function BrandLogo({
  className,
  iconClassName,
  size = "default",
  showText = true,
  subtitle,
}: BrandLogoProps) {
  const isMarketing = size === "marketing";

  return (
    <div
      className={cn(
        "flex items-center",
        isMarketing ? "gap-3.5" : "gap-3",
        className,
      )}
    >
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200",
          isMarketing ? "size-10" : "size-9",
          iconClassName,
        )}
      >
        <Image
          src="/deliverflow-logo.svg"
          alt=""
          width={28}
          height={28}
          priority
          className={cn(isMarketing ? "size-9" : "size-8")}
        />
      </div>

      {showText ? (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-semibold text-slate-950",
              isMarketing ? "text-base leading-5" : "text-sm leading-5",
            )}
          >
            DeliverFlow
          </p>
          {subtitle ? (
            <p
              className={cn(
                "truncate leading-4 text-slate-500",
                isMarketing ? "text-[0.8rem]" : "text-xs",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
