import { listCards } from "../../db";
import { EMOJI, occasionEmoji } from "../constants";
import type { CommandContext } from "./types";

export async function handleList(ctx: CommandContext): Promise<void> {
  const { client, chatId, env } = ctx;

  const cards = await listCards(env.CARD_DB);
  if (cards.length === 0) {
    await client.sendMessage(
      chatId,
      `${EMOJI.info} No cards found. Create one with /create!`,
    );
    return;
  }

  let message = `${EMOJI.list} *Your Cards:*\n\n`;
  for (const card of cards.slice(0, 10)) {
    message += `• \`${card.id}\`: ${card.title} ${occasionEmoji(card.occasion)}\n`;
  }

  await client.sendMessage(chatId, message, { parse_mode: "Markdown" });
}
