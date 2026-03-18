import { HeroSceneLoader } from '@/components/hero/HeroSceneLoader';
import { HeroContent } from '@/components/hero/HeroContent';
import { TechStackBento } from '@/components/sections/TechStackBento';
import { BentoGrid } from '@/components/sections/BentoGrid';
import { AgentPluginShowcase } from '@/components/sections/AgentPluginShowcase';
import { CodeShowcase } from '@/components/sections/CodeShowcase';
import { CTASection } from '@/components/sections/CTASection';

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

      <TechStackBento />
      <BentoGrid />
      <AgentPluginShowcase />
      <CodeShowcase />
      <CTASection />
    </>
  );
}
