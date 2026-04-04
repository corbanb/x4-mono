import type { Metadata } from 'next';
import { CompanionPlugins } from '@/components/sections/CompanionPlugins';
import { HooksSection } from '@/components/sections/HooksSection';

export const metadata: Metadata = {
  title: 'Companion Plugins — x4',
  description:
    'x4 relies on a set of companion plugins. Required ones are installed automatically by /x4:onboard.',
};

export default function CompanionPluginsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            The plugins that <span className="gradient-text">power x4.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            x4 relies on a set of companion plugins. Required ones are installed automatically
            by{' '}
            <span className="font-mono text-violet-400">/x4:onboard</span>.
          </p>
        </div>
      </section>

      {/* Plugins */}
      <CompanionPlugins />

      {/* Hooks */}
      <HooksSection />
    </>
  );
}
