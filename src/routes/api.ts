import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { getCardById, incrementCardViews } from "../db";
import { ViewCardSchema } from "../schema";

const api = new Hono<{ Bindings: Env }>();

api.use("/*", async (c, next) => {
  const corsMiddleware = cors({
    origin: [c.env.FRONTEND_URL, "http://localhost:5173"],
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

api.get("/cards/:id", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id || id.length !== 10) {
      return c.json({ success: false, error: "Invalid card ID format" }, 400);
    }

    const card = await fetchCard(c, id);
    if (!card) {
      return c.json({ success: false, error: "Card not found" }, 404);
    }

    return c.json({ success: true, data: card });
  } catch (err) {
    console.error("Error fetching card:", err);
    return c.json({ success: false, error: "Failed to fetch card" }, 500);
  }
});

async function fetchCard(c: Context, id: string) {
  const cacheKey = `card:${id}`;

  const cached = await c.env.CARD_CACHE.get(cacheKey, "json");
  if (cached) {
    const parsed = ViewCardSchema.parse(cached);
    c.executionCtx.waitUntil(trackView(c, id));
    return parsed;
  }

  const card = await getCardById(c.env.CARD_DB, id);
  if (!card) return null;

  const parsed = ViewCardSchema.parse(card);

  c.executionCtx.waitUntil(
    Promise.all([
      c.env.CARD_CACHE.put(cacheKey, JSON.stringify(parsed), {
        expirationTtl: 3600,
      }),
      trackView(c, id),
    ]),
  );

  return parsed;
}

async function trackView(c: Context, id: string) {
  const ip = getClientIp(c);
  if (!ip) {
    await incrementCardViews(c.env.CARD_DB, id);
    return;
  }

  const visitorKey = `card:${id}:v:${ip}`;
  if (await c.env.CARD_CACHE.get(visitorKey)) return;

  await c.env.CARD_CACHE.put(visitorKey, "1", { expirationTtl: 86400 });
  await incrementCardViews(c.env.CARD_DB, id);
}

function getClientIp(c: Context) {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

export default api;
