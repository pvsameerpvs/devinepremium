import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { DifferenceSection } from "@/components/DifferenceSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-hidden">
      <SiteHeader />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <DifferenceSection />
      <Footer />
    </div>
  );
}
