import { useState } from "react";
import Label from "../../../../components/form/Label";

interface MenuItem {
  label: string;
  url: string;
  children?: MenuItem[];
}

function emptyItem(): MenuItem {
  return { label: "", url: "" };
}

function MenuItemRow({ item, index, onChange, onDelete }: { item: MenuItem; index: number; onChange: (item: MenuItem) => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800">{index + 1}</span>
        <input className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-gray-900 outline-none hover:border-gray-300 focus:border-gray-300 dark:text-white"
          value={item.label} placeholder="Label" onChange={(e) => onChange({ ...item, label: e.target.value })} />
        <input className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-gray-500 outline-none hover:border-gray-300 focus:border-gray-300 dark:text-gray-400"
          value={item.url} placeholder="/url" onChange={(e) => onChange({ ...item, url: e.target.value })} />
        <button className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setExpanded(!expanded)}>
          {item.children?.length ? `Sub (${item.children.length})` : "Sub"}
        </button>
        <button className="shrink-0 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={onDelete}>×</button>
      </div>
      {expanded && (
        <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-200 pl-3 dark:border-gray-700">
          {(item.children ?? []).map((child, ci) => (
            <div key={ci} className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{index + 1}.{ci + 1}</span>
              <input className="min-w-0 flex-1 rounded border border-transparent bg-gray-50 px-2 py-1 text-sm text-gray-900 outline-none hover:border-gray-300 focus:border-gray-300 dark:bg-gray-800 dark:text-white"
                value={child.label} placeholder="Label" onChange={(e) => {
                  const updated = [...(item.children ?? [])];
                  updated[ci] = { ...child, label: e.target.value };
                  onChange({ ...item, children: updated });
                }} />
              <input className="min-w-0 flex-1 rounded border border-transparent bg-gray-50 px-2 py-1 text-sm text-gray-500 outline-none hover:border-gray-300 focus:border-gray-300 dark:bg-gray-800 dark:text-gray-400"
                value={child.url} placeholder="/url" onChange={(e) => {
                  const updated = [...(item.children ?? [])];
                  updated[ci] = { ...child, url: e.target.value };
                  onChange({ ...item, children: updated });
                }} />
              <button className="shrink-0 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => {
                const updated = (item.children ?? []).filter((_, i) => i !== ci);
                onChange({ ...item, children: updated.length ? updated : undefined });
              }}>×</button>
            </div>
          ))}
          <button className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400" onClick={() => {
            const updated = [...(item.children ?? []), emptyItem()];
            onChange({ ...item, children: updated });
          }}>+ Add submenu</button>
        </div>
      )}
    </div>
  );
}

export function MenuBuilderEditor({ value, onChange }: { value: MenuItem[]; onChange: (items: MenuItem[]) => void }) {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (index: number, item: MenuItem) => {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Navigation menu</Label>
        <button className="rounded-lg bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600" onClick={() => onChange([...items, emptyItem()])}>+ Add item</button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <MenuItemRow key={i} item={item} index={i} onChange={(it) => updateItem(i, it)} onDelete={() => onChange(items.filter((_, idx) => idx !== i))} />
        ))}
        {items.length === 0 && <p className="rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-400 dark:bg-gray-800">No menu items. Click "Add item" to start.</p>}
      </div>
    </div>
  );
}
