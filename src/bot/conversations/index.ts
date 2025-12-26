import type { ConversationState } from "../state";
import type { TelegramClient } from "../telegram";
import { handleCreateConversation } from "./create";
import { handleDeleteConversation } from "./delete";
import type { ConversationContext } from "./types";
import { handleUpdateConversation } from "./update";

export async function handleConversation(
  client: TelegramClient,
  env: Env,
  chatId: string,
  text: string,
  state: ConversationState,
): Promise<void> {
  const ctx: ConversationContext = { client, env, chatId, text, state };

  if (await handleDeleteConversation(ctx)) {
    return;
  }

  if (await handleUpdateConversation(ctx)) {
    return;
  }

  if (await handleCreateConversation(ctx)) {
    return;
  }
}

export type { ConversationContext, ConversationHandler } from "./types";
