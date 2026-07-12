import { OpenAIProvider } from "./openai";
import {
  AIProvider,
  AIProviderInterface,
  GenerateImageParams,
  AIImageResult,
  ChatCompletionParams,
  ChatCompletionResult,
} from "./types";

// ─── Provider Registry ───────────────────────────────────────

const providers = new Map<AIProvider, () => AIProviderInterface>();

providers.set("openai", () => new OpenAIProvider());

// Future providers can be registered here:
// providers.set("flux", () => new FluxProvider());
// providers.set("ideogram", () => new IdeogramProvider());

// ─── Router ──────────────────────────────────────────────────

class AIRouter {
  private defaultImageProvider: AIProvider = "openai";
  private defaultChatProvider: AIProvider = "openai";

  setImageProvider(provider: AIProvider) {
    this.defaultImageProvider = provider;
  }

  setChatProvider(provider: AIProvider) {
    this.defaultChatProvider = provider;
  }

  private getProvider(name: AIProvider): AIProviderInterface {
    const factory = providers.get(name);
    if (!factory) {
      throw new Error(`AI provider "${name}" is not registered`);
    }
    return factory();
  }

  async generateImage(
    params: GenerateImageParams,
    provider?: AIProvider
  ): Promise<AIImageResult[]> {
    const p = this.getProvider(provider || this.defaultImageProvider);
    return p.generateImage(params);
  }

  async chatCompletion(
    params: ChatCompletionParams,
    provider?: AIProvider
  ): Promise<ChatCompletionResult> {
    const p = this.getProvider(provider || this.defaultChatProvider);
    if (!("chatCompletion" in p)) {
      throw new Error(`Provider "${provider || this.defaultChatProvider}" does not support chat completion`);
    }
    return (p as OpenAIProvider).chatCompletion(params);
  }

  async *chatCompletionStream(
    params: ChatCompletionParams,
    provider?: AIProvider
  ) {
    const p = this.getProvider(provider || this.defaultChatProvider);
    if (!("chatCompletionStream" in p)) {
      throw new Error(`Provider "${provider || this.defaultChatProvider}" does not support streaming`);
    }
    yield* (p as OpenAIProvider).chatCompletionStream(params);
  }
}

export const aiRouter = new AIRouter();
