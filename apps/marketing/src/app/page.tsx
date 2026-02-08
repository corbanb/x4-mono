import { Hero } from "@/components/Hero";
import { CTA } from "@/components/CTA";

const FEATURES = [
  {
    title: "Type-Safe End to End",
    description:
      "tRPC connects your frontend to your backend with zero code generation. Change an API — TypeScript catches every caller instantly.",
  },
  {
    title: "One Codebase, Three Platforms",
    description:
      "Next.js for web, Expo for mobile, Electron for desktop. Shared types, shared validation, shared business logic.",
  },
  {
    title: "Production Ready",
    description:
      "Auth, database, AI integration, error handling, rate limiting, and CI/CD — all wired up and ready to ship.",
  },
  {
    title: "Modern Stack",
    description:
      "Bun runtime, Turborepo builds, Drizzle ORM, Better Auth, Vercel AI SDK, Tailwind CSS. No legacy baggage.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="features" className="border-t border-gray-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything you need to ship fast
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            A batteries-included monorepo boilerplate so you can focus on your
            product, not your infrastructure.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
