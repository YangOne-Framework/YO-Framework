import { useState } from 'react';
import { localStorageDb } from '../../../../services/localStorageDb';
import { editorStore } from '../../../../store/editorStore';
import { useEditorStore } from '../../../../store/useEditorStore';
import { ArrowLeft, ExternalLink, Redo2, Undo2 } from 'lucide-react';

export function EditorToolbar({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { page, dirty, history, future, editingLayout } = useEditorStore();
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

  return (
    <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={() => onNavigate(isLayoutEdit ? 'layouts' : 'pages')}
        title={isLayoutEdit ? 'Back to layouts' : 'Back to pages'}
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">{page.title}</span>
          {dirty ? <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning-500" title="Unsaved changes" /> : null}
        </div>
        <div className="truncate text-[11px] leading-4 text-gray-400 dark:text-gray-500">/{page.slug}</div>
      </div>

      {isLayoutEdit ? (
        <span className="inline-flex items-center rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
          Layout Editor
        </span>
      ) : null}

      <div className="flex-1" />

      {!isLayoutEdit ? (
        <button
          onClick={async () => { if (dirty) await save(); onNavigate('preview'); }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
          Preview <ExternalLink className="h-3.5 w-3.5" />
        </button>
      ) : null}

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
        {saving ? 'Saving...' : 'Save'}
      </button>

      {!isLayoutEdit ? (
        <button
          onClick={publish}
          disabled={saving}
          className="inline-flex items-center rounded-lg bg-brand-500 px-3.5 py-1.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-50">
          {saving ? 'Publishing...' : 'Publish'}
        </button>
      ) : null}

      <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => editorStore.undo()}
          disabled={history.length === 0}
          title="Undo"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200">
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editorStore.redo()}
          disabled={future.length === 0}
          title="Redo"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200">
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
