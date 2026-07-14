export type AssetType = "image" | "video" | "poster" | "moodboard" | "storyboard";

export type Workspace = "personal" | "business";

export type CreativeIntent =
  | "image-generation"
  | "video-concept"
  | "poster-design"
  | "story-narrative"
  | "vision-board"
  | "mood-board"
  | "brand-artwork"
  | "emotional-landscape"
  | "dream-visualization"
  | "quote-poster"
  | "photo-transform"
  | "product-ad"
  | "campaign-design"
  | "general-creative";

export type ResponseFormat = {
  assetType: AssetType;
  count: number;
  aspectRatio: string;
  style: string;
};

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  intent: CreativeIntent;
  format: ResponseFormat;
  keywords: string[];
  hasReferenceImage: boolean;
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  url: string;
  title: string;
  prompt: string;
  enhancedPrompt?: string;
  variationName?: string;
  width: number;
  height: number;
  favorited?: boolean;
  createdAt?: string;
  metadata?: {
    model?: string;
    seed?: number;
    style?: string;
    enhancedPrompt?: string;
    variationName?: string;
    gradient?: string;
    aspectRatio?: string;
    provider?: string;
  };
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl: string;
}

export interface ReferenceImage {
  name: string;
  type: string;
  dataUrl: string;
}

export interface VoiceData {
  blob: Blob;
  url: string;
  duration: number;
  waveform: number[];
  transcript?: string;
}

export type GenerationStage = "idle" | "enhancing" | "generating" | "rendering" | "completed" | "error";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  assets?: GeneratedAsset[];
  attachments?: MessageAttachment[];
  voiceData?: VoiceData;
  timestamp: Date;
  isStreaming?: boolean;
  enhancedPrompt?: string;
  stage?: GenerationStage;
  error?: string;
  retryCount?: number;
}

export interface ConversationFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  folderId?: string;
  isArchived?: boolean;
  workspace: Workspace;
}

export interface UserPreferences {
  workspace: Workspace;
  folders: ConversationFolder[];
}
