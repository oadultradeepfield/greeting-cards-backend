import type { BotContext } from "..";
import { EMOJI, occasionEmoji } from "../constants";
import { listCards, getCardById } from "../../db";

export async function handleList(ctx: BotContext) {
  try {
    const cards = await listCards(ctx.env.CARD_DB);
    if (cards.length === 0) {
      await ctx.reply(
        `${EMOJI.card} *No cards found!* ${EMOJI.card}\n\n` +
          `Your card collection is empty.\n` +
          `Use /create to make your first card! ${EMOJI.sparkles}`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const list = cards
      .map(
        (c, i) =>
          `${EMOJI.num} *${i + 1}.* ${occasionEmoji(c.occasion)} ${c.title || "Untitled"}\n` +
          `   ${EMOJI.to} To: ${c.recipient}\n` +
          `   ${EMOJI.tag} ID: \`${c.id}\``,
      )
      .join("\n\n");

    await ctx.reply(
      `${EMOJI.list} *Your Cards* (${cards.length} total) ${EMOJI.card}\n\n` +
        `${list}\n\n` +
        `${EMOJI.info} Use /view \\<id\\> to see details`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    await ctx.reply(
      `${EMOJI.warning} *Oops!* Failed to list cards.\n` +
        `Please try again later.`,
      { parse_mode: "Markdown" },
    );
  }
}

export async function handleView(ctx: BotContext) {
  const id = ctx.match?.toString().trim();
  if (!id || id.length !== 10) {
    await ctx.reply(
      `${EMOJI.warning} *Invalid Usage*\n\n` +
        `Please provide a valid 10-character card ID:\n` +
        `/view \\<card\\-id\\>\n\n` +
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

    const msg =
      `${EMOJI.card} *Card Details* ${EMOJI.sparkles}\n\n` +
      `${EMOJI.tag} *ID:* \`${card.id}\`\n` +
      `${occasionEmoji(card.occasion)} *Occasion:* ${card.occasion}\n` +
      `${EMOJI.star} *Title:* ${card.title || "Untitled"}\n\n` +
      `${EMOJI.from} *From:* ${card.sender}\n` +
      `${EMOJI.to} *To:* ${card.recipient}\n\n` +
      (card.thai_content
        ? `${EMOJI.thai} *Thai Content:*\n${card.thai_content}\n\n`
        : "") +
      (card.english_content
        ? `${EMOJI.english} *English Content:*\n${card.english_content}\n\n`
        : "") +
      `${EMOJI.clock} *Created:* ${card.created_at}\n` +
      `${EMOJI.pencil} *Updated:* ${card.updated_at}`;

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (error) {
    await ctx.reply(
      `${EMOJI.warning} *Oops!* Failed to fetch card.\n` +
        `Please try again later.`,
      { parse_mode: "Markdown" },
    );
  }
}
