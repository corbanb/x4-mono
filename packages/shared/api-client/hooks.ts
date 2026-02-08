import { trpc } from "./client";

/** Fetch the current authenticated user */
export function useMe() {
  return trpc.users.me.useQuery();
}

/** Fetch a paginated list of projects */
export function useProjects(input?: { limit?: number; offset?: number }) {
  return trpc.projects.list.useQuery(input ?? { limit: 50, offset: 0 });
}

/** Fetch a single project by ID */
export function useProject(id: string) {
  return trpc.projects.get.useQuery({ id });
}

/** Create a new project */
export function useCreateProject() {
  return trpc.projects.create.useMutation();
}

/** Update an existing project */
export function useUpdateProject() {
  return trpc.projects.update.useMutation();
}

/** Delete a project */
export function useDeleteProject() {
  return trpc.projects.delete.useMutation();
}
