import { useState, useRef, useEffect } from 'react';
import { PROVIDER_META } from '../../services/llm/types';
import type { ProviderType, LLMConfig } from '../../services/llm/types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id: string;
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  config: LLMConfig;
}

interface AIChatDialogProps {
  open: boolean;
  onClose: () => void;
  onInsertTemplate: (html: string) => void;
}

function generateId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SYSTEM_PROMPT = `You are a senior UI/UX designer and Tailwind CSS expert integrated into the YO Admin App theme.

## App Theme Reference
- Primary: **brand-500** (#d94545 red), hover brand-600
- Success: success-500, Warning: warning-500/600, Error: error-50/500/600
- Neutrals: gray-50/100/200/300/400/500/600/700/800/900
- Surfaces: white bg, gray-50 page bg, gray-100 subtle bg
- Typography: text-sm font-medium, headings font-semibold/font-bold
- Border radius: rounded-lg (buttons/inputs), rounded-xl, rounded-2xl (cards/modals)
- Shadows: shadow-theme-xs/sm/md/lg (app custom tokens)
- Focus rings: focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10

## Component Conventions
- Buttons: "rounded-lg text-sm font-medium px-4 py-3 gap-2"
  - Primary: "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
  - Secondary: "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
  - Danger: "bg-error-50 text-error-600 border border-error-200 hover:bg-error-100"
  - Ghost/icon: "rounded-lg border border-gray-300 bg-white p-2 text-gray-600"
- Form labels: "block text-sm font-medium text-gray-700 mb-1"
- Form inputs/selects: "rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
- Cards: "rounded-2xl border border-gray-200 bg-white shadow-theme-md"
- Badges: "rounded-lg px-2.5 py-0.5 text-xs font-medium"
  - Success: "bg-success-50 text-success-600"
  - Warning: "bg-warning-50 text-warning-600"
  - Error: "bg-error-50 text-error-600"
  - Neutral: "bg-gray-100 text-gray-700"

## Image Rules (CRITICAL)
- NEVER use Unsplash (images.unsplash.com), Pexels, Pixabay, or any external image CDN URLs — they are blocked by OpaqueResponseBlocking and will not render.
- Use ONLY these safe image approaches:
  1. **placehold.co**: <img src="https://placehold.co/800x600/d94545/ffffff?text=Hero" /> (brand color + white text)
  2. **CSS gradients** as background instead of images
  3. **Inline SVG** for icons/illustrations (use Heroicons outline style, 24x24, strokeWidth 1.5)
  4. **Lucide-style SVG icons** with currentColor for icon-only elements

## Responsive Design (MANDATORY — every single component)
Every component you generate MUST work perfectly on mobile (320px), tablet (768px), and desktop (1280px+). Follow these hard rules:

**Grid Layouts** — ALWAYS use responsive column classes. Apply mobile-first: single column on mobile, multi-column on larger screens.
- ✅ Correct: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
- ✅ Correct: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
- ❌ Wrong: "grid grid-cols-3" (stuck at 3 columns on mobile — unusable on phone)

**Flex Layouts** — ALWAYS stack on mobile, side-by-side on desktop.
- ✅ Correct: "flex flex-col md:flex-row gap-4"
- ❌ Wrong: "flex gap-4" (side-by-side on mobile — items will overflow)

**Typography** — Scale text sizes responsively.
- ✅ Correct: "text-base md:text-lg lg:text-xl" for headings
- ✅ Correct: "text-sm md:text-base" for body text
- ❌ Wrong: "text-xl" (same huge size on mobile — breaks layout)

**Padding & Spacing** — Reduce on mobile, increase on desktop.
- ✅ Correct: "p-4 md:p-6 lg:p-8"
- ✅ Correct: "space-y-4 md:space-y-6"
- ❌ Wrong: "p-8" (excessive padding on mobile)

**Navigation & Menus** — Mobile: hamburger/stacked. Desktop: horizontal bar.
- ✅ Correct: "hidden md:flex" for desktop nav; "md:hidden" for mobile hamburger
- ❌ Wrong: "flex gap-6" (horizontal nav on mobile — items will wrap badly)

**Cards & Grid Items** — Full width on mobile, grid on desktop.
- ✅ Correct: "w-full md:w-auto" or rely on grid parent

**Tables** — Use responsive table pattern or card layout on mobile.
- ✅ Correct: Wrap in "overflow-x-auto" for horizontal scroll on small screens

**Images** — Always max-w-full and h-auto.
- ✅ Correct: <img class="w-full h-auto max-w-full" />

**Hero/Sections** — Stack on mobile (image top, text bottom), side-by-side on desktop.
- ✅ Correct: "flex flex-col lg:flex-row items-center"

FINAL CHECK before returning: Verify that removing all responsive prefixes (sm:/md:/lg:/xl:) would NOT make the layout unusable on mobile. If it would, add the missing prefixes.

## Output Rules
- Return ONLY raw HTML inside \`\`\`html ... \`\`\` blocks.
- Use semantic HTML5 and proper ARIA attributes.
- Never use inline styles when a Tailwind class exists.
- Wrap multi-section layouts in a single <div> container.
- Make every component self-contained and visually polished — production-ready.`;

function readConfig(): LLMConfig {
  const provider = (import.meta.env.VITE_LLM_PROVIDER || 'openai') as ProviderType;
  const meta = PROVIDER_META[provider];
  return {
    provider,
    apiKey: import.meta.env[meta.envKey] || import.meta.env.VITE_LLM_API_KEY || '',
    model: import.meta.env.VITE_LLM_MODEL || meta.defaultModel,
    baseUrl: import.meta.env.VITE_LLM_BASE_URL || meta.defaultBaseUrl,
  };
}

export function AIChatDialog({ open, onClose, onInsertTemplate }: AIChatDialogProps) {
  const config = readConfig();
  const provider = config.provider;
  const meta = PROVIDER_META[provider];

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const now = Date.now();
    return [{
      id: generateId(), name: 'AI Assistant', messages: [],
      config: readConfig(), createdAt: now, updatedAt: now,
    }];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, streamContent]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function extractHtml(text: string): string {
    const match = text.match(/```html\n?([\s\S]*?)```/);
    return match ? match[1].trim() : text;
  }

  function hasHtmlContent(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const cfg = readConfig();
    if (!cfg.apiKey) return;

    setInput('');

    const userMsg: ChatMessage = { role: 'user', content: trimmed, id: generateId() };
    const updatedMessages = [...(activeSession?.messages || []), userMsg];
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId ? { ...s, messages: updatedMessages, config: cfg } : s
    ));

    setIsStreaming(true);
    setStreamContent('');
    const assistantId = generateId();

    const fullMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT, id: 'sys' },
      ...updatedMessages,
    ];

    const abortController = new AbortController();
    abortRef.current = abortController;

    let accumulated = '';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: any;

      if (provider === 'anthropic') {
        headers['x-api-key'] = cfg.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        const msgs = fullMessages.filter(m => m.role !== 'system');
        const system = fullMessages.find(m => m.role === 'system')?.content;
        body = {
          model: cfg.model,
          max_tokens: 4096,
          messages: msgs.map(m => ({ role: m.role, content: m.content })),
          ...(system ? { system } : {}),
          stream: true,
        };
      } else if (provider === 'google') {
        const contents = fullMessages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
        const system = fullMessages.find(m => m.role === 'system')?.content;
        body = {
          contents,
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        };
      } else {
        headers['Authorization'] = `Bearer ${cfg.apiKey}`;
        body = {
          model: cfg.model,
          messages: fullMessages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        };
      }

      let url: string;
      if (provider === 'google') {
        url = `${cfg.baseUrl}/v1beta/models/${cfg.model}:streamGenerateContent?alt=sse&key=${cfg.apiKey}`;
      } else if (provider === 'ollama') {
        url = `${cfg.baseUrl}/api/chat`;
        body = { model: cfg.model, messages: fullMessages.map(m => ({ role: m.role, content: m.content })), stream: true };
      } else if (provider === 'anthropic') {
        url = `${cfg.baseUrl}/v1/messages`;
      } else {
        url = `${cfg.baseUrl}/v1/chat/completions`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        throw new Error(`${res.status}: ${errText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Response body not readable');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let content = '';
        if (provider === 'ollama') {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line.trim());
              if (parsed.message?.content) content += parsed.message.content;
              if (parsed.done) break;
            } catch { /* skip */ }
          }
        } else if (provider === 'google') {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) content += text;
            } catch { /* skip */ }
          }
        } else if (provider === 'anthropic') {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                content += parsed.delta.text || '';
              }
            } catch { /* skip */ }
          }
        } else {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) content += delta;
            } catch { /* skip */ }
          }
        }

        if (content) {
          accumulated += content;
          setStreamContent(accumulated);
        }
      }

      if (accumulated) {
        const assistantMsg: ChatMessage = { role: 'assistant', content: accumulated, id: assistantId };
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s
        ));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (accumulated) {
          const assistantMsg: ChatMessage = { role: 'assistant', content: accumulated, id: assistantId };
          setSessions(prev => prev.map(s =>
            s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s
          ));
        }
      } else {
        const errorMsg: ChatMessage = { role: 'assistant', content: `**Error:** ${err.message}`, id: assistantId };
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
        ));
      }
    } finally {
      setIsStreaming(false);
      setStreamContent('');
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function insertTemplate(text: string) {
    const html = extractHtml(text);
    if (html && hasHtmlContent(html)) {
      onInsertTemplate(html);
    }
  }

  const showEmptyState = activeSession.messages.length === 0 && !isStreaming;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-lg h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <SparklesIcon />
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">AI Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {showEmptyState && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <SparklesIcon className="h-8 w-8 text-brand-500 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Describe the component you need
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                I'll generate a Tailwind CSS HTML template you can insert directly.
              </p>
            </div>
          )}
          {activeSession.messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} onInsert={insertTemplate} isStreaming={false} streamContent="" />
          ))}
          {isStreaming && streamContent && (
            <ChatBubble
              message={{ role: 'assistant', content: streamContent, id: 'streaming' }}
              onInsert={insertTemplate}
              isStreaming={true}
              streamContent={streamContent}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the HTML component you need..."
              rows={2}
              className="flex-1 rounded-xl border border-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
              disabled={isStreaming}
            />
            {isStreaming ? (
              <button onClick={stopStreaming}
                className="shrink-0 rounded-xl bg-error-500 text-white px-3 py-2 text-sm font-medium hover:bg-error-600 transition flex items-center gap-1.5">
                <StopIcon /> Stop
              </button>
            ) : (
              <button onClick={sendMessage}
                disabled={!input.trim()}
                className="shrink-0 rounded-xl bg-brand-500 text-white px-3 py-2 text-sm font-medium hover:bg-brand-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                <SendIcon /> Send
              </button>
            )}
          </div>
          {!readConfig().apiKey && (
            <p className="mt-1.5 text-xs text-warning-600">
              Set <strong>VITE_LLM_API_KEY</strong> or <strong>VITE_{meta.envKey.slice(5)}</strong> in .env to connect.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message, onInsert, isStreaming, streamContent }: {
  message: ChatMessage;
  onInsert: (text: string) => void;
  isStreaming: boolean;
  streamContent: string;
}) {
  const isUser = message.role === 'user';
  const content = isStreaming ? streamContent : message.content;

  function extractHtml(text: string): string {
    const match = text.match(/```html\n?([\s\S]*?)```/);
    return match ? match[1].trim() : text;
  }

  function renderContent(text: string) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```html\n?|```/g, '').trim();
        return (
          <div key={i} className="relative group my-2">
            <pre className="rounded-xl bg-gray-900 p-3 text-xs text-gray-100 overflow-x-auto max-h-64"><code>{code}</code></pre>
            {!isStreaming && (
              <button
                onClick={() => onInsert(text)}
                className="absolute top-2 right-2 rounded-lg bg-brand-500 text-white px-2 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition hover:bg-brand-600"
              >
                Insert Template
              </button>
            )}
          </div>
        );
      }
      if (!part.trim()) return null;
      return <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">{part}</p>;
    });
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
        {renderContent(content)}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-brand-500 animate-pulse ml-0.5 rounded-sm" />
        )}
      </div>
    </div>
  );
}

function SparklesIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
