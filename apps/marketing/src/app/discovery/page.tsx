import type { Metadata } from 'next';
import { DiscoveryExplainer } from '@/components/sections/DiscoveryExplainer';

export const metadata: Metadata = {
  title: 'Discovery — x4',
  description:
    'x4 scans your codebase to find what is missing and suggests what to build next. The development loop that never ends.',
};

export default function DiscoveryPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 flex justify-center gap-3">
            <span className="inline-flex items-center rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1.5 font-mono text-sm text-violet-400">
              /x4:gaps
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 font-mono text-sm text-emerald-400">
              /x4:dream
            </span>
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl">
            Your product tells you <span className="gradient-text">what it needs next.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            x4 scans what you&apos;ve built and finds what&apos;s missing before your users do.
          </p>
        </div>
      </section>

      <DiscoveryExplainer />
    </>
  );
}
