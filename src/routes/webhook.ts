import { Hono } from "hono";
import { handleTelegramUpdate } from "../bot/dispatcher";

const webhook = new Hono<{ Bindings: Env }>();

webhook.post("/", async (c) => {
	const token = c.env.TELEGRAM_BOT_TOKEN?.trim();
	const webhookSecret = c.env.TELEGRAM_WEBHOOK_SECRET?.trim();
	const allowedChatId = c.env.TELEGRAM_CHAT_ID?.trim();

	if (!token || !webhookSecret || !allowedChatId) {
		return c.json({ error: "Config missing" }, { status: 500 });
	}

	const secretHeader = c.req.header("x-telegram-bot-api-secret-token");
	if (secretHeader !== webhookSecret) {
		return c.json({ error: "Unauthorized" }, { status: 403 });
	}

	try {
		const update = await c.req.json();
		if (update.message?.chat) {
			const chatId = update.message.chat.id.toString();
			if (chatId !== allowedChatId) {
				return c.json({ ok: true });
			}
		}
		await handleTelegramUpdate(c.env, update);
	} catch (e) {
		console.error("Engine Error:", e);
	}

	return c.json({ ok: true });
});

export default webhook;
