import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useSession, signOutAndClear } from '@x4/auth/client/native';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

export default function DashboardLayout() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <Pressable
            onPress={async () => {
              await signOutAndClear();
              router.replace('/login');
            }}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="new" options={{ title: 'New Project' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
});
