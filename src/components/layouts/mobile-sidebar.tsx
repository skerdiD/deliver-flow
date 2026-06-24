"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

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
};

export function MobileSidebar({ type }: MobileSidebarProps) {
  const pathname = usePathname();
  const navigation = type === "admin" ? adminNavigation : clientNavigation;

  return (
    <div className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 border-slate-200">
            <Menu className="size-4" />
            Menu
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[min(20rem,calc(100vw-1rem))]">
          <SheetHeader>
            <SheetTitle>
              <BrandLogo subtitle={type === "admin" ? "Admin workspace" : "Client portal"} />
            </SheetTitle>
          </SheetHeader>

          <nav className="mt-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
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
    </div>
  );
}
