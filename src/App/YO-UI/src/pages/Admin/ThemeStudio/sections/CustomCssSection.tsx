import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { sanitizeCustomCss } from "../../../../services/themeCompiler";
import { SectionShell, type StudioSectionProps } from "../studioShared";

/**
 * Custom CSS section — raw CSS scoped to this theme. The CSS is saved with the
 * theme config (Save Draft / Publish) and rendered on every dynamic page that
 * resolves this theme. Unsafe constructs are stripped by the same sanitizer the
 * compiler uses on publish, so the live preview always matches what goes live.
 */
export function CustomCssSection({ config, update }: StudioSectionProps) {
  const [showUnsafe, setShowUnsafe] = useState(false);
  const { css: safeCss, validation } = useMemo(
    () => sanitizeCustomCss(config.customCss ?? ""),
    [config.customCss],
  );

  return (
    <SectionShell
      title="Custom CSS"
      description="Write raw CSS that is saved with this theme and loaded on every page using it — selectors, overrides, animations, anything plain CSS supports."
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200/80">
        <Editor
          height="420px"
          language="css"
          value={config.customCss ?? ""}
          onChange={(v) => update("customCss", (cfg) => ({ ...cfg, customCss: v ?? "" }))}
          options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, tabSize: 2 }}
        />
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-gray-200/80 bg-white/80 px-3 py-2.5">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-500">
            Unsafe constructs — <code className="font-mono text-[10px]">@import</code>, external{" "}
            <code className="font-mono text-[10px]">url()</code>, <code className="font-mono text-[10px]">expression()</code>,{" "}
            <code className="font-mono text-[10px]">javascript:</code> — are stripped when this theme is compiled and published.
          </p>
          {validation.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {showUnsafe && (
                <div className="space-y-1">
                  {validation.map((v, i) => (
                    <p key={i} className="font-mono text-[10px] text-red-600">{v.Message}</p>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowUnsafe(!showUnsafe)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500 transition hover:text-red-700"
              >
                <AlertTriangle size={11} />
                {validation.length} unsafe line{validation.length === 1 ? "" : "s"} detected
                {showUnsafe ? " — hide" : " — show"}
              </button>
            </div>
          )}
          {safeCss && validation.length === 0 && (
            <p className="mt-1 text-[10px] font-medium text-emerald-600">Clean — will be applied as written.</p>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gray-400">
        {config.customCss?.trim() ? `${config.customCss.trim().split("\n").length} lines · saved with the theme config` : "No custom CSS yet — add rules above and press Save Draft or Publish."}
      </p>
    </SectionShell>
  );
}
