import { EMOJI } from "../constants";
import { clearState } from "../state";
import type { CommandContext } from "./types";

export async function handleStart(ctx: CommandContext): Promise<void> {
  const { client, chatId, env } = ctx;

  await clearState(env.CARD_CACHE, chatId);
  await client.sendMessage(
    chatId,
    `${EMOJI.wave} *Welcome to Oad's Greeting Cards!* ${EMOJI.sparkles}\n\n` +
      `I can help you create and manage digital greeting cards.\n\n` +
      `Type /help to see what I can do!`,
    { parse_mode: "Markdown" },
  );
}
