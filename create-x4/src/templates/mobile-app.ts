import type { TemplateFile } from "./apply.js";

export const MOBILE_APP_TEMPLATE: TemplateFile[] = [
  {
    path: "package.json",
    content: `{
  "name": "__SCOPE__/mobile-__MOBILE_NAME__",
  "version": "0.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "build": "echo 'use eas build'",
    "lint": "eslint app/ src/",
    "type-check": "tsc --noEmit",
    "test": "echo 'no tests yet'",
    "ios": "expo run:ios",
    "android": "expo run:android"
  },
  "dependencies": {
    "__SCOPE__/shared": "workspace:*",
    "__SCOPE__/auth": "workspace:*",
    "@tanstack/react-query": "^5.60.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.2.4",
    "expo-status-bar": "~2.2.3",
    "react": "^18.3.1",
    "react-native": "~0.76.0",
    "react-native-safe-area-context": "~5.6.2",
    "react-native-screens": "~4.23.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "typescript": "~5.6.0"
  }
}
`,
  },
  {
    path: "app.json",
    content: `{
  "expo": {
    "name": "__PROJECT_NAME__",
    "slug": "__PROJECT_NAME__-mobile-__MOBILE_NAME__",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "__PROJECT_NAME__-__MOBILE_NAME__",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "__BUNDLE_ID__"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "__BUNDLE_ID__"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
`,
  },
  {
    path: "tsconfig.json",
    content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "react": ["./node_modules/@types/react"],
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
`,
  },
  {
    path: "eas.json",
    content: `{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
`,
  },
  {
    path: ".env.example",
    content: `EXPO_PUBLIC_API_URL=http://localhost:3002
`,
  },
  {
    path: "src/lib/api.ts",
    content: `import { createTRPCClient } from "__SCOPE__/shared/api-client";
import { getStoredToken } from "__SCOPE__/auth/client/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3002";

export const api = createTRPCClient({
  url: \`\${API_URL}/trpc\`,
  getToken: getStoredToken,
});
`,
  },
  {
    path: "src/lib/trpc-provider.tsx",
    content: `import React, { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { SharedTRPCProvider } from "__SCOPE__/shared/trpc-provider";
import { api } from "./api";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5_000, retry: 1 },
        },
      }),
  );

  return (
    <SharedTRPCProvider client={api} queryClient={queryClient}>
      {children}
    </SharedTRPCProvider>
  );
}
`,
  },
  {
    path: "app/_layout.tsx",
    content: `import { Stack } from "expo-router";
import { TRPCProvider } from "../src/lib/trpc-provider";

export default function RootLayout() {
  return (
    <TRPCProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#000000",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Welcome" }} />
        <Stack.Screen name="login" options={{ title: "Log In" }} />
        <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
        <Stack.Screen
          name="(authenticated)"
          options={{ headerShown: false }}
        />
      </Stack>
    </TRPCProvider>
  );
}
`,
  },
  {
    path: "app/index.tsx",
    content: `import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>__MOBILE_NAME_CLEAN__</Text>
      <Text style={styles.subtitle}>Welcome to your app</Text>

      <Pressable style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push("/signup")}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Create Account
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: { backgroundColor: "#f0f0f0" },
  secondaryButtonText: { color: "#000" },
});
`,
  },
  {
    path: "app/login.tsx",
    content: `import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { signInAndStore } from "__SCOPE__/auth/client/native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signInAndStore({ email, password });
      router.replace("/(authenticated)");
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Log In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={[styles.button, loading && styles.disabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Signing in..." : "Log In"}</Text>
      </Pressable>
      <Link href="/signup" style={styles.link}>
        Don't have an account? Sign up
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.6 },
  link: { marginTop: 16, textAlign: "center", color: "#007AFF" },
});
`,
  },
  {
    path: "app/signup.tsx",
    content: `import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { authClient } from "__SCOPE__/auth/client/native";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await authClient.signUp.email({ name, email, password });
      Alert.alert("Success", "Account created! Please log in.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={[styles.button, loading && styles.disabled]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating account..." : "Sign Up"}
        </Text>
      </Pressable>
      <Link href="/login" style={styles.link}>
        Already have an account? Log in
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.6 },
  link: { marginTop: 16, textAlign: "center", color: "#007AFF" },
});
`,
  },
  {
    path: "app/(authenticated)/_layout.tsx",
    content: `import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { getStoredToken, signOutAndClear } from "__SCOPE__/auth/client/native";

export default function AuthenticatedLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getStoredToken().then((token) => {
      if (!token) router.replace("/login");
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <Pressable
            style={{ marginRight: 8 }}
            onPress={async () => {
              await signOutAndClear();
              router.replace("/login");
            }}
          >
            <Text style={{ color: "#ff3b30", fontSize: 16 }}>Logout</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
    </Stack>
  );
}
`,
  },
  {
    path: "app/(authenticated)/index.tsx",
    content: `import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Start building here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666" },
});
`,
  },
];
