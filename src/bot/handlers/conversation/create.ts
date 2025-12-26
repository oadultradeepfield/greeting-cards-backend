import { createCard } from "../../../db";
import type { CreateCard, Occasion } from "../../../schema";
import type { BotContext } from "../..";
import {
	type ConversationState,
	clearState,
	EMOJI,
	occasionEmoji,
	setState,
} from "../../constants";

export async function handleCreateRecipient(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<void> {
	state.data.recipient = text;
	state.step = "create_sender";
	setState(chatId, state);
	await ctx.reply(
		`${EMOJI.check} Recipient: *${text}*\n\n` +
			`${EMOJI.from} *Step 2/6:* Who is sending this card?\n\n` +
			`Please enter the *sender's name*:`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleCreateSender(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<void> {
	state.data.sender = text;
	state.step = "create_occasion";
	setState(chatId, state);
	await ctx.reply(
		`${EMOJI.check} Sender: *${text}*\n\n` +
			`${EMOJI.gift} *Step 3/6:* What's the occasion?\n\n` +
			`Choose one:\n` +
			`• *birthday* ${EMOJI.birthday} - For birthday celebrations\n` +
			`• *general* ${EMOJI.gift} - For any other occasion\n\n` +
			`Please type *birthday* or *general*:`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleCreateOccasion(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<void> {
	const occasion = text.toLowerCase();
	if (occasion !== "birthday" && occasion !== "general") {
		await ctx.reply(
			`${EMOJI.warning} Invalid occasion!\n\n` +
				`Please type *birthday* or *general*:`,
			{ parse_mode: "Markdown" },
		);
		return;
	}
	state.data.occasion = occasion as Occasion;
	state.step = "create_title";
	setState(chatId, state);
	await ctx.reply(
		`${EMOJI.check} Occasion: *${occasion}* ${occasionEmoji(occasion)}\n\n` +
			`${EMOJI.tag} *Step 4/6:* Give your card a title!\n\n` +
			`Please enter the *card title*:`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleCreateTitle(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<void> {
	state.data.title = text;
	state.step = "create_thai";
	setState(chatId, state);
	await ctx.reply(
		`${EMOJI.check} Title: *${text}*\n\n` +
			`${EMOJI.thai} *Step 5/6:* Thai content (optional)\n\n` +
			`Enter the Thai message for the card, or type *skip* to skip:`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleCreateThai(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<void> {
	if (text.toLowerCase() !== "skip") {
		state.data.thai_content = text;
	}
	state.step = "create_english";
	setState(chatId, state);
	const thaiStatus = text.toLowerCase() === "skip" ? "Skipped" : `"${text}"`;
	await ctx.reply(
		`${EMOJI.check} Thai content: ${thaiStatus}\n\n` +
			`${EMOJI.english} *Step 6/6:* English content ${state.data.thai_content ? "(optional)" : "(required)"}\n\n` +
			`Enter the English message for the card${state.data.thai_content ? ", or type *skip* to skip" : ""}:`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleCreateEnglish(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<void> {
	if (text.toLowerCase() !== "skip" || !state.data.thai_content) {
		if (text.toLowerCase() === "skip" && !state.data.thai_content) {
			await ctx.reply(
				`${EMOJI.warning} You must provide at least Thai or English content!\n\n` +
					`Please enter the English message:`,
			);
			return;
		}
		if (text.toLowerCase() !== "skip") {
			state.data.english_content = text;
		}
	}
	state.step = "create_confirm";
	setState(chatId, state);

	const englishStatus = text.toLowerCase() === "skip" ? "Skipped" : `"${text}"`;

	const occasion = state.data.occasion ?? "general";

	await ctx.reply(
		`${EMOJI.check} English content: ${englishStatus}\n\n` +
			`${EMOJI.sparkles} *Review Your Card* ${EMOJI.sparkles}\n\n` +
			`${EMOJI.to} *To:* ${state.data.recipient}\n` +
			`${EMOJI.from} *From:* ${state.data.sender}\n` +
			`${occasionEmoji(occasion)} *Occasion:* ${occasion}\n` +
			`${EMOJI.tag} *Title:* ${state.data.title}\n` +
			(state.data.thai_content
				? `${EMOJI.thai} *Thai:* ${state.data.thai_content}\n`
				: "") +
			(state.data.english_content
				? `${EMOJI.english} *English:* ${state.data.english_content}\n`
				: "") +
			`\n${EMOJI.question} *Create this card?*\n\n` +
			`Reply *yes* to create or *no* to cancel.`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleCreateConfirm(
	ctx: BotContext,
	chatId: string,
	state: ConversationState,
	text: string,
): Promise<void> {
	const answer = text.toLowerCase();
	if (answer === "yes" || answer === "y") {
		const {
			recipient,
			sender,
			occasion,
			title,
			thai_content,
			english_content,
		} = state.data;

		if (!recipient || !sender || !occasion || !title) {
			clearState(chatId);
			await ctx.reply(
				`${EMOJI.warning} *Oops!* Missing required card data.\n` +
					`Please try again with /create`,
				{ parse_mode: "Markdown" },
			);
			return;
		}

		try {
			const cardData: CreateCard = {
				recipient,
				sender,
				occasion,
				title,
				thai_content,
				english_content,
			};
			const card = await createCard(ctx.env.CARD_DB, cardData);
			clearState(chatId);
			await ctx.reply(
				`${EMOJI.celebration} *Card Created Successfully!* ${EMOJI.celebration}\n\n` +
					`${EMOJI.card} Your new card is ready!\n\n` +
					`${EMOJI.tag} *ID:* \`${card.id}\`\n` +
					`${EMOJI.star} *Title:* ${card.title}\n\n` +
					`Use /view ${card.id} to see the full details ${EMOJI.eyes}`,
				{ parse_mode: "Markdown" },
			);
		} catch (_error) {
			clearState(chatId);
			await ctx.reply(
				`${EMOJI.warning} *Oops!* Failed to create card.\n` +
					`Please try again with /create`,
				{ parse_mode: "Markdown" },
			);
		}
	} else if (answer === "no" || answer === "n") {
		clearState(chatId);
		await ctx.reply(
			`${EMOJI.cross} Card creation cancelled.\n\n` +
				`Use /create to start over ${EMOJI.sparkles}`,
		);
	} else {
		await ctx.reply(`${EMOJI.warning} Please reply *yes* or *no*:`, {
			parse_mode: "Markdown",
		});
	}
}
