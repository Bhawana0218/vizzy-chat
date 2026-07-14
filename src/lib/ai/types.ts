export interface GenerateImageParams {
  prompt: string;
  width: number;
  height: number;
  style?: string;
  n?: number;
  seed?: number;
}

export interface AIImageResult {
  url: string;
  revisedPrompt?: string;
  seed?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatCompletionParams {
  messages: { role: string; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}
