import type { Metadata } from 'next';
import { PluginInstall } from '@/components/sections/PluginInstall';

export const metadata: Metadata = {
  title: 'Getting Started — x4',
  description:
    'From zero to running app in minutes. Install x4, scaffold your project, and start building — all from Claude Code.',
};

export default function GettingStartedPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            From zero to running app{' '}
            <span className="gradient-text">in minutes.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Install x4, scaffold your project, and start building — all from Claude Code.
          </p>
        </div>
      </section>

      {/* Install */}
      <section className="pb-24">
        <PluginInstall />
      </section>
    </>
  );
}
