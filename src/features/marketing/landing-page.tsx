import { FinalCtaSection } from "@/features/marketing/final-cta-section";
import { HeroSection } from "@/features/marketing/hero-section";
import { HowItWorksSection } from "@/features/marketing/how-it-works-section";
import { MarketingFooter } from "@/features/marketing/marketing-footer";
import { MarketingHeader } from "@/features/marketing/marketing-header";
import { ProductCapabilityStrip } from "@/features/marketing/product-capability-strip";
import { ProductExperienceSection } from "@/features/marketing/product-experience-section";
import { WorkspaceComparisonSection } from "@/features/marketing/workspace-comparison-section";

export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#f8fafc] text-slate-950">
      <MarketingHeader />
      <main>
        <HeroSection />
        <ProductCapabilityStrip />
        <HowItWorksSection />
        <ProductExperienceSection />
        <WorkspaceComparisonSection />
        <FinalCtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
