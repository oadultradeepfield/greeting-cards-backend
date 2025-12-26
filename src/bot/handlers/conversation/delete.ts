import { softDeleteCard } from "../../../db";
import type { BotContext } from "../..";
import { type ConversationState, clearState, EMOJI } from "../../constants";

export async function handleDeleteConversation(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<boolean> {
	if (state.step !== "delete_confirm") {
		return false;
	}

	const answer = text.toLowerCase();
	const id = state.data.id;

	if (!id) {
		clearState(chatId);
		await ctx.reply(
			`${EMOJI.warning} *Oops!* Missing card ID.\n` +
				`Please try again with /delete`,
			{ parse_mode: "Markdown" },
		);
		return true;
	}

	if (answer === "yes" || answer === "y") {
		try {
			const deleted = await softDeleteCard(ctx.env.CARD_DB, id);
			clearState(chatId);

			if (!deleted) {
				await ctx.reply(
					`${EMOJI.cross} *Card not found!*\n\n` +
						`It may have already been deleted.`,
					{ parse_mode: "Markdown" },
				);
				return true;
			}

			await ctx.reply(
				`${EMOJI.trash} *Card Deleted!* ${EMOJI.check}\n\n` +
					`Deleted: *${deleted.title || deleted.id}*\n\n` +
					`Use /list to see remaining cards ${EMOJI.list}`,
				{ parse_mode: "Markdown" },
			);
		} catch (_error) {
			clearState(chatId);
			await ctx.reply(
				`${EMOJI.warning} *Oops!* Failed to delete card.\n` +
					`Please try again.`,
				{ parse_mode: "Markdown" },
			);
		}
	} else if (answer === "no" || answer === "n") {
		clearState(chatId);
		await ctx.reply(
			`${EMOJI.check} Deletion cancelled.\n\n` +
				`Your card is safe! ${EMOJI.card}${EMOJI.sparkles}`,
		);
	} else {
		await ctx.reply(`${EMOJI.warning} Please reply *yes* or *no*:`, {
			parse_mode: "Markdown",
		});
	}

	return true;
}
