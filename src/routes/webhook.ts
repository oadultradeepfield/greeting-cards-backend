import { Hono } from "hono";
import { createBot, getBotWebhookHandler } from "../bot";

const webhook = new Hono<{ Bindings: Env }>();

webhook.post("/telegram", async (c, next) => {
  const token = c.env.TELEGRAM_BOT_TOKEN;
  const allowedChatId = c.env.TELEGRAM_CHAT_ID;

  if (!token) {
    return c.json(
      { error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 500 },
    );
  }

  if (!allowedChatId) {
    return c.json(
      { error: "TELEGRAM_CHAT_ID not configured" },
      { status: 500 },
    );
  }

  const bot = createBot(token, allowedChatId, c.env);
  const handler = getBotWebhookHandler(bot);

  return handler(c);
});

export default webhook;
