import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCardById } from "../db";
import { CardSchema } from "../schema";

const api = new Hono<{ Bindings: Env }>();

api.use("/*", async (c, next) => {
	const corsMiddleware = cors({
		origin: c.env.FRONTEND_URL,
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
			return c.json(
				{
					success: false,
					error: "Invalid card ID format",
				},
				{ status: 400 },
			);
		}

		const cacheKey = `card:${id}`;
		const cachedCard = await c.env.CARD_CACHE.get(cacheKey, "json");

		if (cachedCard) {
			const validatedCard = CardSchema.parse(cachedCard);
			return c.json({
				success: true,
				data: validatedCard,
			});
		}

		const card = await getCardById(c.env.CARD_DB, id);

		if (!card) {
			return c.json(
				{
					success: false,
					error: "Card not found",
				},
				{ status: 404 },
			);
		}

		const validatedCard = CardSchema.parse(card);

		await c.env.CARD_CACHE.put(cacheKey, JSON.stringify(validatedCard), {
			expirationTtl: 3600,
		});

		return c.json({
			success: true,
			data: validatedCard,
		});
	} catch (error) {
		console.error("Error fetching card:", error);
		return c.json(
			{
				success: false,
				error: "Failed to fetch card",
			},
			{ status: 500 },
		);
	}
});

export default api;
