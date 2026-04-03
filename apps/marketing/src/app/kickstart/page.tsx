import type { Metadata } from 'next';
import { KickstartFlow } from '@/components/sections/KickstartFlow';

export const metadata: Metadata = {
  title: 'Kickstart — x4',
  description:
    'From blank page to full plan in one session. Six guided steps to turn your idea into a complete feature backlog with PRDs.',
};

export default function KickstartPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1.5 font-mono text-sm text-violet-400">
              /x4:kickstart
            </span>
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl">
            From blank page to full plan in one session.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Six guided steps. Your idea becomes a complete feature backlog with PRDs ready to build.
          </p>
        </div>
      </section>

      <KickstartFlow />
    </>
  );
}
