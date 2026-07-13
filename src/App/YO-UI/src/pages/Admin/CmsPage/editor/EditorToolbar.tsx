import { useMemo, useState } from 'react';
import { layoutPresets } from '../../../../registry/layoutPresets';
import { localStorageDb } from '../../../../services/localStorageDb';
import { editorStore } from '../../../../store/editorStore';
import { useEditorStore } from '../../../../store/useEditorStore';
import { MdDesktopWindows, MdTablet, MdPhoneAndroid, MdUndo, MdRedo } from 'react-icons/md';

function AddSectionDropdown() {
  return (
    <select
      className="appearance-none rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 pr-8 text-xs font-medium text-gray-700 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90 dark:bg-gray-900"
      onChange={e => { if (e.target.value) { editorStore.addSection(e.target.value); e.target.value = ''; } }}
      defaultValue=""
    >
      <option value="">+ Add Section</option>
      {layoutPresets.map(preset => (
        <option key={preset.id} value={preset.id}>{preset.name}</option>
      ))}
    </select>
  );
}

export function EditorToolbar({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { page, dirty, activeDevice, history, future, editingLayout } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const issues = editorStore.validate();
  const hasErrors = issues.some(x => x.level === 'error');
  const isLayoutEdit = !!editingLayout;

  const save = async () => {
    setSaving(true);
    try {
      if (isLayoutEdit && editingLayout) {
        const currentPage = editorStore.getState().page;
        const zones = {
          header: currentPage.sections.find(s => s.id === 'layout-header')?.columns[0]?.components ?? [],
          sidebar: currentPage.sections.find(s => s.id === 'layout-sidebar')?.columns[0]?.components ?? [],
          footer: currentPage.sections.find(s => s.id === 'layout-footer')?.columns[0]?.components ?? [],
        };
        await localStorageDb.saveLayoutDesign(editingLayout, zones, currentPage.components);
        editorStore.markClean();
        return;
      }
      const saved = await localStorageDb.savePage(page);
      editorStore.markClean(saved);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (isLayoutEdit) { await save(); return; }
    if (hasErrors) { alert('Fix validation errors before publishing.'); return; }
    setSaving(true);
    try {
      const published = await localStorageDb.publishPage(page);
      editorStore.markClean(published);
    } finally {
      setSaving(false);
    }
  };

  const deviceIcons: Record<string, React.ReactNode> = {
    desktop: <MdDesktopWindows size={18} />,
    tablet: <MdTablet size={18} />,
    mobile: <MdPhoneAndroid size={18} />,
  };

  return (
    <header className="border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/95">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
            <button className="rounded-md px-3 py-1.5 text-xs font-medium bg-white text-gray-900 shadow-theme-xs dark:bg-gray-900 dark:text-white"
              onClick={() => onNavigate(isLayoutEdit ? 'layouts' : 'pages')}>{isLayoutEdit ? 'Layouts' : 'Pages'}</button>
            {!isLayoutEdit && (
              <button className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => onNavigate('layouts')}>Layouts</button>
            )}
          </div>
          {isLayoutEdit && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
              Layout Editor
            </span>
          )}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          {!isLayoutEdit && (
            <button className="inline-flex items-center gap-1 rounded-lg bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-3 py-1.5 text-xs font-medium shadow-theme-xs transition dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              onClick={async () => { if (dirty) await save(); onNavigate('preview'); }}>
              Preview
            </button>
          )}
          <button className="inline-flex items-center gap-1 rounded-lg bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-3 py-1.5 text-xs font-medium shadow-theme-xs transition disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={save} disabled={saving}>
            {saving ? 'Saving...' : `Save${dirty ? '*' : ''}`}
          </button>
          {!isLayoutEdit && (
            <button className="inline-flex items-center gap-1 rounded-lg bg-brand-500 text-white shadow-theme-xs px-3 py-1.5 text-xs font-medium hover:bg-brand-600 transition disabled:opacity-50"
              onClick={publish} disabled={saving}>
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {!isLayoutEdit && (
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          )}
          {!isLayoutEdit && <AddSectionDropdown />}
        </div>

        <div className="flex-1 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
            {(['desktop', 'tablet', 'mobile'] as const).map(device => (
              <button key={device}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activeDevice === device
                    ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => editorStore.setDevice(device)}>
                {deviceIcons[device]}
                <span className="capitalize">{device}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            disabled={history.length === 0} onClick={() => editorStore.undo()} title="Undo">
            <MdUndo size={18} />
          </button>
          <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            disabled={future.length === 0} onClick={() => editorStore.redo()} title="Redo">
            <MdRedo size={18} />
          </button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="text-right min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">{page.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-48">/{page.slug}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
