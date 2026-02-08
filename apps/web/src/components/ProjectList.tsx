"use client";

import Link from "next/link";
import { trpc } from "@x4/shared/api-client";

export function ProjectList() {
  const { data, isLoading, error } = trpc.projects.list.useQuery({
    limit: 50,
    offset: 0,
  });

  if (isLoading) {
    return <p style={{ color: "#666" }}>Loading projects...</p>;
  }

  if (error) {
    return (
      <div role="alert" style={{ color: "#dc2626" }}>
        Failed to load projects: {error.message}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        <p>No projects yet.</p>
        <Link
          href="/dashboard/new"
          style={{ color: "#2563eb", textDecoration: "underline" }}
        >
          Create your first project
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {data.items.map((project) => (
        <div
          key={project.id}
          style={{
            padding: "1rem",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
        >
          <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
            {project.name}
          </h3>
          {project.description && (
            <p style={{ color: "#666", fontSize: "0.875rem", margin: 0 }}>
              {project.description}
            </p>
          )}
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "#9ca3af",
            }}
          >
            Status: {project.status}
          </div>
        </div>
      ))}
    </div>
  );
}
