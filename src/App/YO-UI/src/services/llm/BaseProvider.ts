import type { LLMConfig, ChatMessage, LLMChunk, ProviderType } from './types';

export abstract class BaseLLMProvider {
  readonly type: ProviderType;
  readonly config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.type = config.provider;
  }

  abstract chat(messages: ChatMessage[], signal?: AbortSignal): Promise<string>;
  abstract chatStream(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<LLMChunk>;

  protected get headers(): Record<string, string> {
    return { 'Content-Type': 'application/json' };
  }

  protected async *streamSSE(
    response: Response,
  ): AsyncGenerator<LLMChunk> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body not readable');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = this.extractStreamContent(parsed);
          if (content) yield { content, done: false };
        } catch { /* skip malformed */ }
      }
    }
    yield { content: '', done: true };
  }

  protected async *streamLines(
    response: Response,
  ): AsyncGenerator<LLMChunk> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body not readable');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          const content = this.extractStreamContent(parsed);
          const isDone = this.extractStreamDone(parsed);
          if (content) yield { content, done: false };
          if (isDone) { yield { content: '', done: true }; return; }
        } catch { /* skip */ }
      }
    }
    yield { content: '', done: true };
  }

  protected extractStreamContent(_parsed: any): string | null {
    return null;
  }

  protected extractStreamDone(_parsed: any): boolean {
    return false;
  }
}
