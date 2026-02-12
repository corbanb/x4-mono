import { app } from "./src/index";

export default {
  fetch: (req: Request) => app.fetch(req),
};
