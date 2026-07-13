"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealVariant = "fade-up" | "fade-left" | "fade-right" | "scale-fade";

type MarketingRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
};

/**
 * Keeps the landing page server rendered while progressively enhancing its
 * section entrances after hydration. Content remains visible if JavaScript is
 * unavailable or reduced motion is requested.
 */
export function MarketingReveal({
  children,
  className,
  delay = 0,
  variant = "fade-up",
}: MarketingRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    element.style.setProperty("--marketing-reveal-delay", `${delay}ms`);
    element.classList.add("marketing-scroll-reveal", `reveal-${variant}`);

    const reveal = () => element.classList.add("is-revealed");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12%", threshold: 0.08 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, variant]);

  return (
    <div ref={elementRef} className={cn(className)}>
      {children}
    </div>
  );
}
