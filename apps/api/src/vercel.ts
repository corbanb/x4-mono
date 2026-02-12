import { app } from "./app";

export default {
  fetch: (req: Request) => app.fetch(req),
};
