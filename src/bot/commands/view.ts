import { getCardById } from "../../db";
import { EMOJI, occasionEmoji } from "../constants";
import type { CommandContext } from "./types";

export async function handleView(ctx: CommandContext): Promise<void> {
  const { client, chatId, text, env } = ctx;

  const parts = text.split(" ");
  if (parts.length < 2) {
    await client.sendMessage(chatId, `${EMOJI.warning} Usage: /view [card_id]`);
    return;
  }

  const id = parts[1];
  const card = await getCardById(env.CARD_DB, id);

  if (!card) {
    await client.sendMessage(chatId, `${EMOJI.cross} Card not found.`);
    return;
  }

  await client.sendMessage(
    chatId,
    `${EMOJI.card} *Card Details*\n\n` +
      `ID: \`${card.id}\`\n` +
      `Title: *${card.title}*\n` +
      `To: ${card.recipient}\n` +
      `From: ${card.sender}\n` +
      `Occasion: ${card.occasion} ${occasionEmoji(card.occasion)}\n` +
      `Thai: ${card.thai_content || "-"}\n` +
      `English: ${card.english_content || "-"}\n\n` +
      `Link: ${env.FRONTEND_URL}/${card.id}`,
    { parse_mode: "Markdown" },
  );
}
