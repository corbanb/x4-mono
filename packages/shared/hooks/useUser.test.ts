import { describe, test, expect } from 'bun:test';
import { useUser } from './useUser';

describe('useUser', () => {
  test('returns user data from useAuth', () => {
    const result = useUser();

    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
    expect(result.isLoading).toBe(false);
  });

  test('does not expose signIn/signOut', () => {
    const result = useUser();
    expect(result).not.toHaveProperty('signIn');
    expect(result).not.toHaveProperty('signOut');
  });
});
