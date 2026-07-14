import { Message, Conversation, GeneratedAsset, ReferenceImage } from "./types";

// ─── Base API Client ─────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    const error = json.error || json;
    throw new ApiError(res.status, error.code || "UNKNOWN", error.message || "Request failed", error.details);
  }

  return json.data !== undefined ? json.data : json;
}

// ─── Chat API ────────────────────────────────────────────────

interface ChatStreamCallbacks {
  onChunk: (content: string) => void;
  onDone: (messageId: string, conversationId: string) => void;
  onError: (error: string) => void;
}

let activeAbortController: AbortController | null = null;

export function abortActiveChat() {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
}

export async function sendChatMessage(
  content: string,
  conversationId: string | null,
  callbacks: ChatStreamCallbacks
): Promise<void> {
  abortActiveChat();
  const controller = new AbortController();
  activeAbortController = controller;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, conversationId }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      callbacks.onError(json.error?.message || `Server error (${res.status})`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      callbacks.onError("No response stream");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.error) {
              callbacks.onError(data.error);
              return;
            }

            if (data.done) {
              callbacks.onDone(data.messageId, data.conversationId);
            } else if (data.content) {
              callbacks.onChunk(data.content);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      callbacks.onError("Request was cancelled");
    } else {
      callbacks.onError(err instanceof Error ? err.message : "Network error");
    }
  } finally {
    activeAbortController = null;
  }
}

// ─── Generate API ────────────────────────────────────────────

interface GenerateParams {
  prompt: string;
  assetType: "image" | "video" | "poster" | "storyboard" | "moodboard";
  width?: number;
  height?: number;
  count?: number;
  style?: string;
  conversationId?: string;
  messageId?: string;
  referenceImages?: ReferenceImage[];
}

interface GenerateResult {
  message: { id: string; content: string };
  assets: (GeneratedAsset & { title?: string })[];
  credits: { used: number; remaining: number };
}

export async function generateAssets(params: GenerateParams): Promise<GenerateResult> {
  return apiRequest<GenerateResult>("/api/generate", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      width: params.width || 1024,
      height: params.height || 1024,
      count: params.count || 1,
    }),
  });
}

// ─── Conversations API ───────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function fetchConversations(
  page = 1,
  limit = 50
): Promise<PaginatedResponse<Conversation & { _count: { messages: number }; messages: Message[] }>> {
  return apiRequest(`/api/conversations?page=${page}&limit=${limit}`);
}

export async function fetchConversation(id: string): Promise<Conversation & { messages: (Message & { assets: GeneratedAsset[] })[] }> {
  return apiRequest(`/api/conversations/${id}`);
}

export async function createConversation(title?: string): Promise<Conversation> {
  return apiRequest("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateConversation(
  id: string,
  data: { title?: string; isArchived?: boolean }
): Promise<Conversation> {
  return apiRequest(`/api/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  return apiRequest(`/api/conversations/${id}`, { method: "DELETE" });
}

// ─── Assets API ──────────────────────────────────────────────

interface AssetsResponse {
  data: (GeneratedAsset & { message: { id: string; conversationId: string; content: string } })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function fetchAssets(
  page = 1,
  limit = 20,
  options?: { type?: string; favorites?: boolean }
): Promise<AssetsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options?.type) params.set("type", options.type);
  if (options?.favorites) params.set("favorites", "true");
  return apiRequest(`/api/assets?${params}`);
}

export async function updateAsset(
  id: string,
  data: { isFavorite?: boolean }
): Promise<GeneratedAsset> {
  return apiRequest("/api/assets", {
    method: "PATCH",
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteAsset(id: string): Promise<void> {
  return apiRequest(`/api/assets?id=${id}`, { method: "DELETE" });
}

// ─── Auth API ────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
}
