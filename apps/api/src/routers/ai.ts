import { aiUsageLog } from "@x4/database";
import { AIGenerateInputSchema, AIGenerateOutputSchema } from "@x4/shared/ai";
import { generateAIResponse, calculatePreciseCost } from "@x4/ai-integrations";
import { router, protectedProcedure } from "../trpc";
import { Errors } from "../lib/errors";
import { aiLogger } from "../lib/logger";

export const aiRouter = router({
  generate: protectedProcedure
    .meta({
      openapi: { method: "POST", path: "/ai/generate", tags: ["AI"], protect: true },
    })
    .input(AIGenerateInputSchema)
    .output(AIGenerateOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const start = performance.now();

      let result;
      try {
        result = await generateAIResponse(input.prompt, {
          systemPrompt: input.systemPrompt,
          maxTokens: input.maxTokens,
        });
      } catch (err) {
        aiLogger.error(
          { err, userId: ctx.user.userId },
          "AI generation failed",
        );
        throw Errors.internal("AI generation failed").toTRPCError();
      }

      const duration = Math.round(performance.now() - start);
      const totalTokens = result.usage.totalTokens;
      const estimatedCost = calculatePreciseCost(
        result.usage.promptTokens,
        result.usage.completionTokens,
        "claude-sonnet-4-20250514",
      );

      // Log to database
      try {
        await ctx.db.insert(aiUsageLog).values({
          userId: ctx.user.userId,
          model: "claude-sonnet-4-20250514",
          tokensUsed: totalTokens,
          estimatedCost: String(estimatedCost),
          endpoint: "ai.generate",
        });
      } catch (err) {
        aiLogger.warn({ err }, "Failed to log AI usage to database");
      }

      // Structured log
      aiLogger.info(
        {
          userId: ctx.user.userId,
          model: "claude-sonnet-4-20250514",
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens,
          estimatedCost,
          duration: `${duration}ms`,
        },
        "AI generation completed",
      );

      return {
        text: result.text,
        tokensUsed: totalTokens,
        estimatedCost,
      };
    }),
});
