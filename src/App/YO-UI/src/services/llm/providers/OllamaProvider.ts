import { BaseLLMProvider } from '../BaseProvider';
import type { LLMConfig, ChatMessage, LLMChunk } from '../types';

export class OllamaProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super(config);
  }

  async chat(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
    const res = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
      }),
      signal,
    });
    if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.message?.content || '';
  }

  async *chatStream(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<LLMChunk> {
    const res = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
      signal,
    });
    if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${await res.text()}`);
    yield* this.streamLines(res);
  }

  protected extractStreamContent(parsed: any): string | null {
    return parsed.message?.content || null;
  }

  protected extractStreamDone(parsed: any): boolean {
    return parsed.done === true;
  }
}
