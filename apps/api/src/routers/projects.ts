import { projects, users, eq, count } from "@x4/database";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  PaginationSchema,
  IdParamSchema,
  ProjectListResponseSchema,
  ProjectWithOwnerSchema,
  ProjectResponseSchema,
  SuccessResponseSchema,
} from "@x4/shared/utils";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { Errors } from "../lib/errors";

export const projectsRouter = router({
  list: publicProcedure
    .meta({
      openapi: { method: "GET", path: "/projects", tags: ["Projects"] },
    })
    .input(PaginationSchema)
    .output(ProjectListResponseSchema)
    .query(async ({ ctx, input }) => {
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

  get: protectedProcedure
    .meta({
      openapi: { method: "GET", path: "/projects/{id}", tags: ["Projects"], protect: true },
    })
    .input(IdParamSchema)
    .output(ProjectWithOwnerSchema)
    .query(async ({ ctx, input }) => {
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
        throw Errors.notFound("Project").toTRPCError();
      }

      return project;
    }),

  create: protectedProcedure
    .meta({
      openapi: { method: "POST", path: "/projects", tags: ["Projects"], protect: true },
    })
    .input(CreateProjectSchema)
    .output(ProjectResponseSchema)
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
    .meta({
      openapi: { method: "PATCH", path: "/projects/{id}", tags: ["Projects"], protect: true },
    })
    .input(UpdateProjectSchema)
    .output(ProjectResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, input.id));

      if (!existing) {
        throw Errors.notFound("Project").toTRPCError();
      }

      if (existing.ownerId !== ctx.user.userId && ctx.user.role !== "admin") {
        throw Errors.forbidden("You can only update your own projects").toTRPCError();
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
    .meta({
      openapi: { method: "DELETE", path: "/projects/{id}", tags: ["Projects"], protect: true },
    })
    .input(IdParamSchema)
    .output(SuccessResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, input.id));

      if (!existing) {
        throw Errors.notFound("Project").toTRPCError();
      }

      if (existing.ownerId !== ctx.user.userId && ctx.user.role !== "admin") {
        throw Errors.forbidden("You can only delete your own projects").toTRPCError();
      }

      await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return { success: true as const };
    }),
});
