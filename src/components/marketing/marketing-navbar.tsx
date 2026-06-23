import Link from "next/link";

import { Button } from "@/components/ui/button";

const navLinks = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#how-it-works",
  },
  {
    label: "Demo",
    href: "#demo",
  },
];

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            D
          </div>

          <div>
            <p className="text-sm font-semibold leading-none text-slate-950">
              DeliverFlow
            </p>
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              Client portal for freelancers
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>

          <Button asChild>
            <Link href="/login">Open workspace</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
