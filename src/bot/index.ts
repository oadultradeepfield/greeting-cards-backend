import { Bot, webhookCallback } from "grammy";
import {
  handleStart,
  handleHelp,
  handleCancel,
  handleList,
  handleView,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleTextMessage,
} from "./handlers";
import { Context } from "grammy";

export interface BotContext extends Context {
  env: Env;
}

export function createBot(token: string, allowedChatId: string, env: Env) {
  const bot = new Bot<BotContext>(token);

  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id || ctx.from?.id;
    if (chatId?.toString() !== allowedChatId) {
      return;
    }
    ctx.env = env;
    await next();
  });

  bot.command("cancel", handleCancel);
  bot.command("start", handleStart);
  bot.command("help", handleHelp);

  bot.command("create", handleCreate);
  bot.command("list", handleList);
  bot.command("view", handleView);
  bot.command("update", handleUpdate);
  bot.command("delete", handleDelete);

  bot.on("message:text", handleTextMessage);
  return bot;
}

export function getBotWebhookHandler(bot: Bot<BotContext>) {
  return webhookCallback(bot, "hono");
}
