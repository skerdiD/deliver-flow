"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { routes } from "@/config/routes";
import {
  DemoAction,
  MarketingContainer,
} from "@/features/marketing/marketing-shared";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#product", label: "Product" },
  { href: "#experiences", label: "Owner & client" },
  { href: "#demo", label: "Demo" },
] as const;

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 10);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-200",
        isScrolled
          ? "border-slate-200/90 bg-[#f8fafc]/90 shadow-[0_10px_30px_-26px_rgba(15,23,42,0.48)] supports-[backdrop-filter]:bg-[#f8fafc]/78"
          : "border-transparent bg-[#f8fafc]/65",
      )}
    >
      <MarketingContainer className="flex h-[4.5rem] items-center gap-5 sm:h-[4.75rem]">
        <Link
          href={routes.home}
          aria-label="DeliverFlow home"
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <BrandLogo size="marketing" subtitle="Client delivery, made clear" />
        </Link>

        <nav
          className="ml-auto hidden items-center gap-6 lg:flex"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md text-base font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 sm:flex lg:ml-3">
          <Link
            href={routes.auth.login}
            className="inline-flex h-11 items-center rounded-md px-3.5 text-[0.95rem] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Log in
          </Link>
          <DemoAction
            role="owner"
            size="default"
            className="marketing-cta group h-11 bg-blue-600 px-4.5 text-[0.95rem] hover:bg-blue-700 focus-visible:ring-blue-600"
          >
            Explore demo
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </DemoAction>
        </div>

        <div className="relative ml-auto sm:hidden">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="marketing-mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? (
              <X className="size-4.5" />
            ) : (
              <Menu className="size-4.5" />
            )}
          </button>
          <div
            id="marketing-mobile-navigation"
            className={cn(
              "absolute right-0 top-12 w-[min(19rem,calc(100vw-2.5rem))] origin-top-right rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl shadow-slate-950/15 transition duration-200",
              isMenuOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-[0.98] opacity-0",
            )}
          >
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href={routes.auth.login}
                onClick={closeMenu}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Log in
              </Link>
              <DemoAction
                role="owner"
                size="default"
                className="marketing-cta mt-1 w-full rounded-xl bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600"
              >
                Explore owner demo
                <ArrowUpRight className="size-4" />
              </DemoAction>
            </nav>
          </div>
        </div>
      </MarketingContainer>
    </header>
  );
}
