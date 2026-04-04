import { HeroDescribeApp } from '@/components/hero/HeroDescribeApp';
import DayInLifeSection from '@/components/sections/DayInLifeSection';
import { AutoLoopTerminal } from '@/components/sections/AutoLoopTerminal';
import TechStackBento from '@/components/sections/TechStackBento';
import DiscoverySection from '@/components/sections/DiscoverySection';
import AgentPluginShowcase from '@/components/sections/AgentPluginShowcase';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroDescribeApp />
      <DayInLifeSection />
      <AutoLoopTerminal />
      <TechStackBento />
      <DiscoverySection />
      <AgentPluginShowcase />
      <CTASection />
    </>
  );
}
