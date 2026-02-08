/**
 * Auth hook for web platform.
 * Placeholder implementation — PRD-006 replaces with Better Auth client integration.
 *
 * Once PRD-006 is implemented, this will wrap:
 *   import { useSession, signIn, signOut } from "@packages/auth/client";
 */

export type AuthState = {
  user: { userId: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

/**
 * Web auth hook — uses localStorage for token storage.
 * PRD-006 replaces this with Better Auth session management.
 */
export function useAuth(): AuthState {
  // Placeholder: PRD-006 will integrate with Better Auth useSession()
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signIn: async (_credentials: { email: string; password: string }) => {
      throw new Error("Auth not implemented — see PRD-006");
    },
    signOut: async () => {
      throw new Error("Auth not implemented — see PRD-006");
    },
  };
}
