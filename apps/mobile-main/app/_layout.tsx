import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TRPCProvider } from '@/lib/trpc-provider';

export default function RootLayout() {
  return (
    <TRPCProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'x4' }} />
        <Stack.Screen name="login" options={{ title: 'Log In' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      </Stack>
    </TRPCProvider>
  );
}
