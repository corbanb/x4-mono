import { router } from "../trpc";
import { usersRouter } from "./users";
import { projectsRouter } from "./projects";
import { aiRouter } from "./ai";

export const appRouter = router({
  users: usersRouter,
  projects: projectsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
