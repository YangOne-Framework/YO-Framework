import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { Check, Copy, Upload } from "lucide-react";
import { compileTheme } from "../../../../services/themeCompiler";
import { normalizeToRuntimeConfig } from "../../../../services/themeMigration";
import {
  buildCssVariablesExport,
  buildReactTheme,
  buildStyleDictionary,
  buildTailwindConfig,
  buildTailwindV4,
  parseFigmaVariables,
} from "../themeUtils";
import type { StudioThemeConfig } from "../../../../types/yoThemeStudioTypes";
import { isStudioConfig } from "../../../../services/themeMigration";
import { useGetStudioConfigQuery } from "../../../../redux/theme/themeStudioAPI";
import { SectionShell, type StudioSectionProps } from "../studioShared";

type CodeTab = "json" | "css" | "tokens" | "customCss" | "exports" | "compare";

const flatten = (value: unknown, prefix = "", output: Record<string, string> = {}): Record<string, string> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key, output));
  } else {
    output[prefix] = JSON.stringify(value);
  }
  return output;
};

/**
 * Code section (blueprint §65, §66) — full JSON editor, generated CSS, resolved
 * token view and the sanitized custom CSS editor.
 */
export function CodeSection({ config, update, guid }: StudioSectionProps) {
  const { data: studioData } = useGetStudioConfigQuery(guid);
  const [tab, setTab] = useState<CodeTab>("json");
  const [jsonDraft, setJsonDraft] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const compiled = useMemo(() => compileTheme(config ?? {} as StudioThemeConfig), [config]);
  const runtimeConfig = useMemo(() => normalizeToRuntimeConfig(config), [config]);
  const exports = useMemo(() => ({
    css: buildCssVariablesExport(runtimeConfig),
    tailwind: buildTailwindConfig(runtimeConfig),
    tailwindV4: buildTailwindV4(runtimeConfig),
    styleDictionary: buildStyleDictionary(runtimeConfig),
    react: buildReactTheme(runtimeConfig),
  }), [runtimeConfig]);
  const [exportFormat, setExportFormat] = useState<keyof typeof exports>("css");
  const [figmaJson, setFigmaJson] = useState("");
  const [figmaError, setFigmaError] = useState<string | null>(null);
  const publishedConfig = useMemo(() => {
    if (!studioData?.row?.PublishedConfig) return null;
    try { return JSON.parse(studioData.row.PublishedConfig) as Record<string, unknown>; } catch { return null; }
  }, [studioData?.row?.PublishedConfig]);
  const comparison = useMemo(() => {
    if (!publishedConfig) return [];
    const draftFlat = flatten(config);
    const publishedFlat = flatten(publishedConfig);
    return Array.from(new Set([...Object.keys(draftFlat), ...Object.keys(publishedFlat)])).filter((path) => draftFlat[path] !== publishedFlat[path]).map((path) => ({ path, draft: draftFlat[path] ?? "—", published: publishedFlat[path] ?? "—" }));
  }, [config, publishedConfig]);

  const importFigma = () => {
    const colors = parseFigmaVariables(figmaJson);
    if (!colors) {
      setFigmaError("No supported Figma color variables were found");
      return;
    }
    setFigmaError(null);
    update("code.figmaImport", (cfg) => ({
      ...cfg,
      tokens: { ...cfg.tokens, primitive: { ...cfg.tokens.primitive, ...Object.fromEntries(Object.entries(colors).map(([name, token]) => [name, { value: token.default, type: "color" as const, legacyKey: name }])) } },
    }));
    setFigmaJson("");
  };

  const applyJson = (text: string) => {
    setJsonDraft(text);
    try {
      const parsed = JSON.parse(text);
      if (!isStudioConfig(parsed)) {
        setJsonError("Config must be a version-2 studio configuration");
        return;
      }
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  /* Commit the edited JSON as one history entry (per-keystroke application
     spammed undo history and made the editor drift from undo/redo state). */
  const commitJson = () => {
    if (jsonDraft == null || jsonError) return;
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!isStudioConfig(parsed)) return;
      update("code.json", () => parsed as StudioThemeConfig);
      setJsonDraft(null);
    } catch { /* guarded by jsonError */ }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const tabs: Array<{ key: CodeTab; label: string }> = [
    { key: "json", label: "Theme JSON" },
    { key: "css", label: `Generated CSS (${Math.round(compiled.sizeBytes / 1024)} KB)` },
    { key: "tokens", label: "Resolved Tokens" },
    { key: "customCss", label: "Custom CSS" },
    { key: "exports", label: "Exports" },
    { key: "compare", label: `Published diff${comparison.length ? ` (${comparison.length})` : ""}` },
  ];

  return (
    <SectionShell
      title="Code"
      description="Developer view — edit the raw configuration, inspect compiled output, or add scoped custom CSS."
    >
      <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              tab === t.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
        {(tab === "css" || tab === "json") && (
          <button
            type="button"
            onClick={() => copy(tab === "css" ? compiled.css : JSON.stringify(config, null, 2))}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:text-gray-700"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy
          </button>
        )}
      </div>

      {tab === "json" && (
        <div className="space-y-2">
          {jsonError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {jsonError} — fix the JSON to apply changes.
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={jsonDraft == null || !!jsonError}
              onClick={commitJson}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              Apply JSON
            </button>
            {jsonDraft != null && (
              <button
                type="button"
                onClick={() => { setJsonDraft(null); setJsonError(null); }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Discard edits
              </button>
            )}
            <span className="text-[10px] text-gray-400">Edits apply when you press Apply — undo/redo stays one step per commit.</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200/80">
            <Editor
              height="480px"
              language="json"
              value={jsonDraft ?? JSON.stringify(config, null, 2)}
              onChange={(v) => applyJson(v ?? "")}
              options={{ minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }}
            />
          </div>
        </div>
      )}

      {tab === "css" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80">
          <Editor
            height="480px"
            language="css"
            value={compiled.css}
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }}
          />
        </div>
      )}

      {tab === "tokens" && (
        <div className="max-h-[480px] overflow-y-auto rounded-2xl border border-gray-200/80 bg-white">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Token</th>
                <th className="px-3 py-2 font-semibold">Resolved value</th>
                <th className="px-3 py-2 font-semibold">Dark</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(compiled.resolvedTokens).map(([path, value]) => (
                <tr key={path} className="border-t border-gray-100">
                  <td className="px-3 py-1.5 font-mono text-gray-600">{path}</td>
                  <td className="px-3 py-1.5 font-mono text-gray-800">
                    <span className="inline-flex items-center gap-1.5">
                      {/^#[0-9a-fA-F]{3,6}$/.test(value) && (
                        <span className="inline-block h-3 w-3 rounded border border-gray-200" style={{ backgroundColor: value }} />
                      )}
                      {value}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 font-mono text-gray-500">
                    {config.tokens.primitive[path]?.dark ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "exports" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2"><Upload size={14} className="text-indigo-500" /><h3 className="text-xs font-semibold text-gray-700">Import Figma Variables</h3></div>
            <p className="mt-1 text-[11px] text-gray-400">Paste a Figma Variables JSON export. Supported color variables are added as primitive Studio tokens.</p>
            <textarea value={figmaJson} onChange={(e) => setFigmaJson(e.target.value)} rows={4} placeholder='{"variables": {"id": {"name": "brand-primary", "resolvedValues": {"color": {"r": 0.2, "g": 0.4, "b": 0.8}}}}}' className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-[11px] outline-none focus:border-indigo-400" />
            {figmaError && <p className="mt-1 text-[11px] text-red-600">{figmaError}</p>}
            <button type="button" disabled={!figmaJson.trim()} onClick={importFigma} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Upload size={12} /> Import colors</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as keyof typeof exports)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-400">
              <option value="css">CSS variables</option>
              <option value="tailwind">Tailwind v3 config</option>
              <option value="tailwindV4">Tailwind v4 CSS</option>
              <option value="styleDictionary">Style Dictionary JSON</option>
              <option value="react">React/TypeScript theme</option>
            </select>
            <button type="button" onClick={() => copy(exports[exportFormat])} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">{copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy export</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200/80">
            <Editor height="480px" language={exportFormat === "styleDictionary" ? "json" : exportFormat === "css" || exportFormat === "tailwindV4" ? "css" : "typescript"} value={exports[exportFormat]} options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }} />
          </div>
        </div>
      )}

      {tab === "compare" && (
        <div className="space-y-3">
          <p className="text-[11px] text-gray-400">Draft values compared with the isolated published snapshot. Saving a draft does not change live applications.</p>
          {!publishedConfig ? <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-xs text-gray-400">No published snapshot is available yet.</p> : comparison.length === 0 ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-700">Draft and published configuration are identical.</p> : <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white"><table className="w-full text-left text-[11px]"><thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400"><tr><th className="px-3 py-2">Path</th><th className="px-3 py-2">Draft</th><th className="px-3 py-2">Published</th></tr></thead><tbody>{comparison.map((entry) => <tr key={entry.path} className="border-t border-gray-100 align-top"><td className="px-3 py-2 font-mono text-gray-600">{entry.path}</td><td className="max-w-xs whitespace-pre-wrap break-all px-3 py-2 font-mono text-indigo-700">{entry.draft}</td><td className="max-w-xs whitespace-pre-wrap break-all px-3 py-2 font-mono text-gray-500">{entry.published}</td></tr>)}</tbody></table></div>}
        </div>
      )}

      {tab === "customCss" && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">
            Scoped to this theme. Unsafe constructs (@import, external url(), expressions, javascript:) are
            stripped by the compiler and reported as validation errors.
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-200/80">
            <Editor
              height="360px"
              language="css"
              value={config.customCss ?? ""}
              onChange={(v) =>
                update("customCss", (cfg) => ({ ...cfg, customCss: v ?? "" }))
              }
              options={{ minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }}
            />
          </div>
        </div>
      )}
    </SectionShell>
  );
}
