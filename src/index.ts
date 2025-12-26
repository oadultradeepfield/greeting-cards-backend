import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import api from "./routes/api";
import webhook from "./routes/webhook";

const app = new Hono<{ Bindings: Env }>();

const rateLimiter = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const { pathname } = new URL(c.req.url);
  const { success } = await c.env.RATE_LIMITER.limit({ key: pathname });

  if (!success) {
    return c.text(`429 Failure – rate limit exceeded for ${pathname}`, 429);
  }

  await next();
});

app.use("*", rateLimiter);

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Oad's Greeting Cards API",
    version: "1.0.0",
    endpoints: {
      api: "/api",
      webhook: "/webhook",
    },
  });
});

app.route("/api", api);
app.route("/webhook", webhook);

export default app;
