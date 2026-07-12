export type AIProvider = "openai" | "flux" | "ideogram" | "runway" | "kling";

export interface GenerateImageParams {
  prompt: string;
  width: number;
  height: number;
  style?: string;
  n?: number;
  seed?: number;
}

export interface GenerateVideoParams {
  prompt: string;
  imageUrl?: string;
  duration?: number;
  style?: string;
}

export interface AIImageResult {
  url: string;
  revisedPrompt?: string;
  seed?: number;
  metadata?: Record<string, unknown>;
}

export interface AIVideoResult {
  url: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
}

export interface AIProviderInterface {
  name: AIProvider;
  generateImage(params: GenerateImageParams): Promise<AIImageResult[]>;
  generateVideo?(params: GenerateVideoParams): Promise<AIVideoResult>;
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
