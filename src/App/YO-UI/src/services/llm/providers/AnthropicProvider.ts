import { BaseLLMProvider } from '../BaseProvider';
import type { LLMConfig, ChatMessage, LLMChunk } from '../types';

export class AnthropicProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super(config);
  }

  get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  private toAnthropicMessages(messages: ChatMessage[]) {
    const msgs = messages.filter(m => m.role !== 'system');
    const system = messages.find(m => m.role === 'system')?.content;
    return {
      messages: msgs.map(m => ({ role: m.role, content: m.content })),
      ...(system ? { system } : {}),
    };
  }

  private buildBody(messages: ChatMessage[], stream: boolean) {
    const { messages: msgs, system } = this.toAnthropicMessages(messages);
    return {
      model: this.config.model,
      max_tokens: 4096,
      messages: msgs,
      ...(system ? { system } : {}),
      stream,
    };
  }

  async chat(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
    const res = await fetch(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(this.buildBody(messages, false)),
      signal,
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  async *chatStream(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<LLMChunk> {
    const res = await fetch(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(this.buildBody(messages, true)),
      signal,
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
    yield* this.streamSSE(res);
  }

  protected extractStreamContent(parsed: any): string | null {
    if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
      return parsed.delta.text || null;
    }
    if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'text') {
      return parsed.content_block.text || null;
    }
    return null;
  }
}
