import { z } from "zod";

export const OccasionSchema = z.enum(["birthday", "general"]);

const cardFields = {
  id: z.string().length(10),
  recipient: z.string().min(1),
  sender: z.string().min(1),
  occasion: OccasionSchema,
  title: z.string().min(1),
  thai_content: z.string().min(1).nullable().optional(),
  english_content: z.string().min(1).nullable().optional(),
  is_active: z.number().int().min(0).max(1),
  views: z.number().min(0).default(0),
  created_at: z.number(),
  updated_at: z.number(),
};

export const CardSchema = z.object(cardFields);

export const ViewCardSchema = CardSchema.pick({
  recipient: true,
  sender: true,
  occasion: true,
  title: true,
  thai_content: true,
  english_content: true,
});

export const CreateCardSchema = z
  .object({
    recipient: cardFields.recipient,
    sender: cardFields.sender,
    occasion: cardFields.occasion,
    title: cardFields.title,
    thai_content: cardFields.thai_content,
    english_content: cardFields.english_content,
  })
  .refine((data) => data.thai_content || data.english_content, {
    message: "At least one of thai_content or english_content must be provided",
  });

export const UpdateCardSchema = z
  .object({
    recipient: cardFields.recipient.optional(),
    sender: cardFields.sender.optional(),
    occasion: cardFields.occasion.optional(),
    title: cardFields.title.optional(),
    thai_content: cardFields.thai_content,
    english_content: cardFields.english_content,
    is_active: cardFields.is_active.optional(),
  })
  .refine(
    (data) =>
      data.thai_content !== undefined ||
      data.english_content !== undefined ||
      Object.keys(data).length > 0,
    { message: "At least one field must be updated" },
  );

export const CardListSchema = z.array(CardSchema);

export type Card = z.infer<typeof CardSchema>;
export type CreateCard = z.infer<typeof CreateCardSchema>;
export type UpdateCard = z.infer<typeof UpdateCardSchema>;
export type Occasion = z.infer<typeof OccasionSchema>;
