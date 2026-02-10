# @x4/desktop

Desktop application built with **Electron**.

## Overview

- **Framework**: Electron 33
- **Build Tool**: electron-vite
- **UI**: React 19 (renderer process)
- **Data**: tRPC client
- **Auth**: Better Auth + safeStorage encryption
- **Architecture**: Three-process (main, preload, renderer)

## Development

```bash
bun run dev       # Start Electron in dev mode
bun run build     # Build for production
bun run package   # Package for distribution
```

## Structure

```
src/
  main/
    index.ts            # Main process entry, window management
    auth-store.ts       # safeStorage encrypted token storage
  preload/
    index.ts            # IPC bridge (contextBridge.exposeInMainWorld)
  renderer/
    App.tsx             # React app root
    components/         # Desktop-specific components
    lib/
      trpc.ts           # tRPC client with IPC token retrieval
```

## Architecture

**Main process** — Node.js environment. Manages windows, system tray, and encrypted auth storage via Electron's `safeStorage` API.

**Preload script** — Bridge between main and renderer. Exposes a safe IPC API via `contextBridge`.

**Renderer process** — React app in a Chromium webview. Uses tRPC client for API calls.

## Auth Flow

1. User logs in via renderer UI
2. Token sent to main process via IPC
3. Main process encrypts token with `safeStorage.encryptString()`
4. On subsequent launches, token is decrypted and sent to renderer
5. Renderer attaches token to tRPC client headers

## Packaging

Configuration in `electron-builder.yml`. Builds for macOS, Windows, and Linux.

```bash
bun run package   # Build distributable
```
