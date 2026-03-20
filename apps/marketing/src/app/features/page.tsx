import type { Metadata } from 'next';
import { StickyScroll } from '@/components/sections/StickyScroll';
import { CTASection } from '@/components/sections/CTASection';
import {
  AgentTeamVisual,
  RailwayDeployVisual,
  NeonDatabaseVisual,
} from '@/components/sections/FeatureVisuals';

export const metadata: Metadata = {
  title: 'Features',
  description:
    "Explore x4's features: AI agent teams, automated deployment, serverless databases, type-safe APIs, and multi-platform support.",
};

const FEATURES = [
  {
    badge: 'Agent Teams',
    title: 'AI Agents That Design, Plan & Build',
    description:
      'One Claude Code plugin powers an entire development team. Brainstorm approaches, generate PRDs, build the implementation, write tests, run security review, and ship a pull request — all from a single /x4:work command. Fully tested, fully reviewed, ready to merge.',
    color: 'bg-violet-500/10 text-violet-400',
    visual: <AgentTeamVisual />,
  },
  {
    badge: 'Deployment',
    title: 'Push to Deploy with Railway',
    description:
      'Every push to main auto-deploys your API, web app, marketing site, and docs to Railway. No Dockerfiles, no build configs — Railpack auto-detects Bun and Next.js. Four services running in production from a single git push. Add custom domains, scale replicas, and monitor logs from one dashboard.',
    color: 'bg-cyan-500/10 text-cyan-400',
    visual: <RailwayDeployVisual />,
  },
  {
    badge: 'Database',
    title: 'Serverless Postgres with Neon',
    description:
      'Neon gives you Postgres that scales to zero and branches like git. Create isolated database branches for feature work, run migrations safely, and merge back to production. Paired with Drizzle ORM for type-safe schemas, queries, and automatic migrations — all in TypeScript.',
    color: 'bg-emerald-500/10 text-emerald-400',
    visual: <NeonDatabaseVisual />,
  },
  {
    badge: 'Type Safety',
    title: 'End-to-End Type Safety with tRPC',
    description:
      'Define your API once in TypeScript. Your frontend gets full autocompletion and type checking — no code generation, no runtime overhead, no schema drift. Change an endpoint and TypeScript catches every broken caller instantly.',
    color: 'bg-yellow-500/10 text-yellow-400',
    code: `// Define once on the server
export const projectRouter = router({
  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(async ({ input, ctx }) => {
      const project = await db
        .insert(projects)
        .values({
          ...input,
          ownerId: ctx.user.id,
        })
        .returning();
      return project[0];
    }),
});

// Call from any client — fully typed
const mutation = trpc.projects.create.useMutation();
await mutation.mutateAsync({
  name: "My App",  // ← autocomplete + type-checked
  description: "Built with x4",
});`,
  },
  {
    badge: 'Authentication',
    title: 'Auth That Works Everywhere',
    description:
      'Better Auth handles session management, bearer tokens, and role-based access control across web, mobile, and desktop. Protected routes, admin procedures, and ownership checks are built into the tRPC middleware layer.',
    color: 'bg-emerald-500/10 text-emerald-400',
    code: `// Server: protect routes with middleware
export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { user: ctx.user } });
  });

// Web: session via cookies
const { data: session } = useSession();

// Mobile: session via SecureStore
const token = await SecureStore.getItemAsync("token");

// Desktop: session via safeStorage
const token = ipcRenderer.invoke("auth:getToken");`,
  },
  {
    badge: 'AI Integration',
    title: 'AI-Powered Out of the Box',
    description:
      'Vercel AI SDK with Claude integration, streaming responses, cost tracking, and usage analytics. Define AI procedures as tRPC endpoints and call them from any platform with the same type-safe patterns.',
    color: 'bg-violet-500/10 text-violet-400',
    code: `// AI as a tRPC procedure
export const aiRouter = router({
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string(),
      model: z.enum(["claude-sonnet-4-5-20250514", "claude-haiku"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await generateText({
        model: anthropic(input.model),
        prompt: input.prompt,
      });

      await trackUsage({
        userId: ctx.user.id,
        tokens: result.usage,
        cost: calculateCost(result.usage),
      });

      return result;
    }),
});`,
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero section */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            From idea to <span className="gradient-text">production</span> — automated
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI agent teams design and build your features. Railway deploys them automatically. Neon
            hosts your data serverlessly. Everything else — auth, type safety, AI — is wired in from
            day one.
          </p>
        </div>
      </section>

      <StickyScroll items={FEATURES} />
      <CTASection />
    </>
  );
}
