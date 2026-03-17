import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        {/* <ServicesPreview />
        <FeaturedProducts />
        <CTASection /> */}
      </main>
      <SiteFooter />
    </div>
  );
}
