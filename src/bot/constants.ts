import type { CreateCard } from "../schema";

export const EMOJI = {
  wave: "👋",
  card: "💌",
  sparkles: "✨",
  gift: "🎁",
  birthday: "🎂",
  check: "✅",
  cross: "❌",
  pencil: "✏️",
  trash: "🗑️",
  eyes: "👀",
  list: "📋",
  from: "📤",
  to: "📥",
  tag: "🏷️",
  thai: "🇹🇭",
  english: "🇬🇧",
  question: "❓",
  warning: "⚠️",
  celebration: "🎉",
  rocket: "🚀",
  info: "ℹ️",
  star: "⭐",
  clock: "🕐",
  num: "🔢",
} as const;

export function occasionEmoji(occasion: string): string {
  return occasion === "birthday" ? EMOJI.birthday : EMOJI.gift;
}

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

const conversations = new Map<string, ConversationState>();

export function getState(chatId: string): ConversationState {
  return conversations.get(chatId) || { step: "idle", data: {} };
}

export function setState(chatId: string, state: ConversationState) {
  conversations.set(chatId, state);
}

export function clearState(chatId: string) {
  conversations.delete(chatId);
}
