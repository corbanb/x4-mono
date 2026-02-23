/**
 * Auth hook for React Native (Expo) platform.
 * Placeholder implementation — PRD-006 replaces with Better Auth + SecureStore.
 *
 * Metro/Expo resolves this file instead of useAuth.ts on native platforms.
 * The .native.ts convention is the standard React Native platform divergence pattern.
 *
 * Once PRD-006 is implemented, this will use:
 *   import * as SecureStore from "expo-secure-store";
 */

export type AuthState = {
  user: { userId: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

/**
 * Native auth hook — uses SecureStore for token storage.
 * PRD-006 replaces this with Better Auth session management.
 */
export function useAuth(): AuthState {
  // Placeholder: PRD-006 will integrate with Better Auth + expo-secure-store
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signIn: async (_credentials: { email: string; password: string }) => {
      throw new Error('Auth not implemented — see PRD-006');
    },
    signOut: async () => {
      throw new Error('Auth not implemented — see PRD-006');
    },
  };
}
