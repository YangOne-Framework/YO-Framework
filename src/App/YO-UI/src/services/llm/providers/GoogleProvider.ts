import { BaseLLMProvider } from '../BaseProvider';
import type { LLMConfig, ChatMessage, LLMChunk } from '../types';

export class GoogleProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super(config);
  }

  private toGeminiContents(messages: ChatMessage[]) {
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const m of messages.filter(m => m.role !== 'system')) {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      });
    }
    return contents;
  }

  private buildBody(messages: ChatMessage[]) {
    const system = messages.find(m => m.role === 'system')?.content;
    return {
      contents: this.toGeminiContents(messages),
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    };
  }

  async chat(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
    const url = `${this.config.baseUrl}/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.buildBody(messages)),
      signal,
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async *chatStream(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<LLMChunk> {
    const url = `${this.config.baseUrl}/v1beta/models/${this.config.model}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.buildBody(messages)),
      signal,
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    const reader = res.body?.getReader();
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
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield { content: text, done: false };
        } catch { /* skip */ }
      }
    }
    yield { content: '', done: true };
  }
}
