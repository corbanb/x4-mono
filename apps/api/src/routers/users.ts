import { z } from "zod";
import { users, eq } from "@x4/database";
import { UserResponseSchema } from "@x4/shared/utils";
import { router, protectedProcedure } from "../trpc";
import { Errors } from "../lib/errors";

export const usersRouter = router({
  me: protectedProcedure
    .meta({
      openapi: { method: "GET", path: "/users/me", tags: ["Users"], protect: true },
    })
    .input(z.void())
    .output(UserResponseSchema)
    .query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.userId));

    if (!user) {
      throw Errors.notFound("User").toTRPCError();
    }

    return user;
  }),
});
