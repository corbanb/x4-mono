import type { Metadata } from 'next';
import { StickyScroll } from '@/components/sections/StickyScroll';
import { CTASection } from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'Features',
  description:
    "Explore x4's features: type-safe APIs with tRPC, built-in authentication, AI integration, and multi-platform support.",
};

const FEATURES = [
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
  {
    badge: 'Database',
    title: 'Serverless Postgres with Drizzle',
    description:
      'Neon serverless Postgres with Drizzle ORM gives you type-safe queries, automatic migrations, and zero cold starts. Define your schema in TypeScript, generate migrations, and deploy to a globally distributed database.',
    color: 'bg-blue-500/10 text-blue-400',
    code: `// Schema as TypeScript
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  status: text("status").default("active"),
  ownerId: uuid("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type-safe queries
const results = await db
  .select()
  .from(projects)
  .where(eq(projects.ownerId, userId))
  .orderBy(desc(projects.createdAt));`,
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero section */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Features built for <span className="gradient-text">shipping fast</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Every feature is designed to work together. Type safety flows from database to UI. Auth
            works on every platform. AI is a tRPC call away.
          </p>
        </div>
      </section>

      <StickyScroll items={FEATURES} />
      <CTASection />
    </>
  );
}
