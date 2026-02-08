import { createAuthClient } from "better-auth/react";

const TOKEN_KEY = "x4_auth_token";

/**
 * React Native auth client.
 *
 * Uses Better Auth's bearer plugin (server-side) so the token is
 * managed via Authorization headers rather than cookies. On native,
 * callers should persist the token using expo-secure-store (or
 * equivalent) after sign-in — see `signInAndStore` / `signOutAndClear`.
 */
export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3002",
});

export const { useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;

/**
 * Sign in and persist the bearer token to SecureStore.
 *
 * Dynamically imports expo-secure-store so this module can be
 * imported in environments where SecureStore is unavailable
 * (the import will only execute at call-time on a real device).
 */
export async function signInAndStore(credentials: {
  email: string;
  password: string;
}) {
  const result = await authClient.signIn.email(credentials);
  if (result.data?.token) {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);
  }
  return result;
}

/**
 * Sign out and remove the persisted token from SecureStore.
 */
export async function signOutAndClear() {
  await authClient.signOut();
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Retrieve the stored token (e.g., to restore session on app launch).
 */
export async function getStoredToken(): Promise<string | null> {
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(TOKEN_KEY);
}
