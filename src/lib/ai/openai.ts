import {
  AIProviderInterface,
  GenerateImageParams,
  AIImageResult,
  ChatCompletionParams,
  ChatCompletionResult,
} from "./types";

export class OpenAIProvider implements AIProviderInterface {
  name = "openai" as const;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async generateImage(params: GenerateImageParams): Promise<AIImageResult[]> {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: params.prompt,
        n: params.n || 1,
        size: `${params.width}x${params.height}`,
        quality: "high",
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI image generation failed: ${response.status} - ${JSON.stringify(err)}`
      );
    }

    const data = await response.json();
    return data.data.map(
      (item: { url?: string; b64_json?: string; revised_prompt?: string }) => ({
        url: item.url || `data:image/png;base64,${item.b64_json}`,
        revisedPrompt: item.revised_prompt,
      })
    );
  }

  async chatCompletion(
    params: ChatCompletionParams
  ): Promise<ChatCompletionResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: params.model || "gpt-4o",
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI chat completion failed: ${response.status} - ${JSON.stringify(err)}`
      );
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      model: data.model,
    };
  }

  async *chatCompletionStream(params: ChatCompletionParams) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: params.model || "gpt-4o",
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI stream failed: ${response.status} - ${JSON.stringify(err)}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}
