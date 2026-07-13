import { useState, useCallback, useRef, useEffect } from 'react';
import { createProvider } from '../services/llm/factory';
import { PROVIDER_META } from '../services/llm/types';
import type { ChatMessage, ChatSession, LLMConfig, ProviderType } from '../services/llm/types';

const STORAGE_KEY = 'yo_llm_chat_sessions';
const SESSION_ID_KEY = 'yo_llm_active_session';

const DEFAULT_SYSTEM_PROMPT = `You are a senior UI/UX designer and Tailwind CSS expert integrated into the YO Admin App theme.

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

function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { /* quota exceeded */ }
}

function loadActiveSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

function saveActiveSessionId(id: string | null) {
  if (id) localStorage.setItem(SESSION_ID_KEY, id);
  else localStorage.removeItem(SESSION_ID_KEY);
}

function getDefaultConfig(): LLMConfig {
  const envProvider = (import.meta.env.VITE_LLM_PROVIDER || 'openai') as ProviderType;
  const meta = PROVIDER_META[envProvider] || PROVIDER_META.openai;
  const envKey = import.meta.env[meta.envKey] || import.meta.env.VITE_LLM_API_KEY || '';
  return {
    provider: envProvider,
    apiKey: envKey,
    model: import.meta.env.VITE_LLM_MODEL || meta.defaultModel,
    baseUrl: import.meta.env.VITE_LLM_BASE_URL || meta.defaultBaseUrl,
  };
}

export function useLLMChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(loadActiveSessionId);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { saveActiveSessionId(activeSessionId); }, [activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const persistSessions = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  const createSession = useCallback((config?: Partial<LLMConfig>) => {
    const id = generateId();
    const session: ChatSession = {
      id,
      name: 'New Chat',
      messages: [],
      config: { ...getDefaultConfig(), ...config },
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...sessions, session];
    persistSessions(updated);
    setActiveSessionId(id);
    return session;
  }, [sessions, persistSessions]);

  const deleteSession = useCallback((id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    persistSessions(updated);
    if (activeSessionId === id) setActiveSessionId(updated[0]?.id || null);
  }, [sessions, activeSessionId, persistSessions]);

  const updateSessionConfig = useCallback((id: string, config: Partial<LLMConfig>) => {
    const updated = sessions.map(s =>
      s.id === id ? { ...s, config: { ...s.config, ...config }, updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  }, [sessions, persistSessions]);

  const updateSessionName = useCallback((id: string, name: string) => {
    const updated = sessions.map(s =>
      s.id === id ? { ...s, name, updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  }, [sessions, persistSessions]);

  const clearSessionMessages = useCallback((id: string) => {
    const updated = sessions.map(s =>
      s.id === id ? { ...s, messages: [], updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  }, [sessions, persistSessions]);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeSession) return;
    if (isStreaming) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content,
      id: generateId(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...activeSession.messages, userMsg];
    const updatedSession = { ...activeSession, messages: updatedMessages, updatedAt: Date.now() };
    const updated = sessions.map(s => s.id === activeSession.id ? updatedSession : s);
    persistSessions(updated);

    setIsStreaming(true);
    setStreamContent('');

    const assistantId = generateId();
    const fullMessages = [
      { role: 'system' as const, content: activeSession.systemPrompt, id: generateId(), timestamp: Date.now() },
      ...updatedMessages,
    ];

    const abortController = new AbortController();
    abortRef.current = abortController;

    let accumulated = '';

    try {
      const provider = createProvider(activeSession.config);
      const stream = provider.chatStream(fullMessages, abortController.signal);

      for await (const chunk of stream) {
        if (chunk.done) break;
        accumulated += chunk.content;
        setStreamContent(accumulated);
      }

      if (accumulated) {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: accumulated,
          id: assistantId,
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, assistantMsg];
        const finalSession = { ...activeSession, messages: finalMessages, updatedAt: Date.now() };
        const final = sessions.map(s => s.id === activeSession.id ? finalSession : s);
        persistSessions(final);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (accumulated) {
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: accumulated,
            id: assistantId,
            timestamp: Date.now(),
          };
          const finalMessages = [...updatedMessages, assistantMsg];
          const finalSession = { ...activeSession, messages: finalMessages, updatedAt: Date.now() };
          const final = sessions.map(s => s.id === activeSession.id ? finalSession : s);
          persistSessions(final);
        }
      } else {
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: `**Error:** ${err.message || 'Request failed'}`,
          id: assistantId,
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, errorMsg];
        const finalSession = { ...activeSession, messages: finalMessages, updatedAt: Date.now() };
        const final = sessions.map(s => s.id === activeSession.id ? finalSession : s);
        persistSessions(final);
      }
    } finally {
      setIsStreaming(false);
      setStreamContent('');
      abortRef.current = null;
    }
  }, [activeSession, sessions, isStreaming, persistSessions]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const switchSession = useCallback((id: string | null) => {
    setActiveSessionId(id);
  }, []);

  const extractCodeFromMarkdown = useCallback((text: string): string => {
    const match = text.match(/```html\n?([\s\S]*?)```/);
    return match ? match[1].trim() : text;
  }, []);

  return {
    sessions,
    activeSession,
    activeSessionId,
    isStreaming,
    streamContent,
    createSession,
    deleteSession,
    updateSessionConfig,
    updateSessionName,
    clearSessionMessages,
    sendMessage,
    stopStreaming,
    switchSession,
    extractCodeFromMarkdown,
  };
}
