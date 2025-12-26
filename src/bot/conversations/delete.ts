import { invalidateCardCache, softDeleteCard } from "../../db";
import { EMOJI } from "../constants";
import { clearState } from "../state";
import type { ConversationContext } from "./types";

export async function handleDeleteConversation(
  ctx: ConversationContext,
): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "delete_confirm") {
    return false;
  }

  if (text.toLowerCase() === "yes") {
    if (state.data.id) {
      try {
        const deleted = await softDeleteCard(env.CARD_DB, state.data.id);
        if (deleted) {
          await invalidateCardCache(env.CARD_CACHE, state.data.id);
          await client.sendMessage(chatId, `${EMOJI.trash} Card deleted.`);
        } else {
          await client.sendMessage(
            chatId,
            `${EMOJI.cross} Card not found or already deleted.`,
          );
        }
      } catch (_e) {
        await client.sendMessage(
          chatId,
          `${EMOJI.cross} Failed to delete card.`,
        );
      }
    }
  } else {
    await client.sendMessage(chatId, `${EMOJI.cross} Deletion cancelled.`);
  }

  await clearState(env.CARD_CACHE, chatId);
  return true;
}
