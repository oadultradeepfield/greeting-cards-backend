import { EMOJI } from "../constants";
import type { CommandContext } from "./types";

export async function handleHelp(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  await client.sendMessage(
    chatId,
    `${EMOJI.list} *Available Commands:*\n\n` +
      `/create - Create a new card ${EMOJI.pencil}\n` +
      `/list - List your cards ${EMOJI.list}\n` +
      `/view [id] - View a card ${EMOJI.eyes}\n` +
      `/update [id] - Update a card ${EMOJI.pencil}\n` +
      `/delete [id] - Delete a card ${EMOJI.trash}\n` +
      `/cancel - Cancel current action ${EMOJI.cross}`,
    { parse_mode: "Markdown" },
  );
}
