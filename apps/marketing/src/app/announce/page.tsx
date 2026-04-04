import type { Metadata } from 'next';
import { AnnounceCommands } from '@/components/sections/AnnounceCommands';

export const metadata: Metadata = {
  title: 'Email & Announcements — x4',
  description:
    'Five commands. One changelog. Every channel covered — email, LinkedIn, X, and your marketing site.',
};

export default function AnnouncePage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Tell the world{' '}
            <span className="gradient-text">what shipped.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Five commands. One changelog. Every channel covered.
          </p>
        </div>
      </section>

      {/* Commands */}
      <section className="pb-24">
        <AnnounceCommands />
      </section>
    </>
  );
}
