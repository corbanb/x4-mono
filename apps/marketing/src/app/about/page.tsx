import type { Metadata } from 'next';
import { Timeline } from '@/components/sections/Timeline';
import { PhilosophyCards } from '@/components/sections/PhilosophyCards';
import { CTASection } from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about x4 — the multi-platform TypeScript monorepo boilerplate.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Built for developers who <span className="gradient-text">ship</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            x4 was born from the frustration of setting up the same infrastructure over and over. We
            built the boilerplate we wished existed.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
            <p>
              Every new project starts the same way: choose a framework, wire up auth, connect a
              database, add validation, configure CI/CD, write tests. By the time infrastructure is
              ready, you&apos;ve lost weeks and the excitement has faded.
            </p>
            <p>
              x4 eliminates that cold start. It&apos;s a production-ready monorepo with web
              (Next.js), mobile (Expo), and desktop (Electron) clients sharing a single backend
              (Hono + tRPC) — all type-safe, all tested, all deployed.
            </p>
            <p className="text-foreground">
              The goal is simple: go from idea to deployed product in minutes, not weeks. Everything
              else is just infrastructure.
            </p>
          </div>
        </div>
      </section>

      <PhilosophyCards />
      <Timeline />
      <CTASection />
    </>
  );
}
