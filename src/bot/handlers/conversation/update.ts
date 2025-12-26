import { updateCard } from "../../../db";
import type { Occasion, UpdateCard } from "../../../schema";
import type { BotContext } from "../..";
import {
	type ConversationState,
	clearState,
	EMOJI,
	setState,
} from "../../constants";

export async function handleUpdateSelectField(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<boolean> {
	if (state.step !== "update_select_field") {
		return false;
	}

	const field = text.toLowerCase();
	const validFields = [
		"recipient",
		"sender",
		"occasion",
		"title",
		"thai",
		"english",
	];
	if (!validFields.includes(field)) {
		await ctx.reply(
			`${EMOJI.warning} Invalid field!\n\n` +
				`Please choose from: recipient, sender, occasion, title, thai, english`,
		);
		return true;
	}
	state.data.updateField = field;
	state.step = "update_value";
	setState(chatId, state);

	let prompt = "";
	switch (field) {
		case "recipient":
			prompt = `${EMOJI.to} Enter the new *recipient* name:`;
			break;
		case "sender":
			prompt = `${EMOJI.from} Enter the new *sender* name:`;
			break;
		case "occasion":
			prompt = `${EMOJI.gift} Enter the new *occasion* (birthday/general):`;
			break;
		case "title":
			prompt = `${EMOJI.tag} Enter the new *title*:`;
			break;
		case "thai":
			prompt = `${EMOJI.thai} Enter the new *Thai content*:`;
			break;
		case "english":
			prompt = `${EMOJI.english} Enter the new *English content*:`;
			break;
	}
	await ctx.reply(prompt, { parse_mode: "Markdown" });
	return true;
}

export async function handleUpdateValue(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<boolean> {
	if (state.step !== "update_value") {
		return false;
	}

	const field = state.data.updateField;
	const id = state.data.id;

	if (!field || !id) {
		clearState(chatId);
		await ctx.reply(
			`${EMOJI.warning} *Oops!* Missing update context.\n` +
				`Please try again with /update`,
			{ parse_mode: "Markdown" },
		);
		return true;
	}

	if (field === "occasion") {
		const occasion = text.toLowerCase();
		if (occasion !== "birthday" && occasion !== "general") {
			await ctx.reply(
				`${EMOJI.warning} Invalid occasion!\n\n` +
					`Please type *birthday* or *general*:`,
				{ parse_mode: "Markdown" },
			);
			return true;
		}
	}

	try {
		const updates: UpdateCard = {};
		switch (field) {
			case "recipient":
				updates.recipient = text;
				break;
			case "sender":
				updates.sender = text;
				break;
			case "occasion":
				updates.occasion = text.toLowerCase() as Occasion;
				break;
			case "title":
				updates.title = text;
				break;
			case "thai":
				updates.thai_content = text;
				break;
			case "english":
				updates.english_content = text;
				break;
		}

		const updated = await updateCard(ctx.env.CARD_DB, id, updates);
		clearState(chatId);

		if (!updated) {
			await ctx.reply(
				`${EMOJI.cross} *Update failed!*\n\nCard may have been deleted.`,
				{ parse_mode: "Markdown" },
			);
			return true;
		}

		await ctx.reply(
			`${EMOJI.check} *Card Updated Successfully!* ${EMOJI.sparkles}\n\n` +
				`${EMOJI.pencil} Updated *${field}* to: ${text}\n\n` +
				`Use /view ${id} to see the full card ${EMOJI.eyes}`,
			{ parse_mode: "Markdown" },
		);
	} catch (_error) {
		clearState(chatId);
		await ctx.reply(
			`${EMOJI.warning} *Oops!* Failed to update card.\nPlease try again.`,
			{ parse_mode: "Markdown" },
		);
	}
	return true;
}
