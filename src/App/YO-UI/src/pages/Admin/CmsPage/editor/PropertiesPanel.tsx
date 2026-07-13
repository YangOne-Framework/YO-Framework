import type React from 'react';
import { animationPresets } from '../../../../registry/animationPresets';
import { componentRegistry } from '../../../../registry/componentRegistry';
import { masterLayouts } from '../../../../registry/layoutPresets';
import type { YoAnimationConfig, YoComponentStyle, DeviceMode } from '../../../../types/yoPageTypes';
import { editorStore } from '../../../../store/editorStore';
import { useEditorStore } from '../../../../store/useEditorStore';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import Badge from '../../../../components/ui/badge/Badge';
import Label from '../../../../components/form/Label';
import { FileImagePicker } from '../../Layout/editors/FileImagePicker';
import { MenuBuilderEditor } from '../../Layout/editors/MenuBuilderEditor';
import { LinkListEditor } from '../../Layout/editors/LinkListEditor';
import { SocialLinksEditor } from '../../Layout/editors/SocialLinksEditor';

const selectClass = 'w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90 dark:bg-gray-900';

export function PropertiesPanel() {
  const { page, selectedComponentId, selectedSectionId } = useEditorStore();
  const component = selectedComponentId ? page.components[selectedComponentId] : null;
  const section = selectedSectionId ? page.sections.find(x => x.id === selectedSectionId) : null;

  if (!component) {
    return <PageAndSectionPanel sectionId={section?.id ?? null} />;
  }

  const definition = componentRegistry[component.type];
  if (!definition) return null;

  const isDynamic = component.type.startsWith('html-component-');

  const updateConfig = (key: string, value: unknown) => editorStore.updateComponentConfig(component.id, key, value);
  const updateStyle = (key: keyof YoComponentStyle, value: unknown) => editorStore.updateComponentStyle(component.id, key, value);
  const updateAnimation = (patch: Partial<YoAnimationConfig>) => {
    if (patch.presetId === 'none') { editorStore.updateComponentAnimation(component.id, undefined); return; }
    const current = component.animation ?? { presetId: 'fade-in', trigger: 'onView', duration: 0.55, delay: 0 };
    editorStore.updateComponentAnimation(component.id, { ...current, ...patch });
  };

  return (
    <aside className="h-full overflow-y-auto border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Selected block</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white">{definition.label}</h2>
            <p className="mt-1 max-w-64 truncate text-xs text-gray-400 dark:text-gray-500">{component.id}</p>
          </div>
          <button onClick={() => editorStore.toggleLocked(component.id)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${component.locked ? 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
            {component.locked ? 'Locked' : 'Unlocked'}
          </button>
        </div>

        <Panel title="Content" badge={definition.group === 'Layout' ? 'Layout component' : 'JSON schema driven'}>
          <LayoutContentFields componentType={component.type} config={component.config} onUpdate={updateConfig} definition={definition} />
        </Panel>

        {!isDynamic && (
          <Panel title="Style" badge="Tailwind + tokens">
            <div className="grid grid-cols-2 gap-3">
              <SmallSelect label="Padding" value={component.style.padding ?? 'none'} options={['none', 'sm', 'md', 'lg', 'xl']} onChange={value => updateStyle('padding', value)} />
              <SmallSelect label="Margin" value={component.style.margin ?? 'none'} options={['none', 'sm', 'md', 'lg', 'xl']} onChange={value => updateStyle('margin', value)} />
              <SmallSelect label="Radius" value={component.style.borderRadius ?? 'none'} options={['none', 'sm', 'md', 'lg', 'xl', 'full']} onChange={value => updateStyle('borderRadius', value)} />
              <SmallSelect label="Shadow" value={component.style.shadow ?? 'none'} options={['none', 'sm', 'md', 'lg', 'xl']} onChange={value => updateStyle('shadow', value)} />
              <SmallSelect label="Align" value={component.style.align ?? 'left'} options={['left', 'center', 'right']} onChange={value => updateStyle('align', value)} />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Border
                <input className="mt-1.5 h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600" type="checkbox" checked={Boolean(component.style.border)} onChange={e => updateStyle('border', e.target.checked)} />
              </label>
            </div>
            <div className="mt-3 space-y-3">
              <DynamicFieldRenderer field={{ key: 'backgroundColor', label: 'Background', type: 'color', defaultValue: component.style.backgroundColor ?? '#ffffff' }}
                value={component.style.backgroundColor ?? '#ffffff'} onChange={value => updateStyle('backgroundColor', value)} />
              <DynamicFieldRenderer field={{ key: 'textColor', label: 'Text Color', type: 'color', defaultValue: component.style.textColor ?? '#0f172a' }}
                value={component.style.textColor ?? '#0f172a'} onChange={value => updateStyle('textColor', value)} />
              <DynamicFieldRenderer field={{ key: 'className', label: 'Extra Tailwind Classes', type: 'text', placeholder: 'e.g. ring-1 ring-black/5 backdrop-blur' }}
                value={component.style.className ?? ''} onChange={value => updateStyle('className', value)} />
            </div>
          </Panel>
        )}

        <Panel title="Animation" badge="Product showcase presets">
          <Label>Preset</Label>
          <select className={selectClass} value={component.animation?.presetId ?? 'none'} onChange={e => updateAnimation({ presetId: e.target.value })}>
            {animationPresets.map(option => <option key={option.id} value={option.id}>{option.name} — {option.description}</option>)}
          </select>
          <div className="mt-3">
            <SmallSelect label="Trigger" value={component.animation?.trigger ?? 'onView'} options={['onLoad', 'onView', 'onHover']}
              onChange={value => updateAnimation({ trigger: value as YoAnimationConfig['trigger'] })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DynamicFieldRenderer field={{ key: 'duration', label: 'Duration', type: 'number', min: 0, max: 5 }}
              value={component.animation?.duration ?? 0.55} onChange={value => updateAnimation({ duration: Number(value) })} />
            <DynamicFieldRenderer field={{ key: 'delay', label: 'Delay', type: 'number', min: 0, max: 5 }}
              value={component.animation?.delay ?? 0} onChange={value => updateAnimation({ delay: Number(value) })} />
          </div>
        </Panel>

        <Panel title="Visibility" badge="Device control">
          {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map(device => (
            <label key={device} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Show on {device}
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600" checked={component.visibility[device]} onChange={() => editorStore.toggleComponentVisibility(component.id, device)} />
            </label>
          ))}
        </Panel>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-4 py-3 text-sm font-medium shadow-theme-xs transition justify-center dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300" onClick={() => editorStore.duplicateComponent(component.id)}>Duplicate</button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-error-50 text-error-600 border border-error-200 hover:bg-error-100 px-4 py-3 text-sm font-medium shadow-theme-xs transition justify-center dark:bg-error-500/15 dark:text-error-400 dark:border-error-500/30 dark:hover:bg-error-500/25" onClick={() => editorStore.removeComponent(component.id)}>Delete</button>
        </div>
      </div>
    </aside>
  );
}

function PageAndSectionPanel({ sectionId }: { sectionId: string | null }) {
  const { page } = useEditorStore();
  const section = sectionId ? page.sections.find(x => x.id === sectionId) : null;
  return (
    <aside className="h-full overflow-y-auto border-l border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Page settings</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white">Layout & master</h2>
          <div className="mt-5 space-y-4">
            <Label>Master layout</Label>
            <select className={selectClass} value={page.masterLayoutId ?? 'none'}
              onChange={e => editorStore.setPageMeta({ masterLayoutId: e.target.value === 'none' ? null : e.target.value })}>
              {masterLayouts.map(layout => <option key={layout.id} value={layout.id}>{layout.name}</option>)}
            </select>
            <SmallSelect label="Page width" value={page.settings.containerMode} options={['boxed', 'fluid']}
              onChange={value => editorStore.setPageSetting('containerMode', value as 'boxed' | 'fluid')} />
            <DynamicFieldRenderer field={{ key: 'backgroundColor', label: 'Page background', type: 'color' }}
              value={page.settings.backgroundColor ?? '#f8fafc'} onChange={value => editorStore.setPageSetting('backgroundColor', String(value))} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Master customization</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white">Header / Footer</h2>
          <div className="mt-5 space-y-4">
            <DynamicFieldRenderer field={{ key: 'brandName', label: 'Brand name', type: 'text' }}
              value={page.masterLayoutConfig.brandName} onChange={value => editorStore.setMasterLayoutConfig('brandName', String(value))} />
            <DynamicFieldRenderer field={{ key: 'navItems', label: 'Navigation items', type: 'text', helpText: 'Comma separated: Home, Work, Pricing' }}
              value={page.masterLayoutConfig.navItems} onChange={value => editorStore.setMasterLayoutConfig('navItems', String(value))} />
            <div className="grid grid-cols-2 gap-3">
              <DynamicFieldRenderer field={{ key: 'ctaLabel', label: 'CTA label', type: 'text' }}
                value={page.masterLayoutConfig.ctaLabel} onChange={value => editorStore.setMasterLayoutConfig('ctaLabel', String(value))} />
              <DynamicFieldRenderer field={{ key: 'ctaUrl', label: 'CTA URL', type: 'url' }}
                value={page.masterLayoutConfig.ctaUrl} onChange={value => editorStore.setMasterLayoutConfig('ctaUrl', String(value))} />
            </div>
            <SmallSelect label="Header style" value={page.masterLayoutConfig.headerStyle} options={['clean', 'glass', 'dark']}
              onChange={value => editorStore.setMasterLayoutConfig('headerStyle', value as 'clean' | 'glass' | 'dark')} />
            <DynamicFieldRenderer field={{ key: 'footerText', label: 'Footer text', type: 'text' }}
              value={page.masterLayoutConfig.footerText} onChange={value => editorStore.setMasterLayoutConfig('footerText', String(value))} />
          </div>
        </div>

        {section ? <SectionSettings sectionId={section.id} /> : null}
      </div>
    </aside>
  );
}

function SectionSettings({ sectionId }: { sectionId: string }) {
  const { page } = useEditorStore();
  const section = page.sections.find(x => x.id === sectionId);
  if (!section) return null;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Selected section</p>
      <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white">{section.name}</h2>
      <div className="mt-5 space-y-4">
        <DynamicFieldRenderer field={{ key: 'name', label: 'Section name', type: 'text' }}
          value={section.name} onChange={value => editorStore.updateSection(section.id, s => { s.name = String(value); })} />
        <SmallSelect label="Section width" value={section.settings.layoutMode} options={['boxed', 'fluid']}
          onChange={value => editorStore.updateSection(section.id, s => { s.settings.layoutMode = value as 'boxed' | 'fluid'; s.settings.fullWidth = value === 'fluid'; })} />
        <SmallSelect label="Vertical padding" value={section.settings.paddingY} options={['none', 'sm', 'md', 'lg', 'xl']}
          onChange={value => editorStore.updateSection(section.id, s => { s.settings.paddingY = value as any; })} />
        <DynamicFieldRenderer field={{ key: 'backgroundColor', label: 'Background', type: 'color' }}
          value={section.settings.backgroundColor ?? '#ffffff'} onChange={value => editorStore.updateSection(section.id, s => { s.settings.backgroundColor = String(value); })} />
        <DynamicFieldRenderer field={{ key: 'backgroundImage', label: 'Background image URL', type: 'image' }}
          value={section.settings.backgroundImage ?? ''} onChange={value => editorStore.updateSection(section.id, s => { s.settings.backgroundImage = String(value); })} />
        <DynamicFieldRenderer field={{ key: 'className', label: 'Extra classes', type: 'text' }}
          value={section.settings.className ?? ''} onChange={value => editorStore.updateSection(section.id, s => { s.settings.className = String(value); })} />
      </div>
    </div>
  );
}

function LayoutContentFields({ componentType, config, onUpdate, definition }: {
  componentType: string;
  config: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  definition: typeof componentRegistry[string];
}) {
  if (componentType === 'layout-header') {
    return (
      <div className="space-y-3">
        <FileImagePicker value={String(config.logoUrl ?? '')} onChange={v => onUpdate('logoUrl', v)} label="Logo" />
        <DynamicFieldRenderer field={{ key: 'logoAlt', label: 'Logo alt text', type: 'text', defaultValue: 'Logo' }} value={config.logoAlt} onChange={v => onUpdate('logoAlt', v)} />
        <DynamicFieldRenderer field={{ key: 'brandName', label: 'Brand name (fallback)', type: 'text', defaultValue: 'SiteName' }} value={config.brandName} onChange={v => onUpdate('brandName', v)} />
        <MenuBuilderEditor value={Array.isArray(config.navItems) ? config.navItems : []} onChange={v => onUpdate('navItems', v)} />
        <div className="grid grid-cols-2 gap-2">
          <DynamicFieldRenderer field={{ key: 'ctaLabel', label: 'CTA label', type: 'text', defaultValue: '' }} value={config.ctaLabel} onChange={v => onUpdate('ctaLabel', v)} />
          <DynamicFieldRenderer field={{ key: 'ctaUrl', label: 'CTA URL', type: 'url', defaultValue: '#' }} value={config.ctaUrl} onChange={v => onUpdate('ctaUrl', v)} />
        </div>
        <DynamicFieldRenderer field={{ key: 'ctaVariant', label: 'CTA style', type: 'select', defaultValue: 'primary', options: [{ label: 'Primary (dark)', value: 'primary' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }] }} value={config.ctaVariant} onChange={v => onUpdate('ctaVariant', v)} />
        <DynamicFieldRenderer field={{ key: 'headerStyle', label: 'Header style', type: 'select', defaultValue: 'glass', options: [{ label: 'Clean', value: 'clean' }, { label: 'Glass', value: 'glass' }, { label: 'Dark', value: 'dark' }] }} value={config.headerStyle} onChange={v => onUpdate('headerStyle', v)} />
      </div>
    );
  }

  if (componentType === 'layout-footer') {
    return (
      <div className="space-y-3">
        <FileImagePicker value={String(config.logoUrl ?? '')} onChange={v => onUpdate('logoUrl', v)} label="Logo" />
        <DynamicFieldRenderer field={{ key: 'logoAlt', label: 'Logo alt text', type: 'text', defaultValue: 'Logo' }} value={config.logoAlt} onChange={v => onUpdate('logoAlt', v)} />
        <DynamicFieldRenderer field={{ key: 'brandName', label: 'Brand name (fallback)', type: 'text', defaultValue: 'SiteName' }} value={config.brandName} onChange={v => onUpdate('brandName', v)} />
        <DynamicFieldRenderer field={{ key: 'description', label: 'Description', type: 'textarea' }} value={config.description} onChange={v => onUpdate('description', v)} />
        <DynamicFieldRenderer field={{ key: 'position', label: 'Content position', type: 'select', defaultValue: 'center', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] }} value={config.position} onChange={v => onUpdate('position', v)} />
        <LinkListEditor value={Array.isArray(config.quickLinks) ? config.quickLinks : []} onChange={v => onUpdate('quickLinks', v)} label="Quick links" />
        <SocialLinksEditor value={Array.isArray(config.socialLinks) ? config.socialLinks : []} onChange={v => onUpdate('socialLinks', v)} />
        <DynamicFieldRenderer field={{ key: 'footerText', label: 'Copyright text', type: 'text', helpText: 'Leave empty for auto copyright' }} value={config.footerText} onChange={v => onUpdate('footerText', v)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {definition.configSchema.map(field => (
        <DynamicFieldRenderer key={field.key} field={field} value={config[field.key]} onChange={value => onUpdate(field.key, value)} />
      ))}
    </div>
  );
}

function Panel({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return <section className="mb-6 space-y-3 border-b border-gray-100 pb-5 dark:border-gray-700">
    <div className="flex items-end justify-between gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</h3>
      {badge ? <Badge variant="light" size="sm">{badge}</Badge> : null}
    </div>{children}
  </section>;
}

function SmallSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{label}
    <select className={`${selectClass} mt-1 normal-case`} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;
}
