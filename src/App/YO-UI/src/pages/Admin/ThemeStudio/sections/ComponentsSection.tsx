import { useMemo, useState } from "react";
import { SearchField } from "../ThemeTokenFields";
import { useGetComponentRegistryQuery } from "../../../../redux/theme/themeStudioAPI";
import type { StudioThemeConfig } from "../../../../types/yoThemeStudioTypes";
import { Accordion, LabeledInput, SectionShell, TokenRefInput, type StudioSectionProps } from "../studioShared";

interface LegacyComponentOverride {
  variant?: string;
  paddingX?: string;
  paddingY?: string;
  borderRadius?: string;
  shadow?: string;
  transition?: string;
}

const OVERRIDABLE_KEYS = ["paddingX", "paddingY", "borderRadius", "shadow", "transition"] as const;

/**
 * Components section (blueprint §49) — registry-driven: variants come from the
 * component registry, style overrides stay in the legacy `components` map and
 * component tokens bind to the three-level token system.
 */
export function ComponentsSection({ config, update }: StudioSectionProps) {
  const { data: registry = [] } = useGetComponentRegistryQuery();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>("button");

  const selectedEntry = useMemo(
    () => registry.find((r) => r.ComponentKey === selected),
    [registry, selected],
  );

  const variants: string[] = useMemo(() => {
    try {
      return JSON.parse(selectedEntry?.SupportedVariantsJson ?? "[]");
    } catch {
      return [];
    }
  }, [selectedEntry]);

  const requiredTokens: string[] = useMemo(() => {
    try {
      return JSON.parse(selectedEntry?.RequiredTokensJson ?? "[]");
    } catch {
      return [];
    }
  }, [selectedEntry]);

  const legacy = (config.components?.[selected] ?? {}) as LegacyComponentOverride;
  const setOverride = (key: string, value: string | undefined) =>
    update(`components.${selected}.${key}`, (cfg) => {
      const existing = cfg.components[selected] as (LegacyComponentOverride & { variants?: Record<string, { classes: string }> }) | undefined;
      const comp: Record<string, unknown> = {
        variant: existing?.variant ?? "default",
        variants: existing?.variants ?? {},
        ...existing,
      };
      if (value === undefined || value === "") delete comp[key];
      else comp[key] = value;
      return { ...cfg, components: { ...cfg.components, [selected]: comp as StudioThemeConfig["components"][string] } };
    });

  const semanticPaths = useMemo(
    () => [...Object.keys(config.tokens.primitive), ...Object.keys(config.tokens.semantic)],
    [config.tokens],
  );

  const filteredRegistry = registry.filter((r) =>
    r.DisplayName.toLowerCase().includes(search.toLowerCase()) ||
    r.ComponentKey.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SectionShell
      title="Components"
      description="Per-component variants, style overrides and token bindings from the component registry."
    >
      <SearchField value={search} onChange={setSearch} />
      <div className="grid grid-cols-[220px_1fr] gap-4">
        <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
          {filteredRegistry.map((entry) => (
            <button
              key={entry.ComponentKey}
              type="button"
              onClick={() => setSelected(entry.ComponentKey)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                selected === entry.ComponentKey
                  ? "border-indigo-200 bg-indigo-50 font-semibold text-indigo-700"
                  : "border-gray-200/70 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <span>{entry.DisplayName}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400">{entry.Category}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Accordion title={`${selectedEntry?.DisplayName ?? selected} — Variant`} badge={legacy.variant ?? "default"}>
            <div className="flex flex-wrap gap-1.5">
              {(variants.length ? variants : ["default"]).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => setOverride("variant", variant)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                    (legacy.variant ?? "default") === variant
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>
          </Accordion>

          <Accordion title="Style Overrides" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              {OVERRIDABLE_KEYS.map((key) => (
                <LabeledInput
                  key={key}
                  label={key}
                  value={legacy[key] ?? ""}
                  onChange={(v) => setOverride(key, v)}
                  placeholder="theme default"
                  mono
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              Empty values inherit the compiled component defaults.
            </p>
          </Accordion>

          <Accordion title="Component Tokens" badge={String(requiredTokens.length)} defaultOpen={false}>
            <div className="space-y-2">
              {requiredTokens.map((path) => {
                const token = config.tokens.component[path];
                return (
                  <div key={path} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white px-3 py-2">
                    <code className="w-56 shrink-0 truncate text-[11px] text-gray-600">{path}</code>
                    <div className="min-w-0 flex-1">
                      <TokenRefInput
                        value={token?.value}
                        refTarget={token?.ref}
                        availablePaths={semanticPaths}
                        onValueChange={(v) =>
                          update(`tokens.component.${path}`, (cfg) => ({
                            ...cfg,
                            tokens: {
                              ...cfg.tokens,
                              component: { ...cfg.tokens.component, [path]: { ...cfg.tokens.component[path], value: v } },
                            },
                          }))
                        }
                        onRefChange={(r) =>
                          update(`tokens.component.${path}`, (cfg) => ({
                            ...cfg,
                            tokens: {
                              ...cfg.tokens,
                              component: { ...cfg.tokens.component, [path]: { ...cfg.tokens.component[path], ref: r, type: "color" } },
                            },
                          }))
                        }
                        mono
                      />
                    </div>
                  </div>
                );
              })}
              {requiredTokens.length === 0 && (
                <p className="text-[11px] text-gray-400">No required tokens registered for this component.</p>
              )}
            </div>
          </Accordion>

          <Accordion title="Preview" defaultOpen>
            <ComponentPreview componentKey={selected} variant={legacy.variant ?? "default"} />
          </Accordion>
        </div>
      </div>
    </SectionShell>
  );
}

/** Lightweight live preview using the compiled .yo-* classes. */
function ComponentPreview({ componentKey, variant }: { componentKey: string; variant: string }) {
  if (componentKey === "button") {
    const cls = `yo-btn ${variant === "primary" || variant === "default" ? "yo-btn-primary" : `yo-btn-${variant}`}`;
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50/70 p-4">
        <button type="button" className={cls}>Continue</button>
        <button type="button" className="yo-btn yo-btn-outline">Cancel</button>
      </div>
    );
  }
  if (componentKey === "card") {
    return (
      <div className="yo-card max-w-sm rounded-xl bg-gray-50/70 p-4">
        <h3 className="text-sm font-semibold" style={{ color: "rgb(var(--c-text))" }}>Card title</h3>
        <p className="mt-1 text-xs" style={{ color: "rgb(var(--c-muted))" }}>
          Cards use the surface, border, radius and shadow tokens from this theme.
        </p>
        <button type="button" className="yo-btn yo-btn-primary mt-3">Action</button>
      </div>
    );
  }
  if (componentKey === "input") {
    return (
      <div className="max-w-sm rounded-xl bg-gray-50/70 p-4">
        <input className="yo-input w-full" placeholder="you@example.com" />
      </div>
    );
  }
  if (componentKey === "badge") {
    return (
      <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50/70 p-4">
        <span className="yo-badge-primary">Primary</span>
        <span className="yo-badge-accent">Accent</span>
      </div>
    );
  }
  if (componentKey === "alert") {
    return (
      <div className="rounded-xl bg-gray-50/70 p-4">
        <div className="yo-alert-info">This is an informational alert rendered with theme tokens.</div>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-gray-50/70 p-4 text-[11px] text-gray-400">
      Preview for this component renders in the page preview panel.
    </div>
  );
}

/** Variant options consumed by the simple-mode wizard. */
export const componentVariantOptions = (registry: Array<{ ComponentKey: string; SupportedVariantsJson?: string }>, key: string): string[] => {
  try {
    const entry = registry.find((r) => r.ComponentKey === key);
    return JSON.parse(entry?.SupportedVariantsJson ?? "[]");
  } catch {
    return [];
  }
};
