# PRD-009: AI Integration Layer

**PRD ID**: PRD-009
**Title**: AI Integration Layer
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-002 (Shared Types), PRD-003 (Database — aiUsageLog table), PRD-005 (API Server), PRD-007 (Error Handling & Logging — aiLogger), PRD-008 (Rate Limiting — AI tier)
**Blocks**: None directly — projects add AI features on top

---

## 1. Problem Statement

Every AI-powered product needs the same foundational pieces: a provider abstraction (so you're not locked to one LLM), a way to stream responses, prompt management, cost tracking, and usage logging. Without these, teams either hard-code `fetch("https://api.anthropic.com/...")` directly in route handlers — creating unmaintainable spaghetti — or over-engineer an abstraction layer that takes weeks to build before any AI feature ships.

The Vercel AI SDK solves the provider abstraction problem elegantly, but you still need to wire it into your specific stack: configure providers with API keys, create tRPC endpoints that handle both generation and streaming, track token usage and costs per user, and log every AI call for debugging and billing. That wiring is the same across projects and belongs in the boilerplate.

This PRD creates the AI integration layer: provider wrappers using Vercel AI SDK (Claude primary, OpenAI secondary), a prompt template system, cost estimation utilities, a tRPC `ai.generate` mutation that handles the full lifecycle (validate input → generate → log usage → return result), and integration with the `aiUsageLog` database table from PRD-003. The AI-specific rate limit tier from PRD-008 protects against runaway costs.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| Text generation | `ai.generate` mutation returns AI-generated text | Valid response from Claude API |
| Usage tracking | Every AI call writes to `aiUsageLog` table | Row with model, tokens, cost, endpoint |
| Cost estimation | `estimateTokenCost(tokens, model)` returns dollar amount | Correct rates for Claude and GPT-4 |
| Provider abstraction | Switching from Claude to OpenAI requires changing one parameter | Model string swap only |
| Rate limiting | AI endpoints enforce 10 requests/min limit | Request 11 returns 429 |
| AI logging | Every AI call logs model, tokens, cost, latency via `aiLogger` | Structured log entry |
| Prompt templates | `SystemPrompts.CUSTOMER_SUPPORT` etc. available as constants | String templates exported |
| Input validation | Prompt length and max tokens are validated | Invalid input returns Zod error |

---

## 3. Scope

### In Scope

- `packages/shared/ai/` — provider-agnostic abstraction
  - `index.ts` — `generateAIResponse()`, `streamAIResponse()` using Vercel AI SDK
  - `types.ts` — `AIOptions`, `AIResponse` interfaces
  - `prompts/system.ts` — `SystemPrompts` constant with template categories
  - `utils.ts` — `estimateTokenCost()` utility
- `packages/ai-integrations/` — Vercel AI SDK provider wrappers
  - `providers/claude.ts` — Claude via `@ai-sdk/anthropic`
  - `providers/openai.ts` — OpenAI via `@ai-sdk/openai`
  - `providers/index.ts` — provider factory
  - `cost-tracking.ts` — token cost calculation per model
  - `prompts.ts` — prompt template system
  - `package.json` — AI SDK dependencies
- `apps/api/src/routers/ai.ts` — tRPC AI router
  - `ai.generate` mutation: prompt → text + usage + cost
  - Input validation: prompt length cap, max tokens cap
  - Writes to `aiUsageLog` table on every call
  - Logs via `aiLogger` from PRD-007
- Integration with `aiUsageLog` table from PRD-003 (complete the TODO in spec)

### Out of Scope

- Specific AI features (content generation, chat, code review — per-project)
- Embeddings and vector search (pgvector template in PRD-003 is ready but not activated)
- Fine-tuning pipelines
- AI streaming to clients via SSE/WebSocket (real-time is deferred)
- Multi-turn conversation management (per-project)
- Tool use / function calling setup (per-project)

### Assumptions

- `ANTHROPIC_API_KEY` is set in `.env.local`
- `OPENAI_API_KEY` is set (optional — only needed if using OpenAI)
- PRD-003 `aiUsageLog` table exists in database schema
- PRD-007 `aiLogger` child logger is available
- PRD-008 AI rate limit tier (10/min) is wired to `/trpc/ai.*`

---

## 4. System Context

```
packages/shared/ai              ← This PRD (generateAIResponse, types, prompts)
packages/ai-integrations        ← This PRD (Vercel AI SDK wrappers)
       ↓
apps/api/src/routers/ai.ts     ← This PRD (tRPC ai router)
       ↓
  ├── packages/database (PRD-003): writes to aiUsageLog
  ├── apps/api/lib/logger (PRD-007): aiLogger for structured logging
  └── apps/api/middleware/rateLimit (PRD-008): ai tier (10/min)
       ↓
  Consumed by apps via tRPC:
  ├── apps/web (PRD-010): trpc.ai.generate.useMutation()
  ├── apps/mobile (PRD-011): same
  └── apps/desktop (PRD-012): same
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-002 (Shared Types) | Base types for AI interfaces |
| PRD-003 (Database) | `aiUsageLog` table for usage tracking |
| PRD-005 (API Server) | tRPC router system to mount AI router |
| PRD-007 (Error Handling & Logging) | `aiLogger` for AI call logging |
| PRD-008 (Rate Limiting) | AI rate limit tier protecting endpoints |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| Per-project AI features | Import `generateAIResponse`, `SystemPrompts`, extend with project-specific prompts |
| tRPC clients (web/mobile/desktop) | `trpc.ai.generate.useMutation()` |
| Cost monitoring | Query `aiUsageLog` table for usage dashboards |

---

## 5. Technical Design

### 5.1 Data Model / Types

**AI Types**:
```typescript
// packages/shared/ai/types.ts
export interface AIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
```

**Database table** (from PRD-003, consumed here):
```typescript
// aiUsageLog — userId, model, tokensUsed, estimatedCost, endpoint, createdAt
```

### 5.2 Architecture Decisions

**Decision**: Vercel AI SDK as the provider abstraction layer
**Context**: Need to support multiple AI providers without per-provider API wiring.
**Options Considered**: (1) Direct API calls per provider, (2) Vercel AI SDK, (3) LangChain, (4) Custom abstraction
**Rationale**: Vercel AI SDK provides a clean `generateText` / `streamText` API that works identically across providers. Swap `anthropic("claude-sonnet-4-20250514")` for `openai("gpt-4")` and everything else stays the same. LangChain is heavier and more opinionated than needed for our use case.
**Tradeoffs**: Dependency on Vercel AI SDK. If they make breaking changes, we're affected. Acceptable given the active maintenance and Vercel's investment in the ecosystem.

**Decision**: Claude as primary provider, OpenAI as secondary
**Context**: Need a default AI provider for the boilerplate.
**Options Considered**: Claude only, OpenAI only, both with factory
**Rationale**: Claude (Anthropic) is the recommended primary for code-heavy and reasoning-heavy use cases. OpenAI is available as a secondary for specific models (e.g., DALL-E, Whisper). Provider factory makes switching trivial.
**Tradeoffs**: Teams that prefer OpenAI-first need to swap the default. One-line change.

**Decision**: Usage logging to database, not just logs
**Context**: Need to track AI costs per user for billing, budgets, and abuse detection.
**Options Considered**: (1) Log only (Pino), (2) Database only (aiUsageLog), (3) Both
**Rationale**: Both. Pino logs provide real-time observability (latency, errors). Database table provides queryable historical data (total spend per user, cost trends). Different audiences: ops reads logs, product reads database.
**Tradeoffs**: Slight write overhead on every AI call (~5ms for DB insert). Worth it for cost visibility.

### 5.3 API Contracts / Interfaces

**Package exports**:
```typescript
// packages/shared/ai/index.ts
export async function generateAIResponse(prompt: string, options?: AIOptions): Promise<string>;
export async function streamAIResponse(prompt: string, options?: AIOptions): Promise<ReadableStream>;

// packages/ai-integrations/providers/index.ts
export function getProvider(model: string): LanguageModel;

// packages/ai-integrations/cost-tracking.ts
export function estimateTokenCost(tokensUsed: number, model: string): number;
```

**tRPC Router**:
```typescript
// apps/api/src/routers/ai.ts
ai.generate: protectedProcedure
  .input(z.object({
    prompt: z.string().min(1).max(10000),
    systemPrompt: z.string().optional(),
    maxTokens: z.number().min(1).max(4000).default(1000),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Generate via Vercel AI SDK
    // 2. Log to aiUsageLog table
    // 3. Log via aiLogger
    // 4. Return { text, tokensUsed, estimatedCost }
  })
```

**Return shape**:
```typescript
{
  text: string;
  tokensUsed: number;
  estimatedCost: number;
}
```

### 5.4 File Structure

```
packages/shared/ai/
├── index.ts              # generateAIResponse, streamAIResponse
├── types.ts              # AIOptions, AIResponse, AIMessage interfaces
├── prompts/
│   └── system.ts         # SystemPrompts constant (CUSTOMER_SUPPORT, CONTENT_GENERATION, etc.)
└── utils.ts              # Token counting helpers

packages/ai-integrations/
├── providers/
│   ├── claude.ts         # Vercel AI SDK + @ai-sdk/anthropic
│   ├── openai.ts         # Vercel AI SDK + @ai-sdk/openai
│   └── index.ts          # Provider factory
├── cost-tracking.ts      # estimateTokenCost per model
├── prompts.ts            # Prompt template utilities
└── package.json          # deps: ai, @ai-sdk/anthropic, @ai-sdk/openai

apps/api/src/routers/
└── ai.ts                 # tRPC AI router — ai.generate mutation
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Create `packages/shared/ai/` — types, interfaces | 15m | PRD-002 | ✅ Yes | Type definitions only |
| 2 | Create `packages/ai-integrations/package.json` and install AI SDK deps | 10m | PRD-001 | ✅ Yes | Config + dependencies |
| 3 | Implement `providers/claude.ts` — Vercel AI SDK + Anthropic | 25m | Task 2 | ✅ Yes | Well-documented SDK |
| 4 | Implement `providers/openai.ts` — Vercel AI SDK + OpenAI | 15m | Task 2 | ✅ Yes | Same pattern as Claude |
| 5 | Implement provider factory (`providers/index.ts`) | 10m | Tasks 3-4 | ✅ Yes | Simple switch/map |
| 6 | Implement `packages/shared/ai/index.ts` — `generateAIResponse`, `streamAIResponse` | 25m | Task 5 | 🟡 Partial | AI generates, human reviews error handling for API failures |
| 7 | Implement `cost-tracking.ts` — `estimateTokenCost()` | 10m | Task 1 | ✅ Yes | Rate lookup table |
| 8 | Implement `prompts/system.ts` — `SystemPrompts` constant | 10m | None | ✅ Yes | String templates |
| 9 | Implement `apps/api/src/routers/ai.ts` — tRPC AI router | 40m | Tasks 6-7, PRD-003 (aiUsageLog), PRD-007 (aiLogger) | 🟡 Partial | Core wiring — human reviews logging + DB insert |
| 10 | Add `ai` router to root `appRouter` | 5m | Task 9 | ✅ Yes | One line addition |
| 11 | Write unit tests for cost tracking, provider factory | 20m | Tasks 5, 7 | ✅ Yes | Test rate calculations, provider resolution |
| 12 | Write integration test for ai.generate (mock AI provider) | 25m | Task 9 | 🟡 Partial | Mock the AI SDK, verify DB write + logging |
| 13 | Manual test: call ai.generate with real Anthropic API key | 10m | Task 9 | ❌ No | Requires live API key |

### Claude Code Task Annotations

**Task 9 (AI Router)**:
- **Context needed**: tRPC protectedProcedure from PRD-005. `aiUsageLog` schema from PRD-003. `aiLogger` from PRD-007. `generateAIResponse` from Task 6. `estimateTokenCost` from Task 7. Input validation limits from spec (prompt: 10000 chars, maxTokens: 4000).
- **Constraints**: MUST write to `aiUsageLog` table after every successful generation. MUST log via `aiLogger` with model, tokens, cost, latency. MUST use `protectedProcedure` (no anonymous AI access). Handle AI provider errors gracefully — wrap in AppError, don't expose raw API errors to client.
- **Done state**: `ai.generate` mutation works end-to-end. DB row created. Log entry written. Response includes text, tokensUsed, estimatedCost.
- **Verification command**: `cd apps/api && bun test`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | Cost tracking, provider factory, prompt templates, input validation | Bun test | 12-15 |
| Integration | ai.generate with mocked AI provider, DB write, logging | Bun test | 5-8 |
| E2E | N/A (manual test with real API key) | — | 0 |

### Key Test Scenarios

1. **Cost estimation**: `estimateTokenCost(1000, "claude-sonnet-4")` returns expected cost
2. **Provider factory**: `getProvider("claude-sonnet-4-20250514")` returns Anthropic provider
3. **Provider factory — unknown**: `getProvider("unknown-model")` throws or returns default
4. **Input validation**: Prompt > 10000 chars → Zod error. maxTokens > 4000 → Zod error.
5. **ai.generate — happy path**: Valid input → returns `{ text, tokensUsed, estimatedCost }`
6. **ai.generate — DB logging**: After generation, `aiUsageLog` has new row with correct fields
7. **ai.generate — structured logging**: `aiLogger` called with model, tokens, cost, latency
8. **ai.generate — unauthenticated**: Without auth → 401 UNAUTHORIZED
9. **ai.generate — rate limited**: 11th request in a minute → 429 (handled by PRD-008 middleware)
10. **AI provider error**: Provider returns error → AppError with INTERNAL_ERROR, not raw exception

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Generation latency | < 5s for 1000-token response (depends on provider) | Measured in integration test |
| DB write overhead | aiUsageLog insert < 10ms | Measured in integration test |
| Cost accuracy | Token cost estimates within 10% of actual billing | Compare with provider dashboard |
| No API key exposure | API keys never appear in logs or error responses | Code review + grep |
| Graceful degradation | If AI provider is down, return clear error (not hang or timeout) | Test with invalid API key |

---

## 9. Rollout & Migration

1. Install AI SDK packages: `bun add ai @ai-sdk/anthropic @ai-sdk/openai --filter=@[project-name]/ai-integrations`
2. Set `ANTHROPIC_API_KEY` in `.env.local`
3. Implement all files
4. Add `ai` router to root `appRouter`
5. Test: `curl -X POST http://localhost:3002/trpc/ai.generate -d '{"prompt":"Hello world"}'` (with auth token)
6. Check `aiUsageLog` table for new row
7. Check API logs for `aiLogger` entry
8. Commit

**Note**: The AI rate limit tier from PRD-008 should already be wired to `/trpc/ai.*` before this PRD ships.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should `aiUsageLog.tokensUsed` store input + output separately or combined? | Affects cost granularity | Data | Open — spec stores combined as varchar. Consider splitting to `inputTokens` + `outputTokens` as integers. |
| 2 | Should AI responses be cached by default? | Affects cost and latency | Product | Resolved — optional via `cache.getOrGenerate()` from PRD-008. Not automatic. |
| 3 | Do we need a user-facing AI usage dashboard in the boilerplate? | Adds scope to web app | Product | Resolved — no. Query the table directly. Dashboards are per-project. |
| 4 | Should streaming be supported in the tRPC router or only via separate SSE endpoint? | Affects UX for chat-like features | Architect | Open — tRPC supports streaming via `experimental_stream`. Evaluate when a project needs it. |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
