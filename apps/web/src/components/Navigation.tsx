"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@x4/auth/client";

export function Navigation() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Link href="/" style={{ fontWeight: 700, textDecoration: "none", color: "#000" }}>
        x4
      </Link>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {isPending ? null : session?.user ? (
          <>
            <Link href="/dashboard" style={{ textDecoration: "none", color: "#000" }}>
              Dashboard
            </Link>
            <span style={{ fontSize: "0.875rem", color: "#666" }}>
              {session.user.name}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                background: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: "none", color: "#000" }}>
              Sign In
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: "0.375rem",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
