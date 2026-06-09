"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
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
    <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Menu className="size-4" />
            Menu
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[min(20rem,calc(100vw-1rem))]">
          <SheetHeader>
            <SheetTitle>DeliverFlow</SheetTitle>
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
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                  )}
                >
                  <Icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
