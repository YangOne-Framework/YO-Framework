import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  useDeleteThemeScopeMutation,
  useGetThemeScopesQuery,
  useSaveThemeScopeMutation,
} from "../../../../redux/theme/themeStudioAPI";
import { SectionShell, type StudioSectionProps } from "../studioShared";

export function ScopedStylesSection({ guid }: StudioSectionProps) {
  const { data: scopes = [], isLoading } = useGetThemeScopesQuery(guid);
  const [saveScope, { isLoading: saving }] = useSaveThemeScopeMutation();
  const [deleteScope] = useDeleteThemeScopeMutation();
  const [draft, setDraft] = useState({ name: "", scopeKey: "", selector: "", overrideJson: "{}" });
  const validJson = useMemo(() => { try { JSON.parse(draft.overrideJson); return true; } catch { return false; } }, [draft.overrideJson]);

  const add = async () => {
    if (!draft.name.trim() || !draft.scopeKey.trim() || !draft.selector.trim() || !validJson) return;
    try {
      await saveScope({ YOThemeUniqueId: guid, Name: draft.name.trim(), ScopeKey: draft.scopeKey.trim(), Selector: draft.selector.trim(), OverrideJson: draft.overrideJson }).unwrap();
      setDraft({ name: "", scopeKey: "", selector: "", overrideJson: "{}" });
      toast.success("Scoped style saved");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Scoped style could not be saved"); }
  };

  return <SectionShell title="Scoped Styles" description="Apply token overrides to a CSS selector, route shell or feature scope. Compiler output remains isolated from the global theme.">
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Marketing hero" className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400" />
        <input value={draft.scopeKey} onChange={(e) => setDraft({ ...draft, scopeKey: e.target.value })} placeholder="campaign-summer" className="rounded-xl border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-indigo-400" />
        <input value={draft.selector} onChange={(e) => setDraft({ ...draft, selector: e.target.value })} placeholder=".campaign-summer" className="rounded-xl border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-indigo-400 md:col-span-2" />
        <textarea value={draft.overrideJson} onChange={(e) => setDraft({ ...draft, overrideJson: e.target.value })} rows={4} className={`rounded-xl border px-3 py-2 font-mono text-xs outline-none focus:border-indigo-400 md:col-span-2 ${validJson ? "border-gray-200" : "border-red-300 bg-red-50"}`} placeholder='{"color.semantic.action.primary": {"value": "#7c3aed"}}' />
      </div>
      <button type="button" disabled={saving || !draft.name || !draft.scopeKey || !draft.selector || !validJson} onClick={add} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Plus size={13} /> Save scope</button>
    </div>
    <div className="space-y-2">
      {isLoading ? <p className="text-xs text-gray-400">Loading…</p> : scopes.length === 0 ? <p className="text-xs text-gray-400">No scoped styles configured.</p> : scopes.map((scope) => <div key={scope.ScopedStyleId} className="flex items-start gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm"><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-gray-700">{scope.Name}</p><p className="mt-0.5 font-mono text-[10px] text-indigo-600">{scope.ScopeKey} · {scope.Selector}</p><pre className="mt-2 max-h-20 overflow-auto rounded-lg bg-gray-50 p-2 text-[10px] text-gray-500">{scope.OverrideJson || "{}"}</pre></div><button type="button" onClick={() => deleteScope(scope.ScopedStyleId)} className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-600" title="Delete scope"><Trash2 size={13} /></button></div>)}
    </div>
  </SectionShell>;
}
