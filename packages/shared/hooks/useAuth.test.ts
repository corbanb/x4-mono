import { describe, test, expect } from 'bun:test';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  test('returns correct shape with placeholder values', () => {
    const auth = useAuth();

    expect(auth.user).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.isLoading).toBe(false);
    expect(typeof auth.signIn).toBe('function');
    expect(typeof auth.signOut).toBe('function');
  });

  test('signIn throws placeholder error', async () => {
    const auth = useAuth();
    await expect(auth.signIn({ email: 'test@example.com', password: 'password' })).rejects.toThrow(
      'Auth not implemented',
    );
  });

  test('signOut throws placeholder error', async () => {
    const auth = useAuth();
    await expect(auth.signOut()).rejects.toThrow('Auth not implemented');
  });
});
