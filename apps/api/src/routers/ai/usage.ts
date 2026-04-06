import { TRPCError } from '@trpc/server';
import { and, eq, gte, lte, sql, aiUsageLog } from '@x4/database';
import { DateRangeInput } from '@x4/shared/types';
import { router, protectedProcedure } from '../../trpc';
import { Errors } from '../../lib/errors';

export const usageRouter = router({
  summary: protectedProcedure.input(DateRangeInput).query(async ({ ctx, input }) => {
    try {
      const conditions = [eq(aiUsageLog.userId, ctx.user.userId)];
      if (input.from) conditions.push(gte(aiUsageLog.createdAt, input.from));
      if (input.to) conditions.push(lte(aiUsageLog.createdAt, input.to));

      const rows = await ctx.db
        .select({
          model: aiUsageLog.model,
          count: sql<string | null>`cast(count(*) as text)`,
          totalTokens: sql<string | null>`cast(sum(${aiUsageLog.tokensUsed}) as text)`,
          totalCost: sql<string | null>`cast(sum(${aiUsageLog.estimatedCost}) as text)`,
        })
        .from(aiUsageLog)
        .where(and(...conditions))
        .groupBy(aiUsageLog.model);

      const byModel = rows.map((row) => ({
        model: row.model,
        count: parseInt(row.count ?? '0', 10),
        tokens: parseInt(row.totalTokens ?? '0', 10),
        cost: parseFloat(row.totalCost ?? '0'),
      }));

      const totalRequests = byModel.reduce((s, r) => s + r.count, 0);
      const totalTokens = byModel.reduce((s, r) => s + r.tokens, 0);
      const totalCost = byModel.reduce((s, r) => s + r.cost, 0);

      return {
        totalRequests,
        totalTokens,
        totalCost,
        avgCostPerRequest: totalRequests === 0 ? 0 : totalCost / totalRequests,
        byModel: byModel.map((r) => ({
          ...r,
          pct: totalCost === 0 ? 0 : (r.cost / totalCost) * 100,
        })),
      };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw Errors.internal('Failed to fetch usage summary').toTRPCError();
    }
  }),

  history: protectedProcedure.input(DateRangeInput).query(async ({ ctx, input }) => {
    try {
      const conditions = [eq(aiUsageLog.userId, ctx.user.userId)];
      if (input.from) conditions.push(gte(aiUsageLog.createdAt, input.from));
      if (input.to) conditions.push(lte(aiUsageLog.createdAt, input.to));

      const rows = await ctx.db
        .select({
          date: sql<string>`date_trunc('day', ${aiUsageLog.createdAt})`,
          tokens: sql<string | null>`cast(sum(${aiUsageLog.tokensUsed}) as text)`,
          cost: sql<string | null>`cast(sum(${aiUsageLog.estimatedCost}) as text)`,
          count: sql<string | null>`cast(count(*) as text)`,
        })
        .from(aiUsageLog)
        .where(and(...conditions))
        .groupBy(sql`date_trunc('day', ${aiUsageLog.createdAt})`)
        .orderBy(sql`date_trunc('day', ${aiUsageLog.createdAt})`);

      return rows.map((row) => ({
        date: new Date(row.date).toISOString().slice(0, 10),
        tokens: parseInt(row.tokens ?? '0', 10),
        cost: parseFloat(row.cost ?? '0'),
        count: parseInt(row.count ?? '0', 10),
      }));
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw Errors.internal('Failed to fetch usage history').toTRPCError();
    }
  }),
});
