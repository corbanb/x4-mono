import { users, eq } from "@x4/database";
import { router, protectedProcedure } from "../trpc";
import { Errors } from "../lib/errors";

export const usersRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
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
