/**
 * Mock for @x4/auth/client — used in Storybook to avoid real auth calls.
 */

const mockUser = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  image: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockSession = {
  user: mockUser,
  session: {
    id: 'session-1',
    userId: 'user-1',
    token: 'mock-token',
    expiresAt: new Date('2099-01-01'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
};

export function useSession() {
  return {
    data: mockSession,
    isPending: false,
    error: null,
  };
}

export async function signIn() {
  return { error: null };
}

export async function signUp() {
  return { error: null };
}

export async function signOut() {
  return { error: null };
}

export const authClient = {
  useSession,
  signIn,
  signUp,
  signOut,
};
