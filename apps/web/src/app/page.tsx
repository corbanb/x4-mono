import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Sparkles,
  Database,
  Smartphone,
  Workflow,
  Code2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const features = [
  {
    icon: Code2,
    title: 'Type-Safe APIs',
    description:
      'End-to-end type safety with tRPC v11 and Zod validation. Zero runtime errors from API mismatches.',
    className: 'md:col-span-2',
  },
  {
    icon: Shield,
    title: 'Authentication',
    description:
      'Better Auth with session management, role-based access, and multi-platform support.',
    className: 'md:col-span-1',
  },
  {
    icon: Sparkles,
    title: 'AI Integration',
    description: 'Vercel AI SDK with Claude. Built-in cost tracking and usage analytics.',
    className: 'md:col-span-1',
  },
  {
    icon: Smartphone,
    title: 'Multi-Platform',
    description:
      'Web (Next.js), Mobile (Expo), and Desktop (Electron) from a single codebase with shared packages.',
    className: 'md:col-span-2',
  },
  {
    icon: Database,
    title: 'Database',
    description: 'Drizzle ORM with Neon Postgres. Type-safe queries, migrations, and seeding.',
    className: 'md:col-span-1',
  },
  {
    icon: Workflow,
    title: 'CI/CD',
    description: 'GitHub Actions with Neon branching, migration checks, and automated deployments.',
    className: 'md:col-span-1',
  },
];

const techStack = [
  'Next.js 15',
  'React 19',
  'TypeScript',
  'tRPC',
  'Drizzle',
  'Tailwind v4',
  'Bun',
  'Turborepo',
];

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          x4
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          Full-Stack TypeScript Boilerplate
        </Badge>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
            Build. Ship. Scale.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Production-ready monorepo with type-safe APIs, authentication, AI integration, and
          multi-platform support. Start building in minutes.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold">Everything you need</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className={`group transition-all hover:-translate-y-0.5 hover:shadow-md ${feature.className}`}
            >
              <CardContent className="p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="mb-1 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="text-sm">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto">
        <Separator />
        <div className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground">
          <span>x4 Platform</span>
          <span>Built with Next.js, tRPC, and Drizzle</span>
        </div>
      </footer>
    </div>
  );
}
