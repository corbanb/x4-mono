import { z } from "zod";

// --- AI Options Schema ---

export const AIOptionsSchema = z.object({
  model: z.string().optional(),
  maxTokens: z.number().min(1).max(4000).default(1000),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().optional(),
});

export type AIOptions = z.infer<typeof AIOptionsSchema>;

// --- AI Response ---

export interface AIResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// --- AI Message ---

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// --- AI Generate Input (for tRPC) ---

export const AIGenerateInputSchema = z.object({
  prompt: z.string().min(1).max(10000),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().min(1).max(4000).default(1000),
});

export type AIGenerateInput = z.infer<typeof AIGenerateInputSchema>;

// --- AI Generate Output ---

export interface AIGenerateOutput {
  text: string;
  tokensUsed: number;
  estimatedCost: number;
}
