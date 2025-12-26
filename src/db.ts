import { nanoid } from "nanoid";
import type { Card, CreateCard, UpdateCard } from "./schema";

export async function createCard(
  db: D1Database,
  card: CreateCard,
): Promise<Card> {
  const id = nanoid(10);
  const result = await db
    .prepare(
      `INSERT INTO cards (id, recipient, sender, occasion, title, thai_content, english_content, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       RETURNING *`,
    )
    .bind(
      id,
      card.recipient,
      card.sender,
      card.occasion,
      card.title,
      card.thai_content ?? null,
      card.english_content ?? null,
    )
    .first<Card>();

  if (!result) {
    throw new Error("Failed to create card");
  }

  return result;
}

export async function getCardById(
  db: D1Database,
  id: string,
): Promise<Card | null> {
  const result = await db
    .prepare(`SELECT * FROM cards WHERE id = ? AND is_active = 1`)
    .bind(id)
    .first<Card>();

  return result ?? null;
}

export async function listCards(db: D1Database): Promise<Card[]> {
  const cardsResult = await db
    .prepare(`SELECT * FROM cards WHERE is_active = 1 ORDER BY updated_at DESC`)
    .all<Card>();

  return cardsResult.results ?? [];
}

export async function updateCard(
  db: D1Database,
  id: string,
  updates: UpdateCard,
): Promise<Card | null> {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.recipient) {
    fields.push("recipient = ?");
    values.push(updates.recipient);
  }
  if (updates.sender) {
    fields.push("sender = ?");
    values.push(updates.sender);
  }
  if (updates.occasion) {
    fields.push("occasion = ?");
    values.push(updates.occasion);
  }
  if (updates.title) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.thai_content) {
    fields.push("thai_content = ?");
    values.push(updates.thai_content);
  }
  if (updates.english_content) {
    fields.push("english_content = ?");
    values.push(updates.english_content);
  }
  if (updates.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(updates.is_active);
  }

  const now = Math.floor(Date.now() / 1000);
  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  const result = await db
    .prepare(`UPDATE cards SET ${fields.join(", ")} WHERE id = ? RETURNING *`)
    .bind(...values)
    .first<Card>();

  return result ?? null;
}

export async function softDeleteCard(
  db: D1Database,
  id: string,
): Promise<Card | null> {
  return updateCard(db, id, { is_active: 0 });
}

export async function invalidateCardCache(kv: KVNamespace, cardId: string) {
  await kv.delete(`card:${cardId}`);
}
