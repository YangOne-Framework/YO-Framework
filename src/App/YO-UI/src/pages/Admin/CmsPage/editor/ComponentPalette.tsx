import { componentDefinitions, getComponentRegistryVersion, subscribeComponentRegistry } from '../../../../registry/componentRegistry';
import { layoutPresets } from '../../../../registry/layoutPresets';
import { editorStore } from '../../../../store/editorStore';
import { useEditorStore } from '../../../../store/useEditorStore';
import { resolveImageUrl } from '../../../../utils/image';
import { StudioThemeProvider } from '../../../../context/StudioThemeContext';
import { useGetActiveStudioThemeQuery } from '../../../../redux/theme/themeStudioAPI';
import { buildTokenCss, parseThemeConfig } from '../../../../services/runtimeThemeCss';
import type { YoComponentDefinition } from '../../../../types/yoPageTypes';
import Badge from '../../../../components/ui/badge/Badge';
import { ChevronDown, Image as ImageIcon, Plus, Search } from 'lucide-react';
import { Component, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';

const groupTone: Record<string, string> = {
  Basic: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  Marketing: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  Media: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  Layout: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  Data: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30'
};

export function ComponentPalette() {
  const [query, setQuery] = useState('');
  const { editingLayout } = useEditorStore();
  useSyncExternalStore(subscribeComponentRegistry, getComponentRegistryVersion);

  const groups: Record<string, typeof componentDefinitions> = {};
  for (const item of componentDefinitions) {
    (groups[item.group] ??= []).push(item);
  }

  const q = query.trim().toLowerCase();
  const filtered: Record<string, typeof componentDefinitions> = {};
  for (const [group, items] of Object.entries(groups)) {
    const matched = q
      ? items.filter(def =>
          def.label.toLowerCase().includes(q) ||
          def.description.toLowerCase().includes(q) ||
          def.type.toLowerCase().includes(q)
        )
      : items;
    if (matched.length) filtered[group] = matched;
  }

  return (
    <aside className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 pb-3 pt-4 dark:border-gray-800">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">UI Library</p>
        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search blocks..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
        <PaletteThemeScope>
        {Object.entries(filtered).map(([group, items]) => (
          <details key={group} open className="group mb-1">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-2 transition hover:bg-gray-50 dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-1.5">
                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition group-open:rotate-180" />
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${groupTone[group] ?? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>{group}</span>
              </span>
              <Badge variant="light" size="sm">{items.length}</Badge>
            </summary>
            <div className="mb-2 grid grid-cols-1 gap-2 px-1 pt-1">
              {items.map(def => (
                <div
                  key={def.type}
                  draggable
                  onDragStart={event => event.dataTransfer.setData('component/type', def.type)}
                  title={`${def.description} — drag into a room`}
                  className="group/card flex cursor-grab flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-theme-xs transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-theme-sm active:cursor-grabbing dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
                  <div className="aspect-video w-full overflow-hidden border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                    <PreviewThumb def={def} />
                  </div>
                  <div className="p-2">
                    <div className="line-clamp-1 text-xs font-semibold text-gray-900 dark:text-white">{def.label}</div>
                    <div className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-gray-500 dark:text-gray-400">{def.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
        {Object.keys(filtered).length === 0 && (
          <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">No blocks match your search.</div>
        )}
        </PaletteThemeScope>
      </div>

      {/* Footer action */}
      {!editingLayout && (
        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <div className="relative">
            <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
            <select
              defaultValue=""
              onChange={e => { if (e.target.value) { editorStore.addSection(e.target.value); e.target.value = ''; } }}
              className="w-full appearance-none rounded-lg border border-brand-500 bg-transparent py-2.5 pl-9 pr-3 text-sm font-medium text-brand-500 transition hover:bg-brand-50 focus:outline-hidden dark:text-brand-400 dark:hover:bg-brand-500/10">
              <option value="">Add Section</option>
              {layoutPresets.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </aside>
  );
}

function PreviewThumb({ def }: { def: YoComponentDefinition }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (def.previewImage && !imageFailed) {
    return (
      <img
        src={resolveImageUrl(def.previewImage)}
        alt={def.label}
        loading="lazy"
        onError={() => setImageFailed(true)}
        className="h-full w-full object-cover object-top"
      />
    );
  }

  const Renderer = def.renderer;
  return (
    <div className="pointer-events-none h-full w-full select-none overflow-hidden bg-white dark:bg-gray-900">
      <ThumbBoundary>
        <div className="w-[250%] origin-top-left scale-[0.4]">
          <Renderer config={def.defaultConfig} style={def.defaultStyle} isEditing={false} />
        </div>
      </ThumbBoundary>
    </div>
  );
}

function PaletteThemeScope({ children }: { children: ReactNode }) {
  const { data: activeTheme } = useGetActiveStudioThemeQuery();
  const themeConfig = useMemo(() => (activeTheme?.Config ? parseThemeConfig(activeTheme.Config) : null), [activeTheme]);
  const cssVars = useMemo(() => (themeConfig?.tokens ? buildTokenCss(themeConfig.tokens) : ''), [themeConfig]);
  return (
    <StudioThemeProvider themeConfig={themeConfig}>
      <style>{cssVars}</style>
      {children}
    </StudioThemeProvider>
  );
}

class ThumbBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
          <ImageIcon className="h-7 w-7" />
        </div>
      );
    }
    return this.props.children;
  }
}
