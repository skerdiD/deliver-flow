import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ActionCardProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  href?: string;
  actionLabel?: string;
};

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  actionLabel = "Open",
}: ActionCardProps) {
  const content = (
    <Card className="group transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {Icon ? (
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
              <Icon className="size-5" />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {description}
            </p>

            {href ? (
              <Button variant="outline" className="mt-4">
                {actionLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
