import { getCardById } from "../../db";
import { EMOJI } from "../constants";
import { setState } from "../state";
import type { CommandContext } from "./types";

export async function handleDelete(ctx: CommandContext): Promise<void> {
  const { client, chatId, text, env } = ctx;

  const parts = text.split(" ");
  if (parts.length < 2) {
    await client.sendMessage(
      chatId,
      `${EMOJI.warning} Usage: /delete [card_id]`,
    );
    return;
  }

  const id = parts[1];
  const card = await getCardById(env.CARD_DB, id);

  if (!card) {
    await client.sendMessage(chatId, `${EMOJI.cross} Card not found.`);
    return;
  }

  await setState(env.CARD_CACHE, chatId, {
    step: "delete_confirm",
    data: { id },
  });
  await client.sendMessage(
    chatId,
    `${EMOJI.warning} Are you sure you want to delete *${card.title}*?\n\nReply *yes* to confirm.`,
    { parse_mode: "Markdown" },
  );
}
