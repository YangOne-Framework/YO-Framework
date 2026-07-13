
import { ComponentTemplate } from '../../types/builderTypes';
import { AVAILABLE_TEMPLATES } from './constants';

// In-memory store for the session (in a real app, this would be a DB)
const currentTemplates: ComponentTemplate[] = [...AVAILABLE_TEMPLATES];

export const fetchTemplates = (): Promise<ComponentTemplate[]> => {
  return new Promise((resolve) => {
    // Simulate network delay to mimic real API behavior
    setTimeout(() => {
      resolve([...currentTemplates]);
    }, 300);
  });
};

export const saveTemplate = (template: ComponentTemplate): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if exists
      const idx = currentTemplates.findIndex(t => t.name === template.name);
      if (idx >= 0) {
        currentTemplates[idx] = template;
      } else {
        currentTemplates.push(template);
      }
      resolve();
    }, 300);
  });
};
