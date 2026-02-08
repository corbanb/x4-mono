import Link from "next/link";
import { ProjectList } from "@/components/ProjectList";

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Projects</h1>
        <Link
          href="/dashboard/new"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          New Project
        </Link>
      </div>

      <ProjectList />
    </div>
  );
}
