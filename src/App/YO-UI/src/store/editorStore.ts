import { componentRegistry } from '../registry/componentRegistry';
import { layoutPresets } from '../registry/layoutPresets';
import type { YoAnimationConfig, YoComponentInstance, YoPage, YoSection, DeviceMode, ValidationIssue } from '../types/yoPageTypes';
import { createId } from '../utils/id';

export interface EditorState {
  page: YoPage;
  selectedComponentId: string | null;
  selectedSectionId: string | null;
  activeDevice: DeviceMode;
  history: YoPage[];
  future: YoPage[];
  dirty: boolean;
  editingLayout: string | null;
}

export function createEmptyPage(): YoPage {
  const now = new Date().toISOString();
  return {
    id: createId('page'),
    title: 'Untitled Page',
    slug: `page-${Date.now().toString(36)}`,
    status: 'draft',
    masterLayoutId: 'default-site',
    seo: { metaTitle: 'Untitled Page', metaDescription: '', keywords: '' },
    masterLayoutConfig: { brandName: 'StudioSite', navItems: 'Home, Work, Pricing, Contact', ctaLabel: 'Get started', ctaUrl: '#', footerText: 'Designed with CMS Studio', headerStyle: 'glass', containerMode: 'boxed' },
    settings: { containerMode: 'boxed', backgroundColor: '#f8fafc' },
    sections: [],
    components: {},
    version: 1,
    createdAt: now,
    updatedAt: now
  };
}

function createSection(layoutPresetId: string): YoSection {
  const preset = layoutPresets.find(x => x.id === layoutPresetId) ?? layoutPresets[0];
  return {
    id: createId('section'),
    name: preset.name,
    layoutPresetId: preset.id,
    settings: { layoutMode: 'boxed', fullWidth: false, paddingY: 'md', backgroundColor: '#ffffff' },
    columns: preset.columns.map((span, index) => ({
      id: createId('col'),
      title: `Room ${index + 1}`,
      span,
      components: []
    }))
  };
}

function createComponent(type: string): YoComponentInstance {
  const definition = componentRegistry[type];
  if (!definition) throw new Error(`Unknown component type: ${type}`);
  return {
    id: createId('cmp'),
    type,
    name: definition.label,
    config: structuredClone(definition.defaultConfig),
    style: structuredClone(definition.defaultStyle),
    animation: definition.defaultAnimation,
    visibility: { desktop: true, tablet: true, mobile: true },
    locked: false
  };
}

function clonePage(page: YoPage): YoPage {
  return structuredClone(page);
}

export type Listener = (state: EditorState) => void;

function normalizePage(page: YoPage): YoPage {
  const clone = clonePage(page);
  clone.masterLayoutConfig = clone.masterLayoutConfig ?? {
    brandName: 'StudioSite',
    navItems: 'Home, Work, Pricing, Contact',
    ctaLabel: 'Get started',
    ctaUrl: '#',
    footerText: 'Designed with CMS Studio',
    headerStyle: 'glass',
    containerMode: 'boxed'
  };
  clone.settings = { backgroundColor: '#f8fafc', ...(clone.settings ?? {}), containerMode: (clone.settings?.containerMode ?? 'boxed') } as YoPage['settings'];
  if ((clone.settings.containerMode as string) === 'full') clone.settings.containerMode = 'fluid';
  clone.sections = (Array.isArray(clone.sections) ? clone.sections : []).map(section => ({
    ...section,
    collapsed: section.collapsed ?? false,
    settings: {
      layoutMode: (section.settings as any)?.layoutMode ?? ((section.settings as any)?.fullWidth ? 'fluid' : 'boxed'),
      fullWidth: Boolean((section.settings as any)?.fullWidth),
      paddingY: section.settings?.paddingY ?? 'md',
      backgroundColor: section.settings?.backgroundColor ?? '#ffffff',
      backgroundImage: section.settings?.backgroundImage,
      className: section.settings?.className
    }
  }));
  return clone;
}

class EditorStore {
  private state: EditorState = {
    page: createEmptyPage(),
    selectedComponentId: null,
    selectedSectionId: null,
    activeDevice: 'desktop',
    history: [],
    future: [],
    dirty: false,
    editingLayout: null
  };

  private listeners = new Set<Listener>();

  getState(): EditorState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private commit(mutator: (draft: YoPage) => void) {
    const previous = clonePage(this.state.page);
    const next = clonePage(this.state.page);
    mutator(next);
    next.updatedAt = new Date().toISOString();
    this.state = { ...this.state, page: next, history: [...this.state.history, previous].slice(-50), future: [], dirty: true };
    this.emit();
  }

  loadPage(page: YoPage) {
    this.state = { ...this.state, page: normalizePage(page), selectedComponentId: null, selectedSectionId: page.sections[0]?.id ?? null, history: [], future: [], dirty: false, editingLayout: null };
    this.emit();
  }

  setEditingLayout(layoutId: string | null) {
    this.state = { ...this.state, editingLayout: layoutId };
    this.emit();
  }

  setPageMeta(data: Partial<Pick<YoPage, 'title' | 'slug' | 'masterLayoutId' | 'status'>>) {
    this.commit(page => Object.assign(page, data));
  }

  setSeo(key: keyof YoPage['seo'], value: string) {
    this.commit(page => { page.seo[key] = value; });
  }

  setPageSetting<K extends keyof YoPage['settings']>(key: K, value: YoPage['settings'][K]) {
    this.commit(page => { page.settings[key] = value; });
  }

  setMasterLayoutConfig<K extends keyof YoPage['masterLayoutConfig']>(key: K, value: YoPage['masterLayoutConfig'][K]) {
    this.commit(page => { page.masterLayoutConfig[key] = value; });
  }

  addSection(layoutPresetId: string) {
    const section = createSection(layoutPresetId);
    this.commit(page => { page.sections.push(section); });
    this.state = { ...this.state, selectedSectionId: section.id };
    this.emit();
  }

  updateSection(sectionId: string, updater: (section: YoSection) => void) {
    this.commit(page => {
      const section = page.sections.find(x => x.id === sectionId);
      if (section) updater(section);
    });
  }

  removeSection(sectionId: string) {
    this.commit(page => {
      const section = page.sections.find(x => x.id === sectionId);
      section?.columns.forEach(col => col.components.forEach(id => delete page.components[id]));
      page.sections = page.sections.filter(x => x.id !== sectionId);
    });
  }

  duplicateSection(sectionId: string) {
    this.commit(page => {
      const index = page.sections.findIndex(x => x.id === sectionId);
      if (index < 0) return;
      const source = page.sections[index];
      const clone = structuredClone(source);
      clone.id = createId('section');
      clone.name = `${source.name} Copy`;
      clone.columns = clone.columns.map(col => ({ ...col, id: createId('col'), components: col.components.map(oldId => {
        const oldComponent = page.components[oldId];
        const newComponent = structuredClone(oldComponent);
        newComponent.id = createId('cmp');
        page.components[newComponent.id] = newComponent;
        return newComponent.id;
      }) }));
      page.sections.splice(index + 1, 0, clone);
    });
  }

  moveSection(sectionId: string, direction: -1 | 1) {
    this.commit(page => {
      const index = page.sections.findIndex(x => x.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= page.sections.length) return;
      const [item] = page.sections.splice(index, 1);
      page.sections.splice(target, 0, item);
    });
  }

  addComponent(sectionId: string, columnId: string, type: string) {
    const component = createComponent(type);
    this.commit(page => {
      page.components[component.id] = component;
      const column = page.sections.find(s => s.id === sectionId)?.columns.find(c => c.id === columnId);
      column?.components.push(component.id);
    });
    this.state = { ...this.state, selectedComponentId: component.id, selectedSectionId: sectionId };
    this.emit();
  }

  moveComponent(componentId: string, targetSectionId: string, targetColumnId: string, targetIndex?: number) {
    this.commit(page => {
      page.sections.forEach(section => section.columns.forEach(column => {
        column.components = column.components.filter(id => id !== componentId);
      }));
      const targetColumn = page.sections.find(s => s.id === targetSectionId)?.columns.find(c => c.id === targetColumnId);
      if (!targetColumn) return;
      const index = typeof targetIndex === 'number' ? targetIndex : targetColumn.components.length;
      targetColumn.components.splice(index, 0, componentId);
    });
  }

  removeComponent(componentId: string) {
    this.commit(page => {
      delete page.components[componentId];
      page.sections.forEach(section => section.columns.forEach(column => {
        column.components = column.components.filter(id => id !== componentId);
      }));
    });
    this.state = { ...this.state, selectedComponentId: null };
    this.emit();
  }

  duplicateComponent(componentId: string) {
    this.commit(page => {
      const source = page.components[componentId];
      if (!source) return;
      const clone = structuredClone(source);
      clone.id = createId('cmp');
      clone.name = `${source.name} Copy`;
      page.components[clone.id] = clone;
      for (const section of page.sections) {
        for (const column of section.columns) {
          const index = column.components.indexOf(componentId);
          if (index >= 0) {
            column.components.splice(index + 1, 0, clone.id);
            return;
          }
        }
      }
    });
  }

  updateComponentConfig(componentId: string, key: string, value: unknown) {
    this.commit(page => {
      const component = page.components[componentId];
      if (!component || component.locked) return;
      component.config[key] = value;
    });
  }

  updateComponentStyle(componentId: string, key: string, value: unknown) {
    this.commit(page => {
      const component = page.components[componentId];
      if (!component || component.locked) return;
      (component.style as Record<string, unknown>)[key] = value;
    });
  }

  updateComponentAnimation(componentId: string, animation: YoAnimationConfig | undefined) {
    this.commit(page => {
      const component = page.components[componentId];
      if (component && !component.locked) component.animation = animation;
    });
  }

  toggleComponentVisibility(componentId: string, device: DeviceMode) {
    this.commit(page => {
      const component = page.components[componentId];
      if (component) component.visibility[device] = !component.visibility[device];
    });
  }

  toggleLocked(componentId: string) {
    this.commit(page => {
      const component = page.components[componentId];
      if (component) component.locked = !component.locked;
    });
  }

  selectComponent(componentId: string | null) {
    this.state = { ...this.state, selectedComponentId: componentId };
    this.emit();
  }

  selectSection(sectionId: string | null) {
    this.state = { ...this.state, selectedSectionId: sectionId };
    this.emit();
  }

  setDevice(device: DeviceMode) {
    this.state = { ...this.state, activeDevice: device };
    this.emit();
  }

  undo() {
    const previous = this.state.history.length > 0 ? this.state.history[this.state.history.length - 1] : undefined;
    if (!previous) return;
    this.state = {
      ...this.state,
      page: previous,
      history: this.state.history.slice(0, -1),
      future: [clonePage(this.state.page), ...this.state.future],
      dirty: true
    };
    this.emit();
  }

  redo() {
    const next = this.state.future[0];
    if (!next) return;
    this.state = {
      ...this.state,
      page: next,
      history: [...this.state.history, clonePage(this.state.page)],
      future: this.state.future.slice(1),
      dirty: true
    };
    this.emit();
  }

  markClean(page?: YoPage) {
    this.state = { ...this.state, page: page ? clonePage(page) : this.state.page, dirty: false };
    this.emit();
  }

  validate(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const page = this.state.page;
    if (!page.title.trim()) issues.push({ id: 'page-title', level: 'error', message: 'Page title is required.', target: 'page' });
    if (!page.slug.trim()) issues.push({ id: 'page-slug', level: 'error', message: 'Page slug is required.', target: 'page' });
    if (page.sections.length === 0) issues.push({ id: 'page-sections', level: 'warning', message: 'Page has no sections.', target: 'page' });

    page.sections.forEach(section => {
      if (section.columns.every(col => col.components.length === 0)) {
        issues.push({ id: `${section.id}-empty`, level: 'warning', message: `Section "${section.name}" has no components.`, target: 'section', targetId: section.id });
      }
    });

    Object.values(page.components).forEach(component => {
      const definition = componentRegistry[component.type];
      if (!definition) {
        issues.push({ id: `${component.id}-unknown`, level: 'error', message: `Unknown component type: ${component.type}.`, target: 'component', targetId: component.id });
        return;
      }
      definition.configSchema.filter(f => f.required).forEach(field => {
        const value = component.config[field.key];
        if (value === undefined || value === null || String(value).trim() === '') {
          issues.push({ id: `${component.id}-${field.key}`, level: 'error', message: `${component.name}: ${field.label} is required.`, target: 'component', targetId: component.id });
        }
      });
    });

    return issues;
  }
}

export const editorStore = new EditorStore();
