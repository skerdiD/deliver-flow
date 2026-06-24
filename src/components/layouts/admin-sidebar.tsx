"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-sm">
            D
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">DeliverFlow</p>
            <p className="text-xs text-slate-500">Admin workspace</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1 px-3 py-5">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-700",
                )}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-950">Delivery clarity</p>
        <p className="mt-2 text-sm leading-5 text-slate-600">
          Share progress without messy back-and-forth messages.
        </p>
      </div>
    </aside>
  );
}
