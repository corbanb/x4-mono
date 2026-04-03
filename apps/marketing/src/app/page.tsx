import HeroDescribeApp from '@/components/hero/HeroDescribeApp';
import AutoLoopTerminal from '@/components/sections/AutoLoopTerminal';
import TechStackBento from '@/components/sections/TechStackBento';
import DiscoverySection from '@/components/sections/DiscoverySection';
import AgentPluginShowcase from '@/components/sections/AgentPluginShowcase';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <main>
      <HeroDescribeApp />
      <AutoLoopTerminal />
      <TechStackBento />
      <DiscoverySection />
      <AgentPluginShowcase />
      <CTASection />
    </main>
  );
}
