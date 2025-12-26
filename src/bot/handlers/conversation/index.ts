import type { BotContext } from "../..";
import { EMOJI, getState } from "../../constants";
import {
	handleCreateConfirm,
	handleCreateEnglish,
	handleCreateOccasion,
	handleCreateRecipient,
	handleCreateSender,
	handleCreateThai,
	handleCreateTitle,
} from "./create";
import { handleDeleteConversation } from "./delete";
import { handleUpdateSelectField, handleUpdateValue } from "./update";

export async function handleTextMessage(ctx: BotContext) {
	const chatId = ctx.chat?.id.toString() || "";
	const state = getState(chatId);
	const text = ctx.message?.text?.trim() || "";

	if (state.step === "idle") {
		await ctx.reply(
			`${EMOJI.question} I didn't understand that.\n\n` +
				`Use /help to see available commands! ${EMOJI.sparkles}`,
		);
		return;
	}

	if (state.step === "create_recipient") {
		await handleCreateRecipient(ctx, chatId, state, text);
		return;
	}

	if (state.step === "create_sender") {
		await handleCreateSender(ctx, chatId, state, text);
		return;
	}

	if (state.step === "create_occasion") {
		await handleCreateOccasion(ctx, chatId, state, text);
		return;
	}

	if (state.step === "create_title") {
		await handleCreateTitle(ctx, chatId, state, text);
		return;
	}

	if (state.step === "create_thai") {
		await handleCreateThai(ctx, chatId, state, text);
		return;
	}

	if (state.step === "create_english") {
		await handleCreateEnglish(ctx, chatId, state, text);
		return;
	}

	if (state.step === "create_confirm") {
		await handleCreateConfirm(ctx, chatId, state, text);
		return;
	}

	if (await handleUpdateSelectField(ctx, chatId, state, text)) {
		return;
	}

	if (await handleUpdateValue(ctx, chatId, state, text)) {
		return;
	}

	if (await handleDeleteConversation(ctx, chatId, state, text)) {
		return;
	}
}

export {
	handleCreateConfirm,
	handleCreateEnglish,
	handleCreateOccasion,
	handleCreateRecipient,
	handleCreateSender,
	handleCreateThai,
	handleCreateTitle,
} from "./create";
export { handleDeleteConversation } from "./delete";
export { handleUpdateSelectField, handleUpdateValue } from "./update";
