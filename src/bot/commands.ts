import { getCardById, listCards } from "../db";
import { EMOJI, occasionEmoji } from "./constants";
import { clearState, setState } from "./state";
import type { TelegramClient } from "./telegram";

export async function handleStart(
	client: TelegramClient,
	chatId: string,
	env: Env,
) {
	await clearState(env.CARD_CACHE, chatId);
	await client.sendMessage(
		chatId,
		`${EMOJI.wave} *Welcome to Oad's Greeting Cards!* ${EMOJI.sparkles}\n\n` +
			`I can help you create and manage digital greeting cards.\n\n` +
			`Type /help to see what I can do!`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleHelp(client: TelegramClient, chatId: string) {
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

export async function handleList(
	client: TelegramClient,
	chatId: string,
	env: Env,
) {
	const cards = await listCards(env.CARD_DB);
	if (cards.length === 0) {
		await client.sendMessage(
			chatId,
			`${EMOJI.info} No cards found. Create one with /create!`,
		);
		return;
	}

	let message = `${EMOJI.list} *Your Cards:*\n\n`;
	for (const card of cards.slice(0, 10)) {
		message += `• \`${card.id}\`: ${card.title} ${occasionEmoji(card.occasion)}\n`;
	}

	await client.sendMessage(chatId, message, { parse_mode: "Markdown" });
}

export async function handleView(
	client: TelegramClient,
	chatId: string,
	text: string,
	env: Env,
) {
	const parts = text.split(" ");
	if (parts.length < 2) {
		await client.sendMessage(chatId, `${EMOJI.warning} Usage: /view [card_id]`);
		return;
	}
	const id = parts[1];
	const card = await getCardById(env.CARD_DB, id);

	if (!card) {
		await client.sendMessage(chatId, `${EMOJI.cross} Card not found.`);
		return;
	}

	await client.sendMessage(
		chatId,
		`${EMOJI.card} *Card Details*\n\n` +
			`ID: \`${card.id}\`\n` +
			`Title: *${card.title}*\n` +
			`To: ${card.recipient}\n` +
			`From: ${card.sender}\n` +
			`Occasion: ${card.occasion} ${occasionEmoji(card.occasion)}\n` +
			`Thai: ${card.thai_content || "-"}\n` +
			`English: ${card.english_content || "-"}\n\n` +
			`Link: ${env.FRONTEND_URL}/cards/${card.id}`,
		{ parse_mode: "Markdown" },
	);
}

export async function handleDelete(
	client: TelegramClient,
	chatId: string,
	text: string,
	env: Env,
) {
	const parts = text.split(" ");
	if (parts.length < 2) {
		await client.sendMessage(
			chatId,
			`${EMOJI.warning} Usage: /delete [card_id]`,
		);
		return;
	}
	const id = parts[1];
	const card = await getCardById(env.CARD_DB, id);

	if (!card) {
		await client.sendMessage(chatId, `${EMOJI.cross} Card not found.`);
		return;
	}

	await setState(env.CARD_CACHE, chatId, {
		step: "delete_confirm",
		data: { id },
	});
	await client.sendMessage(
		chatId,
		`${EMOJI.warning} Are you sure you want to delete *${card.title}*?\n\nReply *yes* to confirm.`,
		{ parse_mode: "Markdown" },
	);
}
