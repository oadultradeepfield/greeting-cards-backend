import type { BotContext } from "..";
import { clearState, EMOJI, getState } from "../constants";

export function handleStart(ctx: BotContext) {
	ctx.reply(
		`${EMOJI.wave} Welcome to the Greeting Cards Bot! ${EMOJI.card}${EMOJI.sparkles}\n\n` +
			`I can help you manage your greeting cards with ease!\n\n` +
			`${EMOJI.rocket} Use /help to see all available commands.\n\n` +
			`Let's create some amazing cards! ${EMOJI.celebration}`,
	);
}

export function handleHelp(ctx: BotContext) {
	ctx.reply(
		`${EMOJI.star} *Greeting Cards Bot Help* ${EMOJI.star}\n\n` +
			`*Available Commands:*\n\n` +
			`${EMOJI.wave} /start - Start the bot\n` +
			`${EMOJI.question} /help - Show this help message\n\n` +
			`*Card Management:*\n` +
			`${EMOJI.pencil} /create - Create a new card\n` +
			`${EMOJI.list} /list - List all cards\n` +
			`${EMOJI.eyes} /view \\<id\\> - View card details\n` +
			`${EMOJI.pencil} /update \\<id\\> - Update a card\n` +
			`${EMOJI.trash} /delete \\<id\\> - Delete a card\n\n` +
			`${EMOJI.cross} /cancel - Cancel current operation\n\n` +
			`${EMOJI.info} *Tips:*\n` +
			`• Card IDs are 10 characters long\n` +
			`• Occasions can be: birthday ${EMOJI.birthday} or general ${EMOJI.gift}\n` +
			`• Cards need at least Thai ${EMOJI.thai} or English ${EMOJI.english} content`,
		{ parse_mode: "MarkdownV2" },
	);
}

export function handleCancel(ctx: BotContext) {
	const chatId = ctx.chat?.id.toString() || "";
	const state = getState(chatId);
	if (state.step === "idle") {
		ctx.reply(`${EMOJI.info} Nothing to cancel! You're not in any process.`);
		return;
	}
	clearState(chatId);
	ctx.reply(
		`${EMOJI.cross} Operation cancelled.\n\n` +
			`Use /help to see available commands ${EMOJI.question}`,
	);
}
