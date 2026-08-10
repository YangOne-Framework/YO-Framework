import { ChevronRight, Redo2, Undo2 } from 'lucide-react';
import { editorStore } from '../../../../store/editorStore';
import { useEditorStore } from '../../../../store/useEditorStore';

export function CanvasStatusBar() {
  const { page, selectedSectionId, selectedComponentId, history, future } = useEditorStore();
  const section = selectedSectionId ? page.sections.find(s => s.id === selectedSectionId) : undefined;
  const component = selectedComponentId ? page.components[selectedComponentId] : undefined;

  const crumbBase = 'max-w-40 truncate rounded px-2 py-1 transition';
  const crumbActive = 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400';
  const crumbInactive = 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5';

  return (
    <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-3 py-1.5 dark:border-gray-800 dark:bg-gray-900">
      <nav className="flex min-w-0 items-center gap-1 text-xs font-medium">
        <button
          onClick={() => { editorStore.selectComponent(null); editorStore.selectSection(null); }}
          className={`${crumbBase} ${!section && !component ? crumbActive : crumbInactive}`}>
          page
        </button>
        {section ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            <button
              onClick={() => editorStore.selectComponent(null)}
              className={`${crumbBase} ${!component ? crumbActive : crumbInactive}`}>
              {section.name}
            </button>
          </>
        ) : null}
        {component ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            <span className={`${crumbBase} ${crumbActive}`}>{component.name}</span>
          </>
        ) : null}
      </nav>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => editorStore.undo()}
          disabled={history.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-white/5">
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </button>
        <button
          onClick={() => editorStore.redo()}
          disabled={future.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-white/5">
          <Redo2 className="h-3.5 w-3.5" /> Redo
        </button>
      </div>
    </div>
  );
}
