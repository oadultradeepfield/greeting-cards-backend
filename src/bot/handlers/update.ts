import type { BotContext } from "..";
import { EMOJI } from "../constants";
import { setState } from "../constants";
import { getCardById } from "../../db";

export async function handleUpdate(ctx: BotContext) {
  const id = ctx.match?.toString().trim();
  if (!id || id.length !== 10) {
    await ctx.reply(
      `${EMOJI.warning} *Invalid Usage*\n\n` +
        `Please provide a valid 10-character card ID:\n` +
        `/update \\<card\\-id\\>\n\n` +
        `${EMOJI.info} Use /list to see all card IDs`,
      { parse_mode: "MarkdownV2" },
    );
    return;
  }

  try {
    const card = await getCardById(ctx.env.CARD_DB, id);
    if (!card) {
      await ctx.reply(
        `${EMOJI.cross} *Card not found!*\n\n` +
          `No card with ID \`${id}\` exists.\n` +
          `Use /list to see available cards.`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const chatId = ctx.chat?.id.toString() || "";
    setState(chatId, { step: "update_select_field", data: { id } });

    await ctx.reply(
      `${EMOJI.pencil} *Update Card* ${EMOJI.sparkles}\n\n` +
        `Card: *${card.title || "Untitled"}* (${card.id})\n\n` +
        `Which field would you like to update?\n\n` +
        `1️⃣ recipient - Who the card is for\n` +
        `2️⃣ sender - Who the card is from\n` +
        `3️⃣ occasion - birthday/general\n` +
        `4️⃣ title - Card title\n` +
        `5️⃣ thai - Thai content\n` +
        `6️⃣ english - English content\n\n` +
        `${EMOJI.info} _Reply with the field name (e.g., "title")_\n` +
        `${EMOJI.cross} _Type /cancel to abort_`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    await ctx.reply(
      `${EMOJI.warning} *Oops!* Failed to fetch card.\n` +
        `Please try again later.`,
      { parse_mode: "Markdown" },
    );
  }
}
