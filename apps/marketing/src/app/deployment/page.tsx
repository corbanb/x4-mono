import type { Metadata } from 'next';
import { DeploymentFlow } from '@/components/sections/DeploymentFlow';

export const metadata: Metadata = {
  title: 'Deployment — x4',
  description:
    'One command sets up your entire Railway project — services, domains, and PR previews.',
};

export default function DeploymentPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Deploy to Railway.{' '}
            <span className="gradient-text">Zero config.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            One command sets up your entire Railway project — services, domains, and PR previews.
          </p>
        </div>
      </section>

      {/* Flow */}
      <section className="pb-24">
        <DeploymentFlow />
      </section>
    </>
  );
}
