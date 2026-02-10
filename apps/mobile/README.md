# @x4/mobile

Mobile application built with **Expo + React Native**.

## Overview

- **Framework**: Expo 52, React Native
- **Navigation**: Expo Router (file-based)
- **Data**: tRPC client via `@trpc/react-query`
- **Auth**: Better Auth native client + SecureStore
- **Token Storage**: expo-secure-store

## Development

```bash
bun run dev       # Start Expo dev server
bun run ios       # Run on iOS simulator
bun run android   # Run on Android emulator
```

Requires the [Expo Go](https://expo.dev/go) app for physical device testing.

## Structure

```
app/
  _layout.tsx           # Root layout with auth provider
  (auth)/
    login.tsx           # Login screen
    signup.tsx          # Signup screen
  (app)/
    _layout.tsx         # Auth-gated tab layout
    index.tsx           # Dashboard / project list
    create.tsx          # Create project form
src/
  components/           # Mobile-specific components
  lib/
    trpc.ts             # tRPC client with SecureStore token
```

## Auth Flow

- Tokens stored in `expo-secure-store` (encrypted device storage)
- `signInAndStore` / `signOutAndClear` helpers manage token lifecycle
- Auth state checked on app launch, redirects to login if needed
- Route groups: `(auth)` for login/signup, `(app)` for authenticated screens

## Building

```bash
# EAS Build (cloud)
eas build --platform ios
eas build --platform android

# Local build
bun run ios       # iOS simulator
bun run android   # Android emulator
```

EAS configuration is in `eas.json`.
