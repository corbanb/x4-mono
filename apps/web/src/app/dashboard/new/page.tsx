import { CreateProjectForm } from "@/components/CreateProjectForm";

export default function NewProjectPage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Create New Project
      </h1>
      <CreateProjectForm />
    </div>
  );
}
