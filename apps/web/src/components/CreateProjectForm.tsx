"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectSchema } from "@x4/shared/utils";
import { trpc } from "@x4/shared/api-client";
import type { z } from "zod";

type FormValues = z.infer<typeof CreateProjectSchema>;

export function CreateProjectForm() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      router.push("/dashboard");
    },
  });

  function onSubmit(data: FormValues) {
    createProject.mutate(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {createProject.error && (
        <div
          role="alert"
          style={{
            padding: "0.75rem",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {createProject.error.message}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="name"
          style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}
        >
          Project Name
        </label>
        <input
          id="name"
          {...register("name")}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: `1px solid ${errors.name ? "#dc2626" : "#d1d5db"}`,
            borderRadius: "0.375rem",
            boxSizing: "border-box",
          }}
        />
        {errors.name && (
          <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
            {errors.name.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label
          htmlFor="description"
          style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description")}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: `1px solid ${errors.description ? "#dc2626" : "#d1d5db"}`,
            borderRadius: "0.375rem",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
        {errors.description && (
          <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
            {errors.description.message}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          type="submit"
          disabled={isSubmitting || createProject.isPending}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor:
              isSubmitting || createProject.isPending ? "#9ca3af" : "#000",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            cursor:
              isSubmitting || createProject.isPending
                ? "not-allowed"
                : "pointer",
            fontSize: "1rem",
          }}
        >
          {createProject.isPending ? "Creating..." : "Create Project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            background: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
