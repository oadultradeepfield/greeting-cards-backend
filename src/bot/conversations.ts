import { createCard, softDeleteCard } from "../db";
import type { CreateCard } from "../schema";
import { EMOJI } from "./constants";
import { type ConversationState, clearState, setState } from "./state";
import type { TelegramClient } from "./telegram";

export async function handleConversation(
	client: TelegramClient,
	env: Env,
	chatId: string,
	text: string,
	state: ConversationState,
) {
	if (state.step === "delete_confirm") {
		if (text.toLowerCase() === "yes") {
			if (state.data.id) {
				await softDeleteCard(env.CARD_DB, state.data.id);
				await client.sendMessage(chatId, `${EMOJI.trash} Card deleted.`);
			}
		} else {
			await client.sendMessage(chatId, `${EMOJI.cross} Deletion cancelled.`);
		}
		await clearState(env.CARD_CACHE, chatId);
		return;
	}

	if (state.step === "create_recipient") {
		state.data.recipient = text;
		state.step = "create_sender";
		await setState(env.CARD_CACHE, chatId, state);
		await client.sendMessage(
			chatId,
			`${EMOJI.to} Recipient: ${text}\n\n${EMOJI.from} Who is sending this?`,
		);
		return;
	}

	if (state.step === "create_sender") {
		state.data.sender = text;
		state.step = "create_occasion";
		await setState(env.CARD_CACHE, chatId, state);
		await client.sendMessage(
			chatId,
			`${EMOJI.check} Sender: ${text}\n\n${EMOJI.gift} Occasion? (birthday/general)`,
		);
		return;
	}

	if (state.step === "create_occasion") {
		const occasion = text.toLowerCase();
		if (occasion !== "birthday" && occasion !== "general") {
			await client.sendMessage(
				chatId,
				`${EMOJI.warning} Please type 'birthday' or 'general'.`,
			);
			return;
		}
		state.data.occasion = occasion;
		state.step = "create_title";
		await setState(env.CARD_CACHE, chatId, state);
		await client.sendMessage(
			chatId,
			`${EMOJI.check} Occasion: ${occasion}\n\n${EMOJI.tag} Card Title?`,
		);
		return;
	}

	if (state.step === "create_title") {
		state.data.title = text;
		state.step = "create_thai";
		await setState(env.CARD_CACHE, chatId, state);
		await client.sendMessage(
			chatId,
			`${EMOJI.check} Title: ${text}\n\n${EMOJI.thai} Thai content? (type 'skip' to skip)`,
		);
		return;
	}

	if (state.step === "create_thai") {
		if (text.toLowerCase() !== "skip") state.data.thai_content = text;
		state.step = "create_english";
		await setState(env.CARD_CACHE, chatId, state);
		await client.sendMessage(
			chatId,
			`${EMOJI.check} Thai: ${text}\n\n${EMOJI.english} English content? (type 'skip' to skip)`,
		);
		return;
	}

	if (state.step === "create_english") {
		if (text.toLowerCase() !== "skip") state.data.english_content = text;

		if (!state.data.thai_content && !state.data.english_content) {
			await client.sendMessage(
				chatId,
				`${EMOJI.warning} You must provide at least one language! Try again.`,
			);
			return;
		}

		state.step = "create_confirm";
		await setState(env.CARD_CACHE, chatId, state);

		const summary =
			`Recipient: ${state.data.recipient}\n` +
			`Sender: ${state.data.sender}\n` +
			`Occasion: ${state.data.occasion}\n` +
			`Title: ${state.data.title}\n` +
			`Thai: ${state.data.thai_content || "-"}\n` +
			`English: ${state.data.english_content || "-"}`;

		await client.sendMessage(
			chatId,
			`${EMOJI.sparkles} Review:\n\n${summary}\n\nReply 'yes' to create.`,
		);
		return;
	}

	if (state.step === "create_confirm") {
		if (text.toLowerCase() === "yes") {
			try {
				const card = await createCard(env.CARD_DB, state.data as CreateCard);
				await client.sendMessage(
					chatId,
					`${EMOJI.celebration} Card Created! ID: \`${card.id}\``,
					{ parse_mode: "Markdown" },
				);
			} catch (_e) {
				await client.sendMessage(
					chatId,
					`${EMOJI.cross} Failed to create card.`,
				);
			}
		} else {
			await client.sendMessage(chatId, `${EMOJI.cross} Cancelled.`);
		}
		await clearState(env.CARD_CACHE, chatId);
		return;
	}
}
