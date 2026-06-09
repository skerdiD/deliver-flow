import { AdminClientComparison } from "@/components/marketing/admin-client-comparison";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FinalCta } from "@/components/marketing/final-cta";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { ProductPreview } from "@/components/marketing/product-preview";
import { TrustBenefits } from "@/components/marketing/trust-benefits";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <MarketingNavbar />
      <HeroSection />
      <ProductPreview />
      <FeatureGrid />
      <HowItWorks />
      <AdminClientComparison />
      <TrustBenefits />
      <FinalCta />
    </main>
  );
}