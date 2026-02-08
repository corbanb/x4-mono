import { useAuth } from "./useAuth";

/**
 * Convenience hook for accessing the current user from auth state.
 * Returns the user object and loading/auth state.
 */
export function useUser() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return { user, isAuthenticated, isLoading };
}
