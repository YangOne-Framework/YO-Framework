import type { YoComponentDefinition, ConfigField } from '../types/yoPageTypes';
import { HtmlComponentRenderer } from '../components/studio/Renderers';

interface BackendSetting {
  key: string;
  label: string;
  type: string;
  options?: string[];
  defaultValue: string;
}

interface BackendContentField {
  key: string;
  label: string;
  type: string;
  defaultValue: string;
  options?: string[];
}

export interface BackendHtmlComponent {
  HtmlComponentId: number;
  Name: string;
  DisplayName: string;
  ShortDescription?: string;
  Icon?: string;
  Config?: string;
  ContentStructure?: string;
  HtmlTemplate?: string;
  StateSchema?: string;
  ApiBindings?: string;
  EventBindings?: string;
  RuntimeOptions?: string;
}

function mapFieldType(type: string): ConfigField['type'] {
  switch (type) {
    case 'text': return 'text';
    case 'textarea': return 'textarea';
    case 'richtext': return 'richtext';
    case 'image': return 'image';
    case 'link': return 'url';
    case 'select': return 'select';
    case 'boolean': return 'boolean';
    case 'color': return 'color';
    case 'list': return 'textarea';
    default: return 'text';
  }
}

export function toYoDefinition(item: BackendHtmlComponent): YoComponentDefinition {
  const type = `html-component-${item.HtmlComponentId}`;

  let settings: BackendSetting[] = [];
  try {
    if (item.Config) {
      const configObj = JSON.parse(item.Config);
      settings = configObj.settings || [];
    }
  } catch (e) {}

  let contentStructure: BackendContentField[] = [];
  try {
    if (item.ContentStructure) {
      contentStructure = JSON.parse(item.ContentStructure);
    }
  } catch (e) {}

  let stateSchema: Record<string, unknown> = {};
  try { if (item.StateSchema) stateSchema = JSON.parse(item.StateSchema); } catch (e) {}

  let apiBindings: Record<string, unknown> = {};
  try { if (item.ApiBindings) apiBindings = JSON.parse(item.ApiBindings); } catch (e) {}

  let eventBindings: Record<string, unknown> = {};
  try { if (item.EventBindings) eventBindings = JSON.parse(item.EventBindings); } catch (e) {}

  let runtimeOptions: Record<string, unknown> = {};
  try { if (item.RuntimeOptions) runtimeOptions = JSON.parse(item.RuntimeOptions); } catch (e) {}

  const defaultConfig: Record<string, unknown> = {};
  const configSchema: ConfigField[] = [];

  for (const setting of settings) {
    configSchema.push({
      key: setting.key,
      label: setting.label,
      type: mapFieldType(setting.type),
      options: setting.options?.map((opt: string) => ({ label: opt, value: opt })),
      defaultValue: setting.defaultValue,
    });
    defaultConfig[setting.key] = setting.defaultValue ?? '';
  }

  for (const field of contentStructure) {
    configSchema.push({
      key: field.key,
      label: field.label,
      type: mapFieldType(field.type),
      options: field.options?.map((opt: string) => ({ label: opt, value: opt })),
      defaultValue: field.defaultValue,
      helpText: field.type === 'list' ? 'Edit as JSON array' : undefined,
    });
    defaultConfig[field.key] = field.defaultValue ?? '';
  }

  defaultConfig.__htmlTemplate = item.HtmlTemplate ?? '';
  defaultConfig.__htmlSettings = settings;
  defaultConfig.__htmlContentStructure = contentStructure;
  defaultConfig.__htmlState = stateSchema;
  defaultConfig.__htmlApiBindings = apiBindings;
  defaultConfig.__htmlEventBindings = eventBindings;
  defaultConfig.__htmlRuntimeOptions = runtimeOptions;

  return {
    type,
    label: item.DisplayName,
    group: 'Data',
    description: item.ShortDescription ?? '',
    defaultConfig,
    defaultStyle: {
      padding: 'none',
      margin: 'none',
      borderRadius: 'none',
      shadow: 'none',
      align: 'left',
    },
    configSchema,
    renderer: HtmlComponentRenderer,
  };
}
