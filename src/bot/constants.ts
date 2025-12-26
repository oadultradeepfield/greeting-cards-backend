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
	warning: "⚠️",
	celebration: "🎉",
	info: "ℹ️",
} as const;

export function occasionEmoji(occasion: string): string {
	return occasion === "birthday" ? EMOJI.birthday : EMOJI.gift;
}
