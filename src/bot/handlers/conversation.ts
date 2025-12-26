import { EMOJI, occasionEmoji } from "../constants";
import { getState, setState, clearState } from "../constants";
import { createCard, updateCard, softDeleteCard } from "../../db";
import type { CreateCard, UpdateCard, Occasion } from "../../schema";
import { BotContext } from "..";

export async function handleTextMessage(ctx: BotContext) {
  const chatId = ctx.chat?.id.toString() || "";
  const state = getState(chatId);
  const text = ctx.message!.text!.trim();

  if (state.step === "idle") {
    await ctx.reply(
      `${EMOJI.question} I didn't understand that.\n\n` +
        `Use /help to see available commands! ${EMOJI.sparkles}`,
    );
    return;
  }

  if (state.step === "create_recipient") {
    state.data.recipient = text;
    state.step = "create_sender";
    setState(chatId, state);
    await ctx.reply(
      `${EMOJI.check} Recipient: *${text}*\n\n` +
        `${EMOJI.from} *Step 2/6:* Who is sending this card?\n\n` +
        `Please enter the *sender's name*:`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  if (state.step === "create_sender") {
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
    return;
  }

  if (state.step === "create_occasion") {
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
    return;
  }

  if (state.step === "create_title") {
    state.data.title = text;
    state.step = "create_thai";
    setState(chatId, state);
    await ctx.reply(
      `${EMOJI.check} Title: *${text}*\n\n` +
        `${EMOJI.thai} *Step 5/6:* Thai content (optional)\n\n` +
        `Enter the Thai message for the card, or type *skip* to skip:`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  if (state.step === "create_thai") {
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
    return;
  }

  if (state.step === "create_english") {
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

    const englishStatus =
      text.toLowerCase() === "skip" ? "Skipped" : `"${text}"`;

    await ctx.reply(
      `${EMOJI.check} English content: ${englishStatus}\n\n` +
        `${EMOJI.sparkles} *Review Your Card* ${EMOJI.sparkles}\n\n` +
        `${EMOJI.to} *To:* ${state.data.recipient}\n` +
        `${EMOJI.from} *From:* ${state.data.sender}\n` +
        `${occasionEmoji(state.data.occasion!)} *Occasion:* ${state.data.occasion}\n` +
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
    return;
  }

  if (state.step === "create_confirm") {
    const answer = text.toLowerCase();
    if (answer === "yes" || answer === "y") {
      try {
        const cardData: CreateCard = {
          recipient: state.data.recipient!,
          sender: state.data.sender!,
          occasion: state.data.occasion!,
          title: state.data.title!,
          thai_content: state.data.thai_content,
          english_content: state.data.english_content,
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
      } catch (error) {
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
    return;
  }

  if (state.step === "update_select_field") {
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
      return;
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
    return;
  }

  if (state.step === "update_value") {
    const field = state.data.updateField!;
    const id = state.data.id!;

    if (field === "occasion") {
      const occasion = text.toLowerCase();
      if (occasion !== "birthday" && occasion !== "general") {
        await ctx.reply(
          `${EMOJI.warning} Invalid occasion!\n\n` +
            `Please type *birthday* or *general*:`,
          { parse_mode: "Markdown" },
        );
        return;
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
          `${EMOJI.cross} *Update failed!*\n\n` + `Card may have been deleted.`,
          { parse_mode: "Markdown" },
        );
        return;
      }

      await ctx.reply(
        `${EMOJI.check} *Card Updated Successfully!* ${EMOJI.sparkles}\n\n` +
          `${EMOJI.pencil} Updated *${field}* to: ${text}\n\n` +
          `Use /view ${id} to see the full card ${EMOJI.eyes}`,
        { parse_mode: "Markdown" },
      );
    } catch (error) {
      clearState(chatId);
      await ctx.reply(
        `${EMOJI.warning} *Oops!* Failed to update card.\n` +
          `Please try again.`,
        { parse_mode: "Markdown" },
      );
    }
    return;
  }

  if (state.step === "delete_confirm") {
    const answer = text.toLowerCase();
    if (answer === "yes" || answer === "y") {
      try {
        const deleted = await softDeleteCard(ctx.env.CARD_DB, state.data.id!);
        clearState(chatId);

        if (!deleted) {
          await ctx.reply(
            `${EMOJI.cross} *Card not found!*\n\n` +
              `It may have already been deleted.`,
            { parse_mode: "Markdown" },
          );
          return;
        }

        await ctx.reply(
          `${EMOJI.trash} *Card Deleted!* ${EMOJI.check}\n\n` +
            `Deleted: *${deleted.title || deleted.id}*\n\n` +
            `Use /list to see remaining cards ${EMOJI.list}`,
          { parse_mode: "Markdown" },
        );
      } catch (error) {
        clearState(chatId);
        await ctx.reply(
          `${EMOJI.warning} *Oops!* Failed to delete card.\n` +
            `Please try again.`,
          { parse_mode: "Markdown" },
        );
      }
    } else if (answer === "no" || answer === "n") {
      clearState(chatId);
      await ctx.reply(
        `${EMOJI.check} Deletion cancelled.\n\n` +
          `Your card is safe! ${EMOJI.card}${EMOJI.sparkles}`,
      );
    } else {
      await ctx.reply(`${EMOJI.warning} Please reply *yes* or *no*:`, {
        parse_mode: "Markdown",
      });
    }
    return;
  }
}
