import type { TemplateFile } from "./apply.js";

export const WEB_APP_TEMPLATE: TemplateFile[] = [
  {
    path: "package.json",
    content: `{
  "name": "__SCOPE__/__WEB_NAME__",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port __PORT__",
    "build": "next build",
    "start": "next start --port __PORT__",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "__SCOPE__/shared": "workspace:*",
    "__SCOPE__/auth": "workspace:*",
    "@tanstack/react-query": "^5.60.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "next": "~15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.6.0"
  }
}
`,
  },
  {
    path: "next.config.ts",
    content: `import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["__SCOPE__/shared", "__SCOPE__/auth"],
};

export default nextConfig;
`,
  },
  {
    path: "tsconfig.json",
    content: `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
  },
  {
    path: "postcss.config.js",
    content: `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`,
  },
  {
    path: "src/styles/globals.css",
    content: `@import "tailwindcss";
`,
  },
  {
    path: ".env.example",
    content: `NEXT_PUBLIC_API_URL=http://localhost:3002
`,
  },
  {
    path: "src/lib/trpc-provider.tsx",
    content: `"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient } from "__SCOPE__/shared/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )session_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5_000, retry: 1 },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    createTRPCClient({
      url: \`\${API_URL}/trpc\`,
      getToken: async () => getToken(),
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
`,
  },
  {
    path: "src/lib/utils.ts",
    content: `import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
`,
  },
  {
    path: "src/app/layout.tsx",
    content: `import type { Metadata } from "next";
import "@/styles/globals.css";
import { TRPCProvider } from "@/lib/trpc-provider";

export const metadata: Metadata = {
  title: "__WEB_NAME__",
  description: "Built with x4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
`,
  },
  {
    path: "src/app/page.tsx",
    content: `import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">__WEB_NAME__</h1>
      <p className="text-gray-500 mb-8">Start building your app</p>
      <Link
        href="/login"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Get Started
      </Link>
    </main>
  );
}
`,
  },
  {
    path: "src/app/(auth)/layout.tsx",
    content: `export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
`,
  },
  {
    path: "src/app/(auth)/login/page.tsx",
    content: `"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        \`\${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/auth/sign-in/email\`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Invalid credentials");
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
      {error && (
        <p className="text-red-600 text-sm text-center mb-4">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
`,
  },
  {
    path: "src/app/(auth)/signup/page.tsx",
    content: `"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(
        \`\${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/auth/sign-up/email\`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        },
      );
      if (!res.ok) throw new Error("Registration failed");
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
      {error && (
        <p className="text-red-600 text-sm text-center mb-4">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
`,
  },
  {
    path: "src/app/(dashboard)/layout.tsx",
    content: `import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">__WEB_NAME__</h1>
        <Link href="/login" className="text-sm text-red-600 hover:underline">
          Logout
        </Link>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
`,
  },
  {
    path: "src/app/(dashboard)/page.tsx",
    content: `export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome</h2>
      <p className="text-gray-500">Start building your dashboard here.</p>
    </div>
  );
}
`,
  },
  {
    path: "src/middleware.ts",
    content: `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session_token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
`,
  },
];
