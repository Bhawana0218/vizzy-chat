import { z } from "zod";

// ─── Chat ────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message too long"),
  contentType: z
    .enum(["text", "image", "video", "poster", "story"])
    .default("text"),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

// ─── Generate ────────────────────────────────────────────────

const ReferenceImageSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().regex(/^image\/(png|jpe?g|webp)$/i),
  dataUrl: z.string().regex(/^data:image\/(png|jpe?g|webp);base64,/i),
});

export const GenerateAssetSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(2000, "Prompt too long"),
  assetType: z.enum(["image", "video", "poster", "storyboard", "moodboard"]),
  style: z.string().optional(),
  width: z.number().int().min(256).max(4096).default(1024),
  height: z.number().int().min(256).max(4096).default(1024),
  count: z.number().int().min(1).max(6).default(1),
  conversationId: z.string().uuid().optional(),
  messageId: z.string().uuid().optional(),
  referenceImages: z.array(ReferenceImageSchema).max(4).optional(),
});

export type GenerateAssetInput = z.infer<typeof GenerateAssetSchema>;

// ─── Conversation ────────────────────────────────────────────

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const UpdateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isArchived: z.boolean().optional(),
});

// ─── Asset ───────────────────────────────────────────────────

export const UpdateAssetSchema = z.object({
  isFavorite: z.boolean().optional(),
});

// ─── User Preferences ────────────────────────────────────────

export const UpdatePreferencesSchema = z.object({
  preferredStyles: z.array(z.string()).optional(),
  favoriteColors: z.array(z.string()).optional(),
  businessType: z.string().optional(),
  brandVoice: z.string().optional(),
  brandColors: z.array(z.string()).optional(),
  brandFonts: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
});

// ─── Pagination ──────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
