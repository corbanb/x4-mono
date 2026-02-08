import { TRPCError } from "@trpc/server";
import { projects, users, eq, and, sql, count } from "@x4/database";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  PaginationSchema,
  IdParamSchema,
} from "@x4/shared/utils";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const projectsRouter = router({
  list: publicProcedure.input(PaginationSchema).query(async ({ ctx, input }) => {
    const { limit, offset } = input;

    const [items, [total]] = await Promise.all([
      ctx.db
        .select()
        .from(projects)
        .limit(limit)
        .offset(offset)
        .orderBy(projects.createdAt),
      ctx.db.select({ count: count() }).from(projects),
    ]);

    return {
      items,
      total: total.count,
      limit,
      offset,
    };
  }),

  get: protectedProcedure.input(IdParamSchema).query(async ({ ctx, input }) => {
    const [project] = await ctx.db
      .select({
        id: projects.id,
        ownerId: projects.ownerId,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(projects)
      .innerJoin(users, eq(projects.ownerId, users.id))
      .where(eq(projects.id, input.id));

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Project ${input.id} not found`,
      });
    }

    return project;
  }),

  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const [project] = await ctx.db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description,
          ownerId: ctx.user.userId,
        })
        .returning();

      return project;
    }),

  update: protectedProcedure
    .input(UpdateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, input.id));

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project ${input.id} not found`,
        });
      }

      if (existing.ownerId !== ctx.user.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own projects",
        });
      }

      const { id, ...updates } = input;
      const [updated] = await ctx.db
        .update(projects)
        .set(updates)
        .where(eq(projects.id, id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(IdParamSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, input.id));

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project ${input.id} not found`,
        });
      }

      if (existing.ownerId !== ctx.user.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own projects",
        });
      }

      await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return { success: true as const };
    }),
});
