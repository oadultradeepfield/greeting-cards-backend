import type { CreateCard } from "../schema";

export type ConversationStep =
	| "idle"
	| "create_recipient"
	| "create_sender"
	| "create_occasion"
	| "create_title"
	| "create_thai"
	| "create_english"
	| "create_confirm"
	| "update_select_field"
	| "update_value"
	| "delete_confirm";

export interface ConversationState {
	step: ConversationStep;
	data: Partial<CreateCard> & { id?: string; updateField?: string };
}

export async function getState(
	kv: KVNamespace,
	chatId: string,
): Promise<ConversationState> {
	const state = await kv.get<ConversationState>(`chat:${chatId}:state`, "json");
	return state || { step: "idle", data: {} };
}

export async function setState(
	kv: KVNamespace,
	chatId: string,
	state: ConversationState,
) {
	await kv.put(`chat:${chatId}:state`, JSON.stringify(state), {
		expirationTtl: 3600,
	});
}

export async function clearState(kv: KVNamespace, chatId: string) {
	await kv.delete(`chat:${chatId}:state`);
}
