import { BaseLLMProvider } from './BaseProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { GoogleProvider } from './providers/GoogleProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import { LMStudioProvider } from './providers/LMStudioProvider';
import type { LLMConfig, ProviderType } from './types';

export function createProvider(config: LLMConfig): BaseLLMProvider {
  const map: Record<ProviderType, new (config: LLMConfig) => BaseLLMProvider> = {
    openai: OpenAIProvider,
    'openai-compatible': OpenAIProvider,
    anthropic: AnthropicProvider,
    google: GoogleProvider,
    ollama: OllamaProvider,
    lmstudio: LMStudioProvider,
    nvidia: OpenAIProvider,
  };
  const Ctor = map[config.provider];
  if (!Ctor) throw new Error(`Unknown provider: ${config.provider}`);
  return new Ctor(config);
}
