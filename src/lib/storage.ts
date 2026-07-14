import { Conversation, ConversationFolder } from "./types";

const STORAGE_KEY = "vizzy-chat-conversations";
const FOLDERS_KEY = "vizzy-chat-folders";

function getUserKey(key: string, userId?: string): string {
  if (!userId) return key;
  const safeId = userId.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  return `${key}-${safeId}`;
}

export function loadConversations(userId?: string): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getUserKey(STORAGE_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return parsed.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[], userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getUserKey(STORAGE_KEY, userId);
    localStorage.setItem(key, JSON.stringify(conversations));
  } catch {
    // localStorage full or unavailable
  }
}

export function deleteConversation(id: string, userId?: string): void {
  const conversations = loadConversations(userId).filter((c) => c.id !== id);
  saveConversations(conversations, userId);
}

export function loadFolders(userId?: string): ConversationFolder[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getUserKey(FOLDERS_KEY, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return getDefaultFolders();
    return JSON.parse(raw);
  } catch {
    return getDefaultFolders();
  }
}

export function saveFolders(folders: ConversationFolder[], userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getUserKey(FOLDERS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(folders));
  } catch {
    // localStorage full or unavailable
  }
}

function getDefaultFolders(): ConversationFolder[] {
  return [
    { id: "personal", name: "Personal", icon: "folder", color: "#8b5cf6" },
    { id: "business", name: "Business", icon: "briefcase", color: "#06b6d4" },
    { id: "favorites", name: "Favorites", icon: "star", color: "#f59e0b" },
  ];
}
