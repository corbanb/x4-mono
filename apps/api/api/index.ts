import { Hono } from "hono";
import { handle } from "hono/vercel";

let appHandler: (req: Request) => Response | Promise<Response>;

try {
  const mod = await import("../src/index");
  appHandler = handle(mod.app);
} catch (e: unknown) {
  const initError = e instanceof Error ? e : new Error(String(e));
  const fallback = new Hono();
  fallback.all("*", (c) => {
    return c.json(
      {
        error: "INIT_FAILED",
        message: initError.message,
        stack: initError.stack?.split("\n").slice(0, 15),
      },
      500,
    );
  });
  appHandler = handle(fallback);
}

export default appHandler;
