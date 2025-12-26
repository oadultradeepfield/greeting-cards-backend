import { invalidateCardCache, updateCard } from "../../db";
import { parseFieldSelection } from "../commands";
import { EMOJI } from "../constants";
import { clearState, setState } from "../state";
import type { ConversationContext } from "./types";

async function handleSelectField(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "update_select_field") {
    return false;
  }

  const field = parseFieldSelection(text);
  if (!field) {
    await client.sendMessage(
      chatId,
      `${EMOJI.warning} Invalid field. Please enter a valid field name or number.`,
    );
    return true;
  }

  state.data.updateField = field;
  state.step = "update_value";
  await setState(env.CARD_CACHE, chatId, state);

  const hint = field === "occasion" ? " (birthday/general)" : "";
  await client.sendMessage(
    chatId,
    `${EMOJI.pencil} Enter new value for *${field}*${hint}:`,
    { parse_mode: "Markdown" },
  );

  return true;
}

async function handleUpdateValue(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, state } = ctx;
  let { text } = ctx;

  if (state.step !== "update_value") {
    return false;
  }

  const field = state.data.updateField;
  const cardId = state.data.id;

  if (!field || !cardId) {
    await client.sendMessage(chatId, `${EMOJI.cross} Invalid state.`);
    await clearState(env.CARD_CACHE, chatId);
    return true;
  }

  if (field === "occasion") {
    const occasion = text.toLowerCase();
    if (occasion !== "birthday" && occasion !== "general") {
      await client.sendMessage(
        chatId,
        `${EMOJI.warning} Please type 'birthday' or 'general'.`,
      );
      return true;
    }
    text = occasion;
  }

  try {
    const updated = await updateCard(env.CARD_DB, cardId, { [field]: text });
    if (updated) {
      await invalidateCardCache(env.CARD_CACHE, cardId);
      await client.sendMessage(
        chatId,
        `${EMOJI.check} Updated *${field}* successfully!`,
        { parse_mode: "Markdown" },
      );
    } else {
      await client.sendMessage(chatId, `${EMOJI.cross} Card not found.`);
    }
  } catch (_e) {
    await client.sendMessage(chatId, `${EMOJI.cross} Failed to update card.`);
  }

  await clearState(env.CARD_CACHE, chatId);
  return true;
}

export async function handleUpdateConversation(
  ctx: ConversationContext,
): Promise<boolean> {
  if (await handleSelectField(ctx)) {
    return true;
  }

  if (await handleUpdateValue(ctx)) {
    return true;
  }

  return false;
}
