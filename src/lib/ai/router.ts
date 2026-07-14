/**
 * AI Router
 *
 * Image generation → Pollinations AI (no API key needed)
 * Chat completions → OpenAI (GPT-4o)
 */

import { OpenAIProvider } from "./openai";
import { generatePollinationsUrl } from "./pollinations";
import {
  GenerateImageParams,
  AIImageResult,
  ChatCompletionParams,
  ChatCompletionResult,
} from "./types";

class AIRouter {
  async generateImage(params: GenerateImageParams): Promise<AIImageResult[]> {
    return generatePollinationsUrl(params);
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    const provider = new OpenAIProvider();
    return provider.chatCompletion(params);
  }

  async *chatCompletionStream(params: ChatCompletionParams) {
    const provider = new OpenAIProvider();
    yield* provider.chatCompletionStream(params);
  }
}

export const aiRouter = new AIRouter();
