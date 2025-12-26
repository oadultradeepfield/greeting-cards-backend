import type { BotContext } from "..";
import { EMOJI, setState } from "../constants";

export function handleCreate(ctx: BotContext) {
	const chatId = ctx.chat?.id.toString() || "";
	setState(chatId, { step: "create_recipient", data: {} });
	ctx.reply(
		`${EMOJI.sparkles} *Let's create a new greeting card!* ${EMOJI.card}\n\n` +
			`${EMOJI.to} *Step 1/6:* Who is this card for?\n\n` +
			`Please enter the *recipient's name*:\n\n` +
			`${EMOJI.info} _Type /cancel to abort_`,
		{ parse_mode: "Markdown" },
	);
}
