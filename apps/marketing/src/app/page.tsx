import { HeroSceneLoader } from "@/components/hero/HeroSceneLoader";
import { HeroContent } from "@/components/hero/HeroContent";
import { BentoGrid } from "@/components/sections/BentoGrid";
import { CodeShowcase } from "@/components/sections/CodeShowcase";
import { StatsCounter } from "@/components/sections/StatsCounter";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      {/* Hero — full viewport with 3D background */}
      <section className="relative min-h-screen overflow-hidden">
        <HeroSceneLoader />
        <HeroContent />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      <LogoMarquee />
      <BentoGrid />
      <CodeShowcase />
      <StatsCounter />
      <CTASection />
    </>
  );
}
