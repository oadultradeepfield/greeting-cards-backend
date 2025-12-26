import type { ConversationState } from "../state";
import type { TelegramClient } from "../telegram";

export interface ConversationContext {
  client: TelegramClient;
  env: Env;
  chatId: string;
  text: string;
  state: ConversationState;
}

export type ConversationHandler = (
  ctx: ConversationContext,
) => Promise<boolean>;
