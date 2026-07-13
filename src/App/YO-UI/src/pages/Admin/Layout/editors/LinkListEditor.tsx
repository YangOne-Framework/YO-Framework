import Label from "../../../../components/form/Label";

interface LinkItem {
  label: string;
  url: string;
}

export function LinkListEditor({ value, onChange, label }: { value: LinkItem[]; onChange: (items: LinkItem[]) => void; label: string }) {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (index: number, item: LinkItem) => {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button className="rounded-lg bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600"
          onClick={() => onChange([...items, { label: "", url: "" }])}>+ Add</button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800">{i + 1}</span>
            <input className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-gray-900 outline-none hover:border-gray-300 focus:border-gray-300 dark:text-white"
              value={item.label} placeholder="Label" onChange={(e) => updateItem(i, { ...item, label: e.target.value })} />
            <input className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-gray-500 outline-none hover:border-gray-300 focus:border-gray-300 dark:text-gray-400"
              value={item.url} placeholder="/url" onChange={(e) => updateItem(i, { ...item, url: e.target.value })} />
            <button className="shrink-0 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}>×</button>
          </div>
        ))}
        {items.length === 0 && <p className="rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-400 dark:bg-gray-800">No items.</p>}
      </div>
    </div>
  );
}
