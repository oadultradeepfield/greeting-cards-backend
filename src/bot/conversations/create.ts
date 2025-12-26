import { createCard, invalidateCardCache } from "../../db";
import type { CreateCard } from "../../schema";
import { EMOJI } from "../constants";
import { clearState, setState } from "../state";
import type { ConversationContext } from "./types";

async function handleRecipient(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "create_recipient") {
    return false;
  }

  state.data.recipient = text;
  state.step = "create_sender";
  await setState(env.CARD_CACHE, chatId, state);
  await client.sendMessage(
    chatId,
    `${EMOJI.to} Recipient: ${text}\n\n${EMOJI.from} Who is sending this?`,
  );

  return true;
}

async function handleSender(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "create_sender") {
    return false;
  }

  state.data.sender = text;
  state.step = "create_occasion";
  await setState(env.CARD_CACHE, chatId, state);
  await client.sendMessage(
    chatId,
    `${EMOJI.from} Sender: ${text}\n\n${EMOJI.gift} Occasion? (birthday/general)`,
  );

  return true;
}

async function handleOccasion(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "create_occasion") {
    return false;
  }

  const occasion = text.toLowerCase();
  if (occasion !== "birthday" && occasion !== "general") {
    await client.sendMessage(
      chatId,
      `${EMOJI.warning} Please type 'birthday' or 'general'.`,
    );
    return true;
  }

  state.data.occasion = occasion;
  state.step = "create_title";
  await setState(env.CARD_CACHE, chatId, state);
  await client.sendMessage(
    chatId,
    `${EMOJI.gift} Occasion: ${occasion}\n\n${EMOJI.tag} Card Title?`,
  );

  return true;
}

async function handleTitle(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "create_title") {
    return false;
  }

  state.data.title = text;
  state.step = "create_thai";
  await setState(env.CARD_CACHE, chatId, state);
  await client.sendMessage(
    chatId,
    `${EMOJI.tag} Title: ${text}\n\n${EMOJI.thai} Thai content? (type 'skip' to skip)`,
  );

  return true;
}

async function handleThai(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "create_thai") {
    return false;
  }

  if (text.toLowerCase() !== "skip") {
    state.data.thai_content = text;
  }
  state.step = "create_english";
  await setState(env.CARD_CACHE, chatId, state);
  await client.sendMessage(
    chatId,
    `${EMOJI.thai} Thai: ${text}\n\n${EMOJI.english} English content? (type 'skip' to skip)`,
  );

  return true;
}

async function handleEnglish(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "create_english") {
    return false;
  }

  if (text.toLowerCase() !== "skip") {
    state.data.english_content = text;
  }

  if (!state.data.thai_content && !state.data.english_content) {
    await client.sendMessage(
      chatId,
      `${EMOJI.english} You must provide at least one language! Try again.`,
    );
    return true;
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

  return true;
}

async function handleConfirm(ctx: ConversationContext): Promise<boolean> {
  const { client, env, chatId, text, state } = ctx;

  if (state.step !== "create_confirm") {
    return false;
  }

  if (text.toLowerCase() === "yes") {
    try {
      const card = await createCard(env.CARD_DB, state.data as CreateCard);
      await invalidateCardCache(env.CARD_CACHE, card.id);
      await client.sendMessage(
        chatId,
        `${EMOJI.celebration} Card Created! ID: \`${card.id}\``,
        { parse_mode: "Markdown" },
      );
    } catch (_e) {
      await client.sendMessage(chatId, `${EMOJI.cross} Failed to create card.`);
    }
  } else {
    await client.sendMessage(chatId, `${EMOJI.cross} Cancelled.`);
  }

  await clearState(env.CARD_CACHE, chatId);
  return true;
}

export async function handleCreateConversation(
  ctx: ConversationContext,
): Promise<boolean> {
  const handlers = [
    handleRecipient,
    handleSender,
    handleOccasion,
    handleTitle,
    handleThai,
    handleEnglish,
    handleConfirm,
  ];

  for (const handler of handlers) {
    if (await handler(ctx)) {
      return true;
    }
  }

  return false;
}
