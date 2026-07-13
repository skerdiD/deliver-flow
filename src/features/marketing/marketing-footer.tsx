import { ArrowUpRight, Code2 } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { routes } from "@/config/routes";
import { MarketingReveal } from "@/features/marketing/marketing-reveal";
import {
  DemoAction,
  MarketingContainer,
} from "@/features/marketing/marketing-shared";

const productLinks = [
  ["#how-it-works", "How it works"],
  ["#product", "Product features"],
  ["#experiences", "Owner workspace"],
  ["#experiences", "Client portal"],
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100/75">
      <MarketingContainer>
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.8fr_0.8fr_0.95fr] lg:gap-12 lg:py-14">
          <MarketingReveal className="max-w-sm">
            <Link
              href={routes.home}
              aria-label="DeliverFlow home"
              className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <BrandLogo subtitle="Client delivery, made clear" />
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              A shared delivery workspace for freelancers, agencies, and their
              clients.
            </p>
          </MarketingReveal>

          <MarketingReveal delay={60}>
            <FooterGroup title="Product">
              {productLinks.map(([href, label]) => (
                <a key={label} href={href} className="marketing-footer-link">
                  {label}
                </a>
              ))}
            </FooterGroup>
          </MarketingReveal>

          <MarketingReveal delay={120}>
            <FooterGroup title="Access">
              <Link href={routes.auth.login} className="marketing-footer-link">
                Log in
              </Link>
              <Link href={routes.auth.signup} className="marketing-footer-link">
                Create workspace
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
          </MarketingReveal>

          <MarketingReveal delay={180}>
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
          </MarketingReveal>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 py-6 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} DeliverFlow.</p>
          <p className="max-w-2xl sm:text-right">
            DeliverFlow is an independent product project centered on real
            client-delivery workflows.
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
