import type React from 'react';
import { useMemo } from 'react';
import { componentDefinitions } from '../../../../registry/componentRegistry';
import { layoutPresets } from '../../../../registry/layoutPresets';
import { editorStore } from '../../../../store/editorStore';
import { useEditorStore } from '../../../../store/useEditorStore';
import { YOThemeProvider, buildTokenCss, parseThemeConfig } from '../../../../context/YOThemeContext';
import { useGetActiveThemeQuery } from '../../../../redux/theme/themeAPI';
import { ComponentRenderer } from '../../../../renderer/ComponentRenderer';
import { responsiveColumnClasses } from '../../../../utils/style';
import type { YoColumn, YoSection, DeviceMode } from '../../../../types/yoPageTypes';

const LAYOUT_ZONE_IDS = ['layout-header', 'layout-sidebar', 'layout-footer'] as const;

export function CanvasEditor() {
  const { page, selectedComponentId, activeDevice, editingLayout } = useEditorStore();
  const { data: activeTheme } = useGetActiveThemeQuery();

  const themeConfig = useMemo(() => {
    if (!activeTheme?.Config) return null;
    return parseThemeConfig(activeTheme.Config);
  }, [activeTheme]);

  const cssVars = useMemo(() => {
    if (!themeConfig?.tokens) return "";
    return buildTokenCss(themeConfig.tokens);
  }, [themeConfig]);

  const renderedSections: React.ReactNode[] = [];
  for (let i = 0; i < page.sections.length; i++) {
    const section = page.sections[i];
    const isLastSection = i === page.sections.length - 1;
    renderedSections.push(
      <SectionEditor key={section.id} section={section} index={i} selectedComponentId={selectedComponentId} activeDevice={activeDevice} />
    );
    if (editingLayout && isLastSection && section.id !== 'layout-footer') {
      renderedSections.push(<PageContentPlaceholder key="page-content-placeholder" />);
    }
  }

  const canvas = (
    <main className="relative h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-950">
      <div className="relative mx-auto space-y-5 transition-all duration-300 rounded-2xl shadow-theme-md" style={{ maxWidth: activeDevice === 'mobile' ? '430px' : activeDevice === 'tablet' ? '820px' : '1180px', backgroundColor: page.settings.backgroundColor ?? '#ffffff', minHeight: '90%' }}>
        <CanvasHeader />
        {page.sections.length === 0 ? <EmptyCanvas /> : null}
        {renderedSections}
        {page.sections.length > 0 && !editingLayout && <BottomAddSection />}
      </div>
    </main>
  );

  if (!themeConfig) return canvas;

  return (
    <YOThemeProvider themeConfig={themeConfig}>
      <style>{`:root { ${cssVars} }`}</style>
      {canvas}
    </YOThemeProvider>
  );
}

function PageContentPlaceholder() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 p-12 text-center shadow-theme-sm dark:border-gray-600 dark:bg-gray-900/50">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200 text-xl text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h8M8 14h8" /></svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-500 dark:text-gray-400">Page Content</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-400 dark:text-gray-500">
        This area is reserved for page-level content and is not editable in the layout builder.
      </p>
    </div>
  );
}

function BottomAddSection() {
  return (
    <div className="flex justify-center pb-6 pt-2">
      <select
        className="w-64 appearance-none rounded-lg border border-dashed border-gray-300 bg-white/80 px-4 py-3 text-sm text-gray-500 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-400"
        defaultValue=""
        onChange={e => { if (e.target.value) { editorStore.addSection(e.target.value); e.target.value = ''; } }}
      >
        <option value="">+ Add Section</option>
        {layoutPresets.map(preset => (
          <option key={preset.id} value={preset.id}>{preset.name}</option>
        ))}
      </select>
    </div>
  );
}

function CanvasHeader() {
  const { page, activeDevice } = useEditorStore();
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-theme-md backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Live composition canvas</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white">{page.title}</h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <span className="rounded-md bg-white px-3 py-1 shadow-theme-xs dark:bg-gray-900">{activeDevice}</span>
          <span className="px-2">{page.settings.containerMode}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/85 p-12 text-center shadow-theme-sm backdrop-blur dark:border-gray-600 dark:bg-gray-900/85">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white shadow-theme-xs">+</div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Start with a real layout</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">Pick a row structure, then drag polished content blocks from the left palette.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {layoutPresets.slice(0, 8).map(preset => (
          <button key={preset.id} onClick={() => editorStore.addSection(preset.id)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-theme-xs transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-theme-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{preset.name}</div>
            <div className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionEditor({ section, index, selectedComponentId, activeDevice }: { section: YoSection; index: number; selectedComponentId: string | null; activeDevice: DeviceMode }) {
  const { editingLayout } = useEditorStore();
  const selected = useEditorStore().selectedSectionId === section.id;
  const collapsed = Boolean(section.collapsed);
  const isLayoutZone = editingLayout && (LAYOUT_ZONE_IDS as readonly string[]).includes(section.id);
  return (
    <section className={`overflow-hidden rounded-2xl border bg-white/90 shadow-theme-md backdrop-blur transition ${selected ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-gray-200 dark:border-gray-700'} dark:bg-gray-900/90`}
      onClick={() => editorStore.selectSection(section.id)}>
      <div className="border-b border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-base font-bold text-gray-700 hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={(e) => { e.stopPropagation(); editorStore.updateSection(section.id, s => { s.collapsed = !s.collapsed; }); }}
              title={collapsed ? 'Expand section' : 'Collapse section'}>
              {collapsed ? '\u25B8' : '\u25BE'}
            </button>
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{isLayoutZone ? 'Layout Zone' : `Section ${index + 1}`} &middot; {section.layoutPresetId}</div>
              <input className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-2 text-lg font-semibold tracking-tight text-gray-900 outline-none hover:border-gray-200 focus:border-gray-300 focus:bg-white dark:text-white dark:hover:border-gray-600 dark:focus:border-gray-600 dark:focus:bg-gray-800"
                value={section.name} onChange={e => editorStore.updateSection(section.id, s => { s.name = e.target.value; })} readOnly={isLayoutZone} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isLayoutZone && (
              <select className="appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden min-w-40 dark:border-gray-700 dark:text-white/90 dark:bg-gray-900" value={section.layoutPresetId} onChange={e => changeLayout(section, e.target.value)}>
                {layoutPresets.map(preset => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
              </select>
            )}
            <select className="appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90 dark:bg-gray-900"
              value={section.settings.layoutMode}
              onChange={e => editorStore.updateSection(section.id, s => { s.settings.layoutMode = e.target.value as 'boxed' | 'fluid'; s.settings.fullWidth = e.target.value === 'fluid'; })}
              title="Section width">
              <option value="boxed">Boxed section</option>
              <option value="fluid">Fluid section</option>
            </select>
            {!isLayoutZone && (
              <>
                <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 shadow-theme-xs transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); editorStore.moveSection(section.id, -1); }} title="Move up">{'\u2191'}</button>
                <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 shadow-theme-xs transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); editorStore.moveSection(section.id, 1); }} title="Move down">{'\u2193'}</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-4 py-3 text-sm font-medium shadow-theme-xs transition dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300" onClick={(e) => { e.stopPropagation(); editorStore.duplicateSection(section.id); }}>Duplicate</button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-error-50 text-error-600 border border-error-200 hover:bg-error-100 px-4 py-3 text-sm font-medium shadow-theme-xs transition dark:bg-error-500/15 dark:text-error-400 dark:border-error-500/30 dark:hover:bg-error-500/25" onClick={(e) => { e.stopPropagation(); editorStore.removeSection(section.id); }}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
      {!collapsed ? (
        <div className={section.settings.layoutMode === 'fluid' ? 'p-4' : 'mx-auto max-w-6xl p-4'}>
          <div className="grid grid-cols-12 gap-4">
            {section.columns.map(column => <ColumnDropZone key={column.id} section={section} column={column} selectedComponentId={selectedComponentId} activeDevice={activeDevice} />)}
          </div>
        </div>
      ) : (
        <button className="block w-full bg-gray-50 px-5 py-4 text-left text-sm font-medium text-gray-500 hover:bg-gray-100 transition dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={(e) => { e.stopPropagation(); editorStore.updateSection(section.id, s => { s.collapsed = false; }); }}>
          Collapsed &middot; {section.columns.reduce((sum, col) => sum + col.components.length, 0)} component(s). Click to expand.
        </button>
      )}
    </section>
  );
}

function changeLayout(section: YoSection, presetId: string) {
  const preset = layoutPresets.find(x => x.id === presetId);
  if (!preset) return;
  editorStore.updateSection(section.id, s => {
    const existingColumns = s.columns;
    const allComponents = existingColumns.flatMap(c => c.components);
    s.layoutPresetId = preset.id;
    s.name = preset.name;
    s.columns = preset.columns.map((span, index) => ({
      id: existingColumns[index]?.id ?? `col_${Date.now()}_${index}`,
      title: `Room ${index + 1}`, span, components: []
    }));
    allComponents.forEach((componentId, index) => {
      s.columns[index % s.columns.length].components.push(componentId);
    });
  });
}

function ColumnDropZone({ section, column, selectedComponentId, activeDevice }: { section: YoSection; column: YoColumn; selectedComponentId: string | null; activeDevice: DeviceMode }) {
  const { page } = useEditorStore();
  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('component/type');
    const existingId = event.dataTransfer.getData('component/id');
    if (type) editorStore.addComponent(section.id, column.id, type);
    else if (existingId) editorStore.moveComponent(existingId, section.id, column.id);
  };
  return (
    <div className={responsiveColumnClasses(column.span.desktop, column.span.tablet, column.span.mobile)}>
      <div onDragOver={event => event.preventDefault()} onDrop={onDrop}
        className="min-h-44 rounded-xl border border-dashed border-gray-200 bg-gray-50/90 p-3 transition hover:border-gray-400 hover:bg-white dark:border-gray-600 dark:bg-gray-800/90 dark:hover:border-gray-500 dark:hover:bg-gray-800">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{column.title}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{column.span.desktop}/12 desktop &middot; {column.span.tablet}/12 tablet</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-0.5 text-xs font-medium text-gray-400 shadow-theme-xs dark:bg-gray-800 dark:text-gray-500">Drop zone</span>
        </div>
        <div className="space-y-3">
          {column.components.map(componentId => {
            const component = page.components[componentId];
            if (!component) return null;
            const selected = selectedComponentId === component.id;
            return (
              <div key={component.id} draggable={!component.locked}
                onDragStart={event => event.dataTransfer.setData('component/id', component.id)}
                onClick={event => { event.stopPropagation(); editorStore.selectComponent(component.id); }}
                className={`group relative rounded-xl border bg-white p-3 shadow-theme-xs transition dark:bg-gray-900 ${selected ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-gray-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-theme-sm dark:border-gray-700 dark:hover:border-gray-600'}`}>
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
                  <span className="font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{component.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800 dark:text-gray-400">{component.locked ? 'Locked' : 'Drag'}</span>
                </div>
                <ComponentRenderer instance={component} device={activeDevice} isEditing />
              </div>
            );
          })}
          {column.components.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white/80 p-8 text-center dark:border-gray-600 dark:bg-gray-900/80">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Drop component here</div>
              <div className="mt-1 text-xs leading-5 text-gray-400 dark:text-gray-500">Drag from palette. Blocks stay side-by-side based on the selected column layout.</div>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {componentDefinitions.slice(0, 5).map(def => <span key={def.type} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">{def.label}</span>)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
