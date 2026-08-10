import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import {
  useDeleteThemeLayoutMutation,
  useGetThemeLayoutsQuery,
  useSaveThemeLayoutMutation,
} from "../../../../redux/theme/themeStudioAPI";
import type { LayoutDefinition } from "../../../../types/yoThemeTypes";
import { Accordion, LabeledSelect, SectionShell, type StudioSectionProps } from "../studioShared";

const SHELL_TYPES = ["DefaultShell", "SidebarLeftShell", "SidebarRightShell", "TopNavShell", "MinimalShell"];
const ZONE_KEYS = ["header", "sidebar", "footer"];
const LAYOUT_TYPES = ["public-website", "application-shell", "admin-dashboard", "auth", "checkout"];

/**
 * Layout section (blueprint §53) — shell selection and layout definitions.
 * Definitions live in the theme config and are resolved by the dynamic page
 * runtime, so editing them reflects on every existing page using this theme.
 */
export function LayoutSection({ config, update, guid }: StudioSectionProps) {
  const structure = config.structure;
  const layouts = config.layouts ?? {};
  const [newLayoutName, setNewLayoutName] = useState("");

  const { data: themeLayouts = [] } = useGetThemeLayoutsQuery(guid);
  const [saveLayout] = useSaveThemeLayoutMutation();
  const [deleteLayout] = useDeleteThemeLayoutMutation();
  const [rowDraft, setRowDraft] = useState({ name: "", layoutType: LAYOUT_TYPES[0] });

  const setLayoutDef = (key: string, def: LayoutDefinition | undefined) =>
    update(`layouts.${key}`, (cfg) => {
      const l = { ...cfg.layouts };
      if (def === undefined) delete l[key];
      else l[key] = def;
      return { ...cfg, layouts: l };
    });

  const toggleZone = (layoutKey: string, zone: string) => {
    const def = layouts[layoutKey];
    if (!def) return;
    const zones = { ...(def.zones ?? {}) };
    if (zones[zone]) delete zones[zone];
    else zones[zone] = { order: Object.keys(zones).length + 1 };
    setLayoutDef(layoutKey, { ...def, zones });
  };

  return (
    <SectionShell
      title="Layout"
      description="Application shell and layout definitions applied to pages that use this theme."
    >
      <Accordion title="Application Shell" badge={structure?.layoutType ?? "DefaultShell"}>
        <div className="max-w-sm">
          <LabeledSelect
            label="Shell"
            value={structure?.layoutType ?? "DefaultShell"}
            options={SHELL_TYPES.map((s) => ({ value: s, label: s.replace(/([A-Z])/g, " $1").trim() }))}
            onChange={(v) =>
              update("structure.layoutType", (cfg) => ({
                ...cfg,
                structure: { ...cfg.structure, layoutType: v },
              }))
            }
          />
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          The shell wraps every rendered page: default centered, sidebar-left/right, top-nav or minimal.
        </p>
      </Accordion>

      <Accordion title="Layout Definitions" badge={String(Object.keys(layouts).length)}>
        <div className="space-y-2">
          {Object.entries(layouts).map(([key, def]) => (
            <div key={key} className="rounded-xl border border-gray-200/70 bg-white p-3">
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-semibold text-gray-700">{key}</code>
                <span className="text-[10px] text-gray-400">{def.shell ?? "DefaultShell"}</span>
                <button
                  type="button"
                  onClick={() => setLayoutDef(key, undefined)}
                  className="ml-auto rounded p-1 text-gray-300 transition hover:text-red-500"
                  title="Remove layout"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {SHELL_TYPES.map((shell) => (
                  <button
                    key={shell}
                    type="button"
                    onClick={() => setLayoutDef(key, { ...def, shell })}
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-all ${
                      (def.shell ?? "DefaultShell") === shell
                        ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                        : "border-gray-200 bg-white text-gray-400"
                    }`}
                  >
                    {shell.replace("Shell", "")}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {ZONE_KEYS.map((zone) => {
                  const present = !!def.zones?.[zone];
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => toggleZone(key, zone)}
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize transition-all ${
                        present
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-gray-200 bg-white text-gray-400"
                      }`}
                    >
                      {zone} zone
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="landing"
              className="w-48 rounded-lg border border-gray-200/80 px-3 py-1.5 text-[11px] outline-none focus:border-indigo-400/60"
            />
            <button
              type="button"
              disabled={!newLayoutName || !!layouts[newLayoutName]}
              onClick={() => {
                setLayoutDef(newLayoutName, {
                  name: newLayoutName,
                  shell: structure?.layoutType ?? "DefaultShell",
                  zones: { header: { order: 1 }, footer: { order: 2 } },
                });
                setNewLayoutName("");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <Plus size={12} /> Add layout
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Templates reference layouts by name; the dynamic page loader applies the resolved
            layout and shell to every existing page using this theme.
          </p>
        </div>
      </Accordion>

      <Accordion title="Saved Theme Layouts" badge={String(themeLayouts.length)} defaultOpen={false}>
        <div className="space-y-2">
          {themeLayouts.map((row) => (
            <div key={row.ThemeLayoutId} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white px-3 py-2">
              <span className="text-xs font-medium text-gray-700">{row.Name}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">{row.LayoutType}</span>
              {row.IsDefault && <Star size={12} className="fill-amber-400 text-amber-400" />}
              <div className="ml-auto flex items-center gap-1">
                {!row.IsDefault && (
                  <button
                    type="button"
                    onClick={() => saveLayout({ ...row, YOThemeUniqueId: guid, IsDefault: true })}
                    className="rounded-lg px-2 py-1 text-[10px] font-medium text-gray-500 transition hover:bg-gray-100"
                  >
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteLayout(row.ThemeLayoutId)}
                  className="rounded p-1 text-gray-300 transition hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={rowDraft.name}
              onChange={(e) => setRowDraft({ ...rowDraft, name: e.target.value })}
              placeholder="Public Website Layout"
              className="w-52 rounded-lg border border-gray-200/80 px-3 py-1.5 text-[11px] outline-none focus:border-indigo-400/60"
            />
            <select
              value={rowDraft.layoutType}
              onChange={(e) => setRowDraft({ ...rowDraft, layoutType: e.target.value })}
              className="rounded-lg border border-gray-200/80 px-2 py-1.5 text-[11px] outline-none"
            >
              {LAYOUT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={!rowDraft.name}
              onClick={async () => {
                await saveLayout({
                  YOThemeUniqueId: guid,
                  Name: rowDraft.name,
                  LayoutType: rowDraft.layoutType,
                  ConfigurationJson: JSON.stringify({
                    shell: structure?.layoutType ?? "DefaultShell",
                    layouts: Object.keys(layouts),
                  }),
                });
                setRowDraft({ name: "", layoutType: LAYOUT_TYPES[0] });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <Plus size={12} /> Save layout
            </button>
          </div>
        </div>
      </Accordion>
    </SectionShell>
  );
}
