import { getCardById } from "../../db";
import { EMOJI } from "../constants";
import { setState } from "../state";
import type { CommandContext } from "./types";

const UPDATE_FIELDS = [
  "recipient",
  "sender",
  "occasion",
  "title",
  "thai_content",
  "english_content",
] as const;

export async function handleUpdate(ctx: CommandContext): Promise<void> {
  const { client, chatId, text, env } = ctx;

  const parts = text.split(" ");
  if (parts.length < 2) {
    await client.sendMessage(
      chatId,
      `${EMOJI.warning} Usage: /update [card_id]`,
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
    step: "update_select_field",
    data: { id },
  });

  const fieldList = UPDATE_FIELDS.map((f, i) => `${i + 1}. ${f}`).join("\n");
  await client.sendMessage(
    chatId,
    `${EMOJI.pencil} *Updating:* ${card.title}\n\n` +
      `Which field to update?\n\n${fieldList.replace(/_/g, "\\_")}\n\n` +
      `Reply with field name or number.`,
    { parse_mode: "Markdown" },
  );
}

export function parseFieldSelection(text: string): string | null {
  const trimmed = text.trim().toLowerCase();
  const num = parseInt(trimmed, 10);
  if (num >= 1 && num <= UPDATE_FIELDS.length) {
    return UPDATE_FIELDS[num - 1];
  }
  if (UPDATE_FIELDS.includes(trimmed as (typeof UPDATE_FIELDS)[number])) {
    return trimmed;
  }
  return null;
}
