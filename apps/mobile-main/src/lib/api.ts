import { createTRPCClient } from '@x4/shared/api-client';
import { getStoredToken } from '@x4/auth/client/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002';

export const trpcClient = createTRPCClient({
  baseUrl: API_URL,
  getToken: async () => {
    const token = await getStoredToken();
    return token ?? undefined;
  },
});
