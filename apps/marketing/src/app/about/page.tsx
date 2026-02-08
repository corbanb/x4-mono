import type { Metadata } from "next";
import { CTA } from "@/components/CTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about x4 — the multi-platform TypeScript monorepo boilerplate.",
};

export default function AboutPage() {
  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-bold text-gray-900">About x4</h1>

          <div className="mt-8 space-y-6 text-gray-600">
            <p>
              x4 is a full-stack TypeScript monorepo boilerplate designed for
              teams building multi-platform applications. It provides a
              production-ready foundation with type-safe APIs, authentication,
              database ORM, AI integration, and CI/CD — all wired together with
              consistent conventions.
            </p>

            <p>
              Instead of stitching together dozens of libraries and spending
              weeks on infrastructure, x4 gives you a working starting point:
              web (Next.js), mobile (Expo), and desktop (Electron) clients
              sharing a single backend (Hono + tRPC) with a Postgres database
              (Drizzle ORM) and built-in auth (Better Auth).
            </p>

            <h2 className="pt-4 text-2xl font-bold text-gray-900">
              Why a monorepo?
            </h2>
            <p>
              When you have a web app, a mobile app, a desktop app, and a shared
              API, keeping types and validation in sync across repositories is a
              full-time job. A monorepo with shared packages eliminates this
              problem entirely — change a Zod schema once, and every consumer
              gets the update instantly.
            </p>

            <h2 className="pt-4 text-2xl font-bold text-gray-900">
              Built with
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Bun runtime + Turborepo</li>
              <li>TypeScript across every package</li>
              <li>Next.js 15 (web)</li>
              <li>Expo + React Native (mobile)</li>
              <li>Electron (desktop)</li>
              <li>Hono + tRPC v11 (API)</li>
              <li>Drizzle ORM + Neon Postgres</li>
              <li>Better Auth</li>
              <li>Vercel AI SDK + Claude</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
