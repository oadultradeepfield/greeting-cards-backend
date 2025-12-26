import type { TelegramClient } from "../telegram";

export interface CommandContext {
  client: TelegramClient;
  chatId: string;
  text: string;
  env: Env;
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>;
