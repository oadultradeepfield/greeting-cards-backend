import {
  type CommandContext,
  handleDelete,
  handleHelp,
  handleList,
  handleStart,
  handleUpdate,
  handleView,
} from "./commands";
import { handleConversation } from "./conversations";
import { clearState, getState, setState } from "./state";
import { TelegramClient } from "./telegram";

interface TelegramUpdate {
  message?: {
    chat: {
      id: number;
    };
    text?: string;
  };
}

export async function handleTelegramUpdate(env: Env, update: TelegramUpdate) {
  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id.toString();
  const text = update.message.text.trim();
  const client = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
  const state = await getState(env.CARD_CACHE, chatId);

  if (text.startsWith("/")) {
    const ctx: CommandContext = { client, chatId, text, env };
    const command = text.split(" ")[0];

    switch (command) {
      case "/start":
        await handleStart(ctx);
        break;
      case "/help":
        await handleHelp(ctx);
        break;
      case "/list":
        await handleList(ctx);
        break;
      case "/view":
        await handleView(ctx);
        break;
      case "/delete":
        await handleDelete(ctx);
        break;
      case "/update":
        await handleUpdate(ctx);
        break;
      case "/cancel":
        await clearState(env.CARD_CACHE, chatId);
        await client.sendMessage(chatId, "Cancelled.");
        break;
      case "/create":
        await setState(env.CARD_CACHE, chatId, {
          step: "create_recipient",
          data: {},
        });
        await client.sendMessage(chatId, "Who is this card for?");
        break;
      default:
        await client.sendMessage(chatId, "Unknown command.");
    }
    return;
  }

  if (state.step !== "idle") {
    await handleConversation(client, env, chatId, text, state);
    return;
  }

  await client.sendMessage(chatId, "Type /help for commands.");
}
