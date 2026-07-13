import { OpenAIProvider } from './OpenAIProvider';
import type { LLMConfig } from '../types';

export class LMStudioProvider extends OpenAIProvider {
  constructor(config: LLMConfig) {
    super({ ...config, provider: 'lmstudio' });
  }

  get headers(): Record<string, string> {
    return { 'Content-Type': 'application/json' };
  }
}
