import type { BotContext } from "..";
import { EMOJI } from "../constants";
import { setState } from "../constants";
import { getCardById } from "../../db";

export async function handleDelete(ctx: BotContext) {
  const id = ctx.match?.toString().trim();
  if (!id || id.length !== 10) {
    await ctx.reply(
      `${EMOJI.warning} *Invalid Usage*\n\n` +
        `Please provide a valid 10-character card ID:\n` +
        `/delete \\<card\\-id\\>\n\n` +
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
    setState(chatId, { step: "delete_confirm", data: { id } });

    await ctx.reply(
      `${EMOJI.trash} *Delete Card?* ${EMOJI.warning}\n\n` +
        `You are about to delete:\n\n` +
        `${EMOJI.card} *${card.title || "Untitled"}*\n` +
        `${EMOJI.to} To: ${card.recipient}\n` +
        `${EMOJI.from} From: ${card.sender}\n\n` +
        `⚠️ *This action cannot be undone!*\n\n` +
        `Reply *yes* to confirm or *no* to cancel.`,
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
