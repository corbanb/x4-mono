# PRD-011: Mobile Application — Expo + React Native

**PRD ID**: PRD-011
**Title**: Mobile Application — Expo + React Native
**Author**: AI-Native TPM
**Status**: Draft
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-004 (Shared UI & Hooks), PRD-005 (API Server), PRD-006 (Auth — native client)
**Blocks**: None

---

## 1. Problem Statement

Mobile apps in a monorepo often become second-class citizens — they get their own API client, their own auth flow, their own type definitions, and slowly diverge from the web app until they're effectively a separate codebase that happens to live in the same repo. The whole point of a monorepo is to share code, but mobile's unique constraints (React Native runtime, Expo build system, SecureStore for tokens, different navigation paradigm) make that sharing non-obvious.

This PRD sets up the Expo + React Native mobile app as a first-class consumer of the same shared infrastructure the web app uses: the same tRPC client (PRD-004), the same Zod validators (PRD-002), and the same auth flow (PRD-006) — with platform-appropriate token storage via SecureStore. The mobile app points at the same standalone API (PRD-005) and gets the same type safety guarantees. The difference is in the UI layer and navigation, not in the data layer.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| tRPC integration | `trpc.projects.list.useQuery()` works in React Native | Same typed hooks as web |
| Auth flow | Login → SecureStore token → protected API calls | Token persists across app restarts |
| Expo Router | File-based routing works with auth guards | Navigation between screens |
| EAS Build | `eas build` produces installable iOS/Android builds | Successful build on EAS |
| Shared code | Types, validators, hooks imported from `@packages/shared` | No duplicated type definitions |
| Dev workflow | `bun turbo dev --filter=mobile` starts Expo dev server | Hot reload on device/simulator |

---

## 3. Scope

### In Scope

- `apps/mobile/` workspace structure
- Expo Router setup with file-based routing (`app/` directory)
- tRPC client pointing at API via `EXPO_PUBLIC_API_URL`
- TRPCProvider for React Native (same pattern as web, different token source)
- Better Auth native client integration:
  - `signInAndStore()` — login + save token to SecureStore
  - `signOutAndClear()` — logout + clear SecureStore
  - Token retrieval for tRPC auth headers
- Screens:
  - Login / Signup
  - Dashboard (project list)
  - Create project
- `app.json` — Expo configuration
- `eas.json` — EAS Build configuration
- Environment variables via `EXPO_PUBLIC_*` prefix
- `package.json` with dev/build scripts

### Out of Scope

- Push notifications (per-project)
- Deep linking configuration (per-project)
- Offline support / local database (per-project)
- Platform-specific native modules (per-project)
- App Store / Play Store submission (per-project)
- Complex navigation patterns beyond basic stack (per-project)
- Biometric authentication (per-project — Better Auth plugin)

### Assumptions

- PRD-004 tRPC client and shared hooks are available
- PRD-005 API is running and accessible (localhost for dev, deployed URL for production)
- PRD-006 Better Auth native client (`client.native.ts`) is available
- Expo SDK 52+ is the target
- Node.js 20+ is available (Expo runs on Node, not Bun)

---

## 4. System Context

```
packages/shared/api-client   (PRD-004) ← trpc, createTRPCClient
packages/auth/client.native  (PRD-006) ← signInAndStore, signOutAndClear
       ↓
apps/mobile                  ← This PRD
       ↓ calls via tRPC
apps/api                     (PRD-005) ← /trpc/* endpoints
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-004 (Shared UI & Hooks) | tRPC client, shared hooks |
| PRD-005 (API Server) | tRPC endpoints to consume |
| PRD-006 (Auth) | Native auth client with SecureStore token management |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| PRD-014 (CI/CD) | `deploy-mobile.yml` triggers EAS builds |

---

## 5. Technical Design

### 5.1 Data Model / Types

No new types. Consumes types from PRD-002 via tRPC, same as web.

### 5.2 Architecture Decisions

**Decision**: Expo over bare React Native
**Context**: Need a mobile development platform with fast iteration and managed builds.
**Options Considered**: Expo (managed), bare React Native, Flutter
**Rationale**: Expo provides managed builds via EAS (no local Xcode/Android Studio required for CI), file-based routing (Expo Router), and a huge plugin ecosystem. Same React paradigm as web, so shared tRPC hooks work directly.
**Tradeoffs**: Some native modules require custom dev clients. Expo's managed workflow has constraints for deep native integrations. Acceptable for most products — eject to bare workflow only when needed.

**Decision**: SecureStore for token storage
**Context**: Mobile apps can't use httpOnly cookies. Need secure persistent storage for bearer tokens.
**Options Considered**: AsyncStorage, SecureStore, MMKV
**Rationale**: SecureStore is hardware-backed on iOS (Keychain) and uses Android Keystore on Android. It's the Expo-recommended approach for sensitive data like auth tokens. AsyncStorage is not encrypted.
**Tradeoffs**: SecureStore has a 2KB value limit. Bearer tokens are well under this. If we needed to store larger auth state, MMKV would be the fallback.

### 5.3 API Contracts / Interfaces

Same tRPC contract as web. The only difference is the client configuration:

```typescript
// apps/mobile/src/lib/api.ts
import { createTRPCClient } from "@packages/shared/api-client";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3002";

export const apiClient = createTRPCClient(API_URL, async () => {
  return (await SecureStore.getItemAsync("bearer_token")) || "";
});
```

### 5.4 File Structure

```
apps/mobile/
├── app/                      # Expo Router directory
│   ├── _layout.tsx           # Root layout with TRPCProvider
│   ├── index.tsx             # Home / landing screen
│   ├── login.tsx             # Login screen
│   ├── signup.tsx            # Signup screen
│   └── (dashboard)/
│       ├── _layout.tsx       # Auth-gated layout
│       ├── index.tsx         # Project list
│       └── new.tsx           # Create project
├── src/
│   ├── components/
│   │   ├── ProjectList.tsx   # Project list component
│   │   └── CreateProjectForm.tsx
│   ├── lib/
│   │   ├── api.ts            # tRPC client with SecureStore token
│   │   └── trpc-provider.tsx # TRPCProvider for RN
│   └── hooks/                # Mobile-specific hooks (if any)
├── .env.example
├── app.json                  # Expo config
├── eas.json                  # EAS build config
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Create `apps/mobile/` workspace with Expo template | 20m | PRD-001 | 🟡 Partial | `npx create-expo-app` then customize |
| 2 | Configure `app.json`, `eas.json`, `tsconfig.json` | 15m | Task 1 | ✅ Yes | Config files |
| 3 | Implement `src/lib/api.ts` — tRPC client with SecureStore token | 20m | PRD-004, PRD-006 | ✅ Yes | Same pattern as web, different token source |
| 4 | Implement `src/lib/trpc-provider.tsx` for React Native | 15m | Task 3 | ✅ Yes | Same as web provider |
| 5 | Implement `app/_layout.tsx` — root layout with providers | 15m | Task 4 | ✅ Yes | Standard Expo Router layout |
| 6 | Implement login/signup screens | 30m | PRD-006 (native client) | 🟡 Partial | Auth UX needs human review |
| 7 | Implement dashboard screens (project list, create) | 30m | Task 4, PRD-004 | 🟡 Partial | RN component patterns differ from web |
| 8 | Implement auth-gated layout (`(dashboard)/_layout.tsx`) | 15m | Task 6 | ✅ Yes | Check auth, redirect to login |
| 9 | Verify on iOS Simulator or Android Emulator | 20m | All above | ❌ No | Manual testing |
| 10 | Test EAS build configuration | 15m | Task 2 | ❌ No | Requires EAS account |

### Claude Code Task Annotations

**Task 3 (tRPC Client)**:
- **Context needed**: `createTRPCClient` from PRD-004. SecureStore API from expo-secure-store. `EXPO_PUBLIC_API_URL` env var.
- **Constraints**: Token getter must be `async` (SecureStore is async). Handle case where no token exists (return empty string, not null). Do NOT use localStorage — this is React Native.
- **Done state**: Client created, type-checks clean.
- **Verification command**: `cd apps/mobile && bun type-check`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | Token storage/retrieval, component rendering | Bun test + RN Testing Library | 5-8 |
| Integration | Auth flow against running API | Manual on device/simulator | 2-3 |
| E2E | Full login → CRUD flow | Detox (optional, per-project) | 0 (boilerplate) |

### Key Test Scenarios

1. **Token persistence**: Login → close app → reopen → still authenticated
2. **Token cleared on logout**: signOutAndClear → SecureStore empty → API calls return 401
3. **tRPC queries work**: Project list loads via tRPC
4. **Auth gate**: Navigate to dashboard without auth → redirect to login
5. **Form validation**: Invalid project name → Zod error displayed

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Cold start | App usable within 2s of launch | Manual timing |
| Token security | Bearer token in SecureStore (hardware-backed) | Code review |
| Offline resilience | App shows cached data or clear offline message | Manual test |
| Bundle size | JS bundle < 5MB | EAS build output |

---

## 9. Rollout & Migration

1. Run `npx create-expo-app` or scaffold manually
2. Install shared package dependencies
3. Set `EXPO_PUBLIC_API_URL` in `.env`
4. Start API + Expo dev server: `bun turbo dev --filter=api --filter=mobile`
5. Test on simulator
6. Configure EAS project: `eas init`
7. Test build: `eas build --platform ios --profile development`

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should we use Expo Router's `(auth)` group pattern for auth flow? | Affects navigation architecture | Mobile lead | Open — evaluate with Expo Router v4 patterns |
| 2 | Do we need a custom dev client for any native modules? | Affects dev workflow complexity | Mobile lead | Resolved — start with Expo Go, add dev client when needed |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
