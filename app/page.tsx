import { SiteHeader } from "@/components/site-layout";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";

export default function HomePage() {
  return (
    <div className="flex h-[100dvh] min-h-[100svh] flex-col overflow-hidden bg-[#031129]">
      <SiteHeader />
      <main className="flex-1 overflow-hidden">
        <HeroSection />
        {/* <StatsSection /> */}
        {/* <ServicesPreview />
        <FeaturedProducts />
        <CTASection /> */}
      </main>
    </div>
  );
}
