# PRD-012: Desktop Application — Electron

**PRD ID**: PRD-012
**Title**: Desktop Application — Electron
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-004 (Shared UI & Hooks), PRD-005 (API Server), PRD-006 (Auth — desktop client)
**Blocks**: None

---

## 1. Problem Statement

Desktop apps in a monorepo face a unique challenge: they need to bridge two worlds — the main process (Node.js, native OS access, secure storage) and the renderer process (React, browser-like environment, tRPC hooks). Auth tokens need to be encrypted at rest using OS-level APIs (`safeStorage`), but the React components that make API calls live in the renderer and can't directly access those APIs. This requires an IPC bridge pattern that's easy to get wrong — either leaking tokens to the renderer process or creating a clunky developer experience.

This PRD sets up the Electron app with a clean three-process architecture (main, preload, renderer), the same tRPC client and shared hooks as web and mobile, and a secure auth pattern where tokens are encrypted via `safeStorage` in the main process and made available to the renderer via IPC. The renderer is effectively a React app that looks identical to the web app's data layer — same tRPC hooks, same types, same auth state — just running inside a desktop window.

---

## 2. Success Criteria

| Criteria         | Measurement                                        | Target                                      |
| ---------------- | -------------------------------------------------- | ------------------------------------------- |
| tRPC integration | Same `trpc.projects.list.useQuery()` hooks as web  | Shared hooks work in renderer               |
| Auth security    | Token encrypted via Electron `safeStorage`         | Token not readable from filesystem          |
| IPC bridge       | Renderer retrieves token from main process via IPC | Secure channel, no token in renderer memory |
| Dev workflow     | Hot reload on renderer changes                     | File save → UI updates                      |
| Build            | `electron-builder` produces installable app        | macOS .dmg and/or Windows .exe              |
| Shared code      | Types, validators, hooks from `@packages/shared`   | No duplicated definitions                   |

---

## 3. Scope

### In Scope

- `apps/desktop/` workspace structure
- Three-process architecture:
  - `src/main/` — main process (app lifecycle, safeStorage, IPC handlers)
  - `src/preload/` — preload script (exposes IPC to renderer securely)
  - `src/renderer/` — renderer process (React app with tRPC)
- `src/main/auth.ts` — `safeStorage` token encryption/decryption, IPC handlers
- `src/preload/index.ts` — `contextBridge.exposeInMainWorld` for auth IPC
- `src/renderer/` — React app structure:
  - TRPCProvider with token from main process via IPC
  - Same component patterns as web
- `electron-builder.yml` — packaging configuration
- `package.json` with dev/build/package scripts

### Out of Scope

- Auto-update mechanism (per-project — electron-updater)
- Platform-specific native features (tray, notifications — per-project)
- Code signing certificates (per-project operational concern)
- Custom window chrome / frameless window (per-project)
- Multi-window support (per-project)
- System tray integration (per-project)

### Assumptions

- PRD-004 tRPC client and shared hooks are available
- PRD-005 API is running and accessible
- PRD-006 desktop auth pattern (`safeStorage`) is defined
- Electron 30+ is the target
- Node.js 20+ is available (Electron's main process runs Node.js)

---

## 4. System Context

```
packages/shared/api-client   (PRD-004) ← trpc, createTRPCClient
packages/auth/               (PRD-006) ← desktop auth pattern
       ↓
apps/desktop                 ← This PRD
  ├── main process     → safeStorage, IPC
  ├── preload          → contextBridge
  └── renderer         → React + tRPC (same as web)
       ↓ calls via tRPC
apps/api                     (PRD-005)
```

### Dependency Map

| Depends On                  | What It Provides                      |
| --------------------------- | ------------------------------------- |
| PRD-004 (Shared UI & Hooks) | tRPC client, shared hooks             |
| PRD-005 (API Server)        | tRPC endpoints                        |
| PRD-006 (Auth)              | Desktop auth pattern with safeStorage |

### Consumed By

| Consumer        | How It's Used                                  |
| --------------- | ---------------------------------------------- |
| PRD-014 (CI/CD) | `deploy-desktop.yml` triggers electron-builder |

---

## 5. Technical Design

### 5.2 Architecture Decisions

**Decision**: Electron over Tauri
**Context**: Need a desktop framework that supports the existing React + TypeScript stack.
**Options Considered**: Electron, Tauri
**Rationale**: Electron uses the same React renderer as web — shared tRPC hooks and components work without adaptation. Tauri uses a Rust backend with webview, which would require different patterns for auth and IPC. Electron's ecosystem is more mature for production desktop apps.
**Tradeoffs**: Larger binary size (Electron bundles Chromium). Higher memory usage. Acceptable for most desktop use cases.

**Decision**: `safeStorage` for token encryption over file-based storage
**Context**: Bearer tokens must be stored securely between sessions.
**Options Considered**: safeStorage, electron-store (plaintext), OS keychain via `keytar`
**Rationale**: `safeStorage` is built into Electron — no additional dependencies. Uses OS-level encryption (Keychain on macOS, DPAPI on Windows, libsecret on Linux). `keytar` was deprecated in favor of `safeStorage`.
**Tradeoffs**: `safeStorage.isEncryptionAvailable()` may return false on some Linux configurations without a keyring. Fall back to warning the user.

**Decision**: IPC bridge for auth, not direct token access in renderer
**Context**: Renderer process should not have direct access to decrypted tokens for security.
**Options Considered**: (1) Token in renderer memory, (2) IPC bridge to main, (3) Preload-only access
**Rationale**: Main process holds the decrypted token. Renderer requests it via IPC when needed (e.g., for tRPC auth header). Token flows through preload's `contextBridge` which limits the API surface exposed to the renderer.
**Tradeoffs**: Slightly more complex than just putting the token in a variable. Worth it for the security posture.

### 5.3 API Contracts / Interfaces

**IPC Channels**:

```typescript
// Exposed via contextBridge in preload:
window.electronAuth = {
  getToken: () => Promise<string | null>, // IPC invoke → main decrypts from safeStorage
  setToken: (token: string) => Promise<void>, // IPC invoke → main encrypts to safeStorage
  clearToken: () => Promise<void>, // IPC invoke → main deletes from safeStorage
};
```

**tRPC Client in Renderer**:

```typescript
const client = createTRPCClient(API_URL, async () => {
  return (await window.electronAuth.getToken()) || '';
});
```

### 5.4 File Structure

```
apps/desktop/
├── src/
│   ├── main/
│   │   ├── index.ts          # App lifecycle, window creation
│   │   └── auth.ts           # safeStorage encrypt/decrypt, IPC handlers
│   ├── preload/
│   │   └── index.ts          # contextBridge: expose electronAuth to renderer
│   └── renderer/
│       ├── index.html        # HTML entry point
│       ├── index.tsx         # React entry with TRPCProvider
│       ├── components/       # Same patterns as web
│       └── lib/
│           └── trpc-provider.tsx  # TRPCProvider using window.electronAuth
├── public/                   # Static assets (icons, etc.)
├── .env.example
├── electron-builder.yml      # Packaging config
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Implementation Plan

### Task Breakdown

| #   | Task                                                         | Estimate | Dependencies    | Claude Code Candidate? | Notes                                      |
| --- | ------------------------------------------------------------ | -------- | --------------- | ---------------------- | ------------------------------------------ |
| 1   | Create `apps/desktop/` workspace with Electron scaffolding   | 20m      | PRD-001         | 🟡 Partial             | Boilerplate but Electron config is nuanced |
| 2   | Implement `src/main/index.ts` — app lifecycle, BrowserWindow | 20m      | Task 1          | ✅ Yes                 | Standard Electron main process             |
| 3   | Implement `src/main/auth.ts` — safeStorage + IPC handlers    | 25m      | Task 2, PRD-006 | 🟡 Partial             | Security-critical — human reviews          |
| 4   | Implement `src/preload/index.ts` — contextBridge for auth    | 15m      | Task 3          | ✅ Yes                 | Standard preload pattern                   |
| 5   | Implement `src/renderer/` — React app with TRPCProvider      | 25m      | Task 4, PRD-004 | ✅ Yes                 | Same as web, token from IPC                |
| 6   | Implement login/dashboard screens in renderer                | 25m      | Task 5          | ✅ Yes                 | Same component patterns as web             |
| 7   | Configure `electron-builder.yml`                             | 15m      | Task 1          | ✅ Yes                 | Packaging config                           |
| 8   | Set up dev workflow with hot reload                          | 15m      | Task 5          | 🟡 Partial             | Electron + Vite/webpack HMR setup          |
| 9   | Test: build and run packaged app                             | 15m      | All above       | ❌ No                  | Manual — run `electron-builder`            |

### Claude Code Task Annotations

**Task 3 (safeStorage + IPC)**:

- **Context needed**: Electron `safeStorage` API. IPC main/renderer communication via `ipcMain.handle`. The token store/retrieve/clear pattern from PRD-006.
- **Constraints**: Check `safeStorage.isEncryptionAvailable()` before use. Store encrypted buffer in a known file path (e.g., app data directory). Never log the decrypted token. IPC channel names must be typed constants.
- **Done state**: Main process can encrypt/store, decrypt/retrieve, and delete tokens. IPC handlers respond to renderer requests.
- **Verification command**: `cd apps/desktop && bun type-check`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level       | What's Tested                              | Tool                          | Count (approx)  |
| ----------- | ------------------------------------------ | ----------------------------- | --------------- |
| Unit        | safeStorage wrapper, IPC handler logic     | Bun test (mock Electron APIs) | 8-12            |
| Integration | Full auth flow in running Electron app     | Manual                        | 2-3             |
| E2E         | Spectron or Playwright Electron (optional) | Per-project                   | 0 (boilerplate) |

### Key Test Scenarios

1. **Token store/retrieve**: Store token → retrieve → matches original
2. **Token cleared**: Clear token → retrieve → null
3. **safeStorage unavailable**: `isEncryptionAvailable()` false → graceful fallback/warning
4. **IPC security**: Renderer can only access `electronAuth` methods, not arbitrary main process APIs
5. **tRPC works**: Project list loads in renderer via tRPC through auth IPC
6. **safeStorage encrypt/decrypt round-trip**: `encryptString` → `decryptString` returns original value
7. **IPC handler responds to `auth:get-token`**: Main process receives invoke, returns decrypted token
8. **IPC handler responds to `auth:set-token`**: Main process receives invoke, encrypts and stores token
9. **Preload exposes exact API surface**: `contextBridge` exposes exactly `getToken`, `setToken`, `clearToken` — no extra methods
10. **BrowserWindow security defaults**: `nodeIntegration: false`, `contextIsolation: true` verified in window config

### Mock Patterns

```typescript
// Mock Electron APIs for unit tests
import { mock } from 'bun:test';

const encrypted = new Map<string, Buffer>();

mock.module('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => true,
    encryptString: (text: string) => {
      const buf = Buffer.from(`encrypted:${text}`);
      return buf;
    },
    decryptString: (buf: Buffer) => {
      return buf.toString().replace('encrypted:', '');
    },
  },
  ipcMain: {
    handle: mock(() => {}),
  },
  BrowserWindow: class {
    constructor(public opts: Record<string, unknown>) {}
    loadURL() {}
  },
}));
```

---

## 8. Non-Functional Requirements

| Requirement     | Target                               | How Verified                             |
| --------------- | ------------------------------------ | ---------------------------------------- |
| App launch time | Window visible within 2s             | Manual timing                            |
| Memory usage    | < 200MB idle (Electron baseline)     | Activity Monitor / Task Manager          |
| Token security  | Encrypted at rest via OS APIs        | Code review + `safeStorage` verification |
| Binary size     | < 150MB packaged (Electron baseline) | `electron-builder` output                |

---

## 9. Rollout & Migration

1. Scaffold Electron workspace
2. Implement main, preload, renderer
3. `bun turbo dev --filter=desktop` — verify hot reload
4. Test auth flow: login → token stored → close app → reopen → still authenticated
5. Build: `cd apps/desktop && bun run build && bun run package`
6. Test packaged app on target OS

---

## 10. Open Questions

| #   | Question                                             | Impact                                                       | Owner        | Status                                                                        |
| --- | ---------------------------------------------------- | ------------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------- |
| 1   | Vite or webpack for renderer bundling?               | Affects dev server speed and config complexity               | Desktop lead | Open — Vite preferred for speed, but Electron + Vite requires `electron-vite` |
| 2   | Do we need a custom protocol handler for deep links? | Affects whether desktop app can be opened from browser links | Product      | Resolved — defer to per-project                                               |

---

## 11. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-02-07 | AI-Native TPM | Initial draft |
