import { componentDefinitions } from '../../../../registry/componentRegistry';
import Badge from '../../../../components/ui/badge/Badge';

const groupTone: Record<string, string> = {
  Basic: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  Marketing: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  Media: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  Layout: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  Data: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30'
};

export function ComponentPalette() {
  const groups = componentDefinitions.reduce<Record<string, typeof componentDefinitions>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className="h-full overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Builder kit</p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white">Blocks</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">Drag a block into any room. Section layout controls decide if blocks sit full-row, 2-column, 3-column, 1:5, and more.</p>
      </div>
      <div className="mt-4 space-y-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium ${groupTone[group] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{group}</span>
              <Badge variant="light" size="sm">{items.length}</Badge>
            </div>
            <div className="space-y-2">
              {items.map(def => (
                <button key={def.type} draggable
                  onDragStart={event => event.dataTransfer.setData('component/type', def.type)}
                  className="group w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-theme-xs transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-theme-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                  title="Drag this component into a room">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{def.label}</div>
                      <div className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400">{def.description}</div>
                    </div>
                    <Badge variant="light" size="sm">DRAG</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
