import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 1rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        x4 Platform
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "2rem" }}>
        Full-stack TypeScript application with type-safe APIs, authentication,
        and AI integration.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link
          href="/login"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: "0.5rem",
            textDecoration: "none",
          }}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid #ccc",
            borderRadius: "0.5rem",
            textDecoration: "none",
            color: "#000",
          }}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
