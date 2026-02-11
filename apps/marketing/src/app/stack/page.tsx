import type { Metadata } from "next";
import { TechGrid } from "@/components/sections/TechGrid";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "Explore x4's technology stack: Bun, TypeScript, Next.js, Expo, Electron, Hono, tRPC, Drizzle, Neon, Better Auth, and more.",
};

export default function StackPage() {
  return (
    <>
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            The <span className="gradient-text">modern stack</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Every technology chosen for a reason. No legacy baggage, no
            unnecessary abstractions — just the best tools for building
            multi-platform TypeScript applications.
          </p>
        </div>
      </section>

      <TechGrid />
      <ComparisonTable />
      <CTASection />
    </>
  );
}
