export type AssetType = "image" | "video" | "poster" | "moodboard" | "storyboard";

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  url: string;
  title: string;
  prompt: string;
  width: number;
  height: number;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  assets?: GeneratedAsset[];
  attachments?: MessageAttachment[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
