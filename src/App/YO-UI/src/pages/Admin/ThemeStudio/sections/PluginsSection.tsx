import { useMemo, useState } from "react";
import { Blocks, ChevronDown, Palette, Puzzle } from "lucide-react";
import { toast } from "react-toastify";
import { useGetThemePluginsQuery, useToggleThemePluginMutation } from "../../../../redux/theme/themeStudioAPI";
import { SectionShell } from "../studioShared";

/** Registered token shape emitted by a plugin (shape matches StudioToken). */
interface RegisteredToken {
  path: string;
  type?: string;
  value?: string;
  dark?: string;
  legacyKey?: string;
  description?: string;
}

/** Registered component shape emitted by a plugin. */
interface RegisteredComponent {
  key: string;
  label?: string;
  css?: string;
  fields?: string[];
}

interface PluginJson {
  tokens?: RegisteredToken[];
  components?: RegisteredComponent[];
}

const parseJson = <T,>(raw: string | null | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

/** Flatten a plugin's registers either as {tokens:[...]} or a bare array. */
function extractTokens(raw: string | null | undefined): RegisteredToken[] {
  const parsed = parseJson<unknown>(raw, null);
  if (Array.isArray(parsed)) return parsed as RegisteredToken[];
  const boxed = parsed as PluginJson | null;
  return boxed?.tokens ?? [];
}

function extractComponents(raw: string | null | undefined): RegisteredComponent[] {
  const parsed = parseJson<unknown>(raw, null);
  if (Array.isArray(parsed)) return parsed as RegisteredComponent[];
  const boxed = parsed as { components?: RegisteredComponent[] } | null;
  return boxed?.components ?? [];
}

/**
 * Studio Plugins — registry-controlled extensions. A plugin is stored in
 * `dbo.YOThemePlugin` (no code needed) and only advertises what it adds:
 * RegisteredTokensJson (editor-visible tokens, e.g. new brand colors that
 * populate the Colors section) and RegisteredComponentsJson (composable
 * component/utility presets). Toggling IsEnabled turns them on/off.
 */
export function PluginsSection() {
  const { data: plugins = [], isLoading } = useGetThemePluginsQuery();
  const [togglePlugin, { isLoading: toggling }] = useToggleThemePluginMutation();
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = async (id: number, enabled: boolean) => {
    try {
      await togglePlugin({ id, enabled }).unwrap();
      toast.success(enabled ? "Plugin enabled" : "Plugin disabled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Plugin state could not be changed");
    }
  };

  return (
    <SectionShell
      title="Studio Plugins"
      description="Extensions that add design tokens and component presets to Theme Studio. Toggle them on to make their Tokens editable in the Colors section."
    >
      {isLoading ? <p className="text-xs text-gray-400">Loading…</p> : plugins.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-gray-400">
          <Blocks size={24} className="mx-auto mb-2" />
          <p className="text-xs">No Theme Studio plugins are registered.</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {plugins.map((plugin) => {
            const tokens = extractTokens(plugin.RegisteredTokensJson);
            const components = extractComponents(plugin.RegisteredComponentsJson);
            const isOpen = expanded === plugin.ThemePluginId;
            return (
              <div key={plugin.ThemePluginId} className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    {components.length ? <Puzzle size={16} /> : <Palette size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-gray-800">{plugin.Name}</h3>
                    <code className="text-[10px] text-gray-400">{plugin.PluginKey}</code>
                    {plugin.Description && <p className="mt-1 text-[11px] text-gray-500">{plugin.Description}</p>}
                    <div className="mt-2 flex gap-2 text-[10px] text-gray-400">
                      <span>{tokens.length} token{tokens.length === 1 ? "" : "s"}</span>
                      <span>·</span>
                      <span>{components.length} component{components.length === 1 ? "" : "s"}</span>
                      {plugin.RegisteredTokensJson && (
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : plugin.ThemePluginId)}
                          className="ml-auto inline-flex items-center gap-0.5 font-semibold text-indigo-600 transition hover:text-indigo-800"
                        >
                          <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          {isOpen ? "Hide" : "Details"}
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!plugin.IsActive || toggling}
                    onClick={() => toggle(plugin.ThemePluginId, !plugin.IsEnabled)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${plugin.IsEnabled ? "bg-indigo-600" : "bg-gray-200"} disabled:opacity-40`}
                    aria-label={`${plugin.IsEnabled ? "Disable" : "Enable"} ${plugin.Name}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${plugin.IsEnabled ? "left-6" : "left-1"}`} />
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                    {components.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Components</p>
                        {components.map((c) => (
                          <div key={c.key} className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2">
                            <p className="text-[11px] font-medium text-gray-700">{c.label ?? c.key}</p>
                            {c.fields?.length ? (
                              <p className="mt-0.5 font-mono text-[10px] text-gray-400">fields: {c.fields.join(", ")}</p>
                            ) : null}
                            {c.css && (
                              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-900 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-emerald-300">{c.css}</pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {tokens.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tokens</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tokens.map((t) => (
                            <span key={t.path} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 font-mono text-[10px] text-gray-600">
                              {t.value && /^#[0-9a-fA-F]{3,6}$/.test(t.value) && (
                                <span className="inline-block h-2.5 w-2.5 rounded-full border border-gray-200" style={{ backgroundColor: t.value }} />
                              )}
                              {t.path}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}