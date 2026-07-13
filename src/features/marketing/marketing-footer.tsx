import { ArrowUpRight, Code2 } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { routes } from "@/config/routes";
import {
  DemoAction,
  MarketingContainer,
} from "@/features/marketing/marketing-shared";
import { MarketingReveal } from "@/features/marketing/marketing-reveal";

const productLinks = [
  ["#how-it-works", "How it works"],
  ["#product", "Product"],
  ["#experiences", "Owner workspace"],
  ["#experiences", "Client portal"],
] as const;

export function MarketingFooter() {
  return (
    <footer className="bg-slate-50 pt-0 sm:pt-10">
      <MarketingContainer>
        <MarketingReveal className="border-t border-slate-200">
        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr] lg:gap-12 lg:py-12">
          <div className="max-w-sm">
            <Link
              href={routes.home}
              aria-label="DeliverFlow home"
              className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <BrandLogo subtitle="Client delivery, made clear" />
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              A shared delivery workspace for freelancers and small agencies to
              keep projects organized and clients confidently informed.
            </p>
          </div>

          <FooterGroup title="Product">
            {productLinks.map(([href, label]) => (
              <a key={label} href={href} className="marketing-footer-link">
                {label}
              </a>
            ))}
          </FooterGroup>

          <FooterGroup title="Access">
            <Link href={routes.auth.login} className="marketing-footer-link">
              Log in
            </Link>
            <DemoAction
              role="owner"
              variant="ghost"
              size="default"
              className="h-auto justify-start p-0 text-sm font-medium text-slate-600 shadow-none hover:bg-transparent hover:text-blue-700 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Explore owner demo
            </DemoAction>
            <DemoAction
              role="client"
              variant="ghost"
              size="default"
              className="h-auto justify-start p-0 text-sm font-medium text-slate-600 shadow-none hover:bg-transparent hover:text-blue-700 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              View client demo
            </DemoAction>
          </FooterGroup>

          <FooterGroup title="Project">
            <a
              href="https://github.com/skerdiD/deliver-flow"
              target="_blank"
              rel="noreferrer"
              className="marketing-footer-link group"
            >
              <Code2 className="size-3.5" />
              Repository
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://github.com/skerdiD"
              target="_blank"
              rel="noreferrer"
              className="marketing-footer-link group"
            >
              Developer GitHub
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </FooterGroup>
        </div>
        </MarketingReveal>

        <div className="flex flex-col gap-3 border-t border-slate-200 py-6 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DeliverFlow.</p>
          <p className="max-w-2xl sm:text-right">
            DeliverFlow is an independent product project built to demonstrate
            full-stack client-delivery workflows.
          </p>
        </div>
      </MarketingContainer>
    </footer>
  );
}

function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={`${title} links`}>
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-950">
        {title}
      </h2>
      <div className="mt-4 flex flex-col items-start gap-3">{children}</div>
    </nav>
  );
}
