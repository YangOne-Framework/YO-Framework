export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'openai-compatible'
  | 'ollama'
  | 'lmstudio'
  | 'nvidia';

export interface LLMConfig {
  provider: ProviderType;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id: string;
  timestamp: number;
}

export interface LLMChunk {
  content: string;
  done: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  config: LLMConfig;
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
}

export const PROVIDER_META: Record<ProviderType, {
  label: string;
  defaultModel: string;
  defaultBaseUrl: string;
  models: string[];
  envKey: string;
}> = {
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4o',
    defaultBaseUrl: 'https://api.openai.com',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    envKey: 'VITE_OPENAI_API_KEY',
  },
  anthropic: {
    label: 'Anthropic Claude',
    defaultModel: 'claude-sonnet-4-20250514',
    defaultBaseUrl: 'https://api.anthropic.com',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    envKey: 'VITE_ANTHROPIC_API_KEY',
  },
  google: {
    label: 'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    envKey: 'VITE_GOOGLE_API_KEY',
  },
  'openai-compatible': {
    label: 'OpenAI Compatible',
    defaultModel: 'meta/llama-3.1-8b-instruct',
    defaultBaseUrl: 'https://integrate.api.nvidia.com',
    models: ['meta/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct-v0.3', 'custom'],
    envKey: 'VITE_OPENAI_COMPATIBLE_API_KEY',
  },
  ollama: {
    label: 'Ollama (Local)',
    defaultModel: 'llama3.2',
    defaultBaseUrl: 'http://localhost:11434',
    models: ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'phi3', 'custom'],
    envKey: 'VITE_OLLAMA_API_KEY',
  },
  lmstudio: {
    label: 'LM Studio (Local)',
    defaultModel: 'local-model',
    defaultBaseUrl: 'http://localhost:1234',
    models: ['local-model'],
    envKey: 'VITE_LMSTUDIO_API_KEY',
  },
  nvidia: {
    label: 'Nvidia NIM',
    defaultModel: 'meta/llama-3.1-8b-instruct',
    defaultBaseUrl: 'https://integrate.api.nvidia.com',
    models: ['openai/gpt-oss-120b', 'meta/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct-v0.3', 'meta/llama3-70b-instruct', 'custom'],
    envKey: 'VITE_NVIDIA_API_KEY',
  },
};
