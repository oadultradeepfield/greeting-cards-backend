interface TelegramApiResponse<T = unknown> {
	ok: boolean;
	result?: T;
	description?: string;
	error_code?: number;
}

interface SendMessageOptions {
	parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
	disable_web_page_preview?: boolean;
	disable_notification?: boolean;
	reply_to_message_id?: number;
	reply_markup?: unknown;
}

export class TelegramClient {
	private baseUrl: string;

	constructor(token: string) {
		this.baseUrl = `https://api.telegram.org/bot${token}`;
	}

	async sendMessage(
		chatId: number | string,
		text: string,
		options: SendMessageOptions = {},
	): Promise<unknown> {
		return this.call("sendMessage", { chat_id: chatId, text, ...options });
	}

	async call<T = unknown>(
		method: string,
		body: Record<string, unknown>,
	): Promise<T | null> {
		try {
			const response = await fetch(`${this.baseUrl}/${method}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const data = (await response.json()) as TelegramApiResponse<T>;
			if (!data.ok) {
				console.error(`Telegram API Error (${method}):`, data);
				return null;
			}
			return data.result ?? null;
		} catch (e) {
			console.error(`Network Error (${method}):`, e);
			return null;
		}
	}
}
