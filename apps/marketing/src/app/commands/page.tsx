import type { Metadata } from 'next';
import { CommandsTable } from '@/components/sections/CommandsTable';

export const metadata: Metadata = {
  title: 'Commands — x4',
  description:
    '25 commands for the complete AI development workflow. Scaffold, plan, build, discover, and ship — all from your terminal.',
};

export default function CommandsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Command Reference</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            <span className="gradient-text font-semibold">25 commands</span> · all under{' '}
            <span className="font-mono text-violet-400">/x4:</span>
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="pb-24">
        <CommandsTable />
      </section>
    </>
  );
}
