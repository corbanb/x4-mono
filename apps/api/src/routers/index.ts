import { router } from "../trpc";
import { usersRouter } from "./users";
import { projectsRouter } from "./projects";

export const appRouter = router({
  users: usersRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
