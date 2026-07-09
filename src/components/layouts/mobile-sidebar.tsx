"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminNavigation, clientNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

type MobileSidebarProps = {
  type: "admin" | "client";
  className?: string;
};

function withProjectId(href: string, projectId: string | null) {
  if (!projectId || !href.startsWith("/client/")) {
    return href;
  }

  const params = new URLSearchParams({ projectId });

  return `${href}?${params.toString()}`;
}

export function MobileSidebar({ type, className }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigation = type === "admin" ? adminNavigation : clientNavigation;
  const subtitle = type === "admin" ? "Owner workspace" : "Client portal";
  const projectId = type === "client" ? searchParams.get("projectId") : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open navigation menu"
          className={cn(
            "dashboard-mobile-nav size-10 shrink-0 border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 hover:text-slate-950",
            className,
          )}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[min(85vw,20rem)] gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-950"
      >
        <SheetHeader className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 pr-12">
          <BrandLogo subtitle={subtitle} />
          <SheetTitle className="sr-only">DeliverFlow navigation</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto bg-white px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const href = withProjectId(item.href, projectId);

            return (
              <Link
                key={item.href}
                href={href}
                prefetch={type === "client" ? true : undefined}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
