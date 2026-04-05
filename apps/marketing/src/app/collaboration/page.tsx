import type { Metadata } from 'next';
import { LiveDemoSection } from '@/components/sections/LiveDemoSection';
import { CTASection } from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'Live Collaboration',
  description:
    'Real-time presence built into the boilerplate. Avatar stacks, live cursors, and multiplayer — wired up and opt-in from day one.',
};

export default function CollaborationPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Real-time presence,{' '}
            <span className="gradient-text">out of the box</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Avatar stacks, live cursors, and room-based multiplayer — wired into{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-sm">packages/shared</code>{' '}
            and opt-in via env vars. No WebSocket boilerplate required.
          </p>
        </div>
      </section>

      <LiveDemoSection />
      <CTASection />
    </>
  );
}
