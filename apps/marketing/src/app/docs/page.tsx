import type { Metadata } from 'next';
import { AnimatedTerminal } from '@/components/sections/AnimatedTerminal';
import { QuickStartSteps } from '@/components/sections/QuickStartSteps';
import { CTASection } from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Get started with x4 in minutes. Quick start guide and links to full documentation.',
};

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:3003';

export default function DocsPage() {
  return (
    <>
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Get started in <span className="gradient-text">minutes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Three commands to a running multi-platform app. Clone, install, dev.
          </p>
        </div>
      </section>

      {/* Animated terminal */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-6">
          <AnimatedTerminal />
        </div>
      </section>

      <QuickStartSteps />

      {/* Links to full docs */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold">Full documentation</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Dive deeper into every part of x4.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Getting Started',
                description: 'Installation, setup, and your first deploy.',
                href: DOCS_URL,
              },
              {
                title: 'API Reference',
                description: 'tRPC routers, endpoints, and OpenAPI spec.',
                href: `${DOCS_URL}/api`,
              },
              {
                title: 'Architecture',
                description: 'How the monorepo is structured and why.',
                href: `${DOCS_URL}/architecture`,
              },
              {
                title: 'Authentication',
                description: 'Better Auth setup, sessions, and RBAC.',
                href: `${DOCS_URL}/auth`,
              },
              {
                title: 'Database',
                description: 'Drizzle schema, migrations, and queries.',
                href: `${DOCS_URL}/database`,
              },
              {
                title: 'Deployment',
                description: 'Vercel, CI/CD, and production setup.',
                href: `${DOCS_URL}/deployment`,
              },
            ].map((doc) => (
              <a
                key={doc.title}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-white/15 hover:bg-card/80"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {doc.title}
                  <span className="ml-1 text-muted-foreground transition-transform group-hover:translate-x-0.5 inline-block">
                    &rarr;
                  </span>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
