import { BaseLLMProvider } from '../BaseProvider';
import type { LLMConfig, ChatMessage, LLMChunk } from '../types';

export class OpenAIProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super(config);
  }

  get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  private buildBody(messages: ChatMessage[], stream: boolean) {
    return {
      model: this.config.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream,
    };
  }

  async chat(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
    const res = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(this.buildBody(messages, false)),
      signal,
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async *chatStream(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<LLMChunk> {
    const res = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(this.buildBody(messages, true)),
      signal,
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
    yield* this.streamSSE(res);
  }

  protected extractStreamContent(parsed: any): string | null {
    return parsed.choices?.[0]?.delta?.content || null;
  }
}
