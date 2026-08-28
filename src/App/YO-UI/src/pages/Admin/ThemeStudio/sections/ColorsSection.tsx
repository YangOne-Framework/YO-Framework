import { useMemo, useState } from "react";
import { Check, Plus, Trash2, Wand2 } from "lucide-react";
import { ColorField, SearchField } from "../ThemeTokenFields";
import { generatePalette, deriveDarkFromLight } from "../themeUtils";
import { ensurePublishableTokens, LEGACY_ROLE_MAP } from "../../../../services/themeMigration";
import { useGetThemePluginsQuery } from "../../../../redux/theme/themeStudioAPI";
import type { StudioToken } from "../../../../types/yoThemeStudioTypes";
import { Accordion, SectionShell, TokenRefInput, type StudioSectionProps } from "../studioShared";

/**
 * Colors section (blueprint §43) — primitive palettes, semantic mappings and
 * component color tokens, with live palette generation and dark-mode values.
 */
export function ColorsSection({ config, update }: StudioSectionProps) {
  const [search, setSearch] = useState("");
  const [newPath, setNewPath] = useState("");
  const primitivePaths = useMemo(() => Object.keys(config.tokens.primitive), [config.tokens.primitive]);

  /* ── Tokens contributed by enabled studio plugins ── */
  const { data: plugins = [] } = useGetThemePluginsQuery();
  const pluginTokens = useMemo(() => {
    const out: Array<{
      path: string;
      value?: string;
      dark?: string;
      type?: string;
      legacyKey?: string;
      plugin: string;
      description?: string;
    }> = [];
    for (const plugin of plugins) {
      if (!(plugin.IsEnabled ?? true) || !plugin.IsActive) continue;
      if (!plugin.RegisteredTokensJson) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(plugin.RegisteredTokensJson); } catch { continue; }
      const list = Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : (parsed as { tokens?: Record<string, unknown>[] })?.tokens ?? [];
      for (const entry of list) {
        if (typeof entry?.path !== "string" || !entry.path.includes(".")) continue;
        if (entry.type && entry.type !== "color") continue;
        out.push({
          path: entry.path,
          value: typeof entry.value === "string" ? entry.value : undefined,
          dark: typeof entry.dark === "string" ? entry.dark : undefined,
          type: (entry.type as string) || "color",
          legacyKey: typeof entry.legacyKey === "string" ? entry.legacyKey : undefined,
          plugin: plugin.Name,
          description: typeof entry.description === "string" ? entry.description : undefined,
        });
      }
    }
    return out;
  }, [plugins]);

  const setToken = (group: "primitive" | "semantic" | "component", path: string, token: StudioToken | undefined) =>
    update(`tokens.${group}.${path}`, (cfg) => {
      const dict = { ...cfg.tokens[group] };
      if (token === undefined) delete dict[path];
      else dict[path] = token;
      return { ...cfg, tokens: { ...cfg.tokens, [group]: dict } };
    });

  const addPluginToken = (t: (typeof pluginTokens)[number]) =>
    setToken("primitive", t.path, {
      value: t.value ?? "#3b82f6",
      ...(t.dark ? { dark: t.dark } : {}),
      type: "color",
      ...(t.legacyKey ? { legacyKey: t.legacyKey as string } : {}),
    });

  const removePluginToken = (path: string) => setToken("primitive", path, undefined);

  const filteredPrimitives = Object.entries(config.tokens.primitive).filter(([path]) =>
    path.toLowerCase().includes(search.toLowerCase()),
  );

  const applyPalette = () => {
    const seed = Object.values(config.tokens.primitive).find((t) => t.legacyKey === "primary")?.value ?? "#2563eb";
    const palette = generatePalette(seed, "complementary");
    update("colors.palette", (cfg) => {
      const primitive = { ...cfg.tokens.primitive };
      const semantic = { ...cfg.tokens.semantic };
      Object.entries(palette.light).forEach(([key, value]) => {
        const path = `color.brand.${key}`;
        primitive[path] = {
          value,
          ...(palette.dark[key] ? { dark: palette.dark[key] } : {}),
          type: "color",
          legacyKey: key,
        };
        const semanticPath = LEGACY_ROLE_MAP[key];
        if (semanticPath) semantic[semanticPath] = { ref: `{${path}}`, value, type: "color" };
      });
      const withTokens = { ...cfg, tokens: { ...cfg.tokens, primitive, semantic } };
      ensurePublishableTokens(withTokens);
      return withTokens;
    });
  };

  const fillDarkValues = () =>
    update("colors.dark-fill", (cfg) => {
      const legacyColors: Record<string, { default: string; dark?: string }> = {};
      Object.values(cfg.tokens.primitive).forEach((t) => {
        if (t.legacyKey && t.value) legacyColors[t.legacyKey] = { default: t.value, dark: t.dark };
      });
      const derived = deriveDarkFromLight(legacyColors);
      const primitive = { ...cfg.tokens.primitive };
      Object.entries(primitive).forEach(([path, token]) => {
        if (token.type === "color" && !token.dark && token.legacyKey && derived[token.legacyKey]?.dark) {
          primitive[path] = { ...token, dark: derived[token.legacyKey].dark };
        }
      });
      return { ...cfg, tokens: { ...cfg.tokens, primitive } };
    });

  const missingDark = Object.entries(config.tokens.primitive).filter(([, t]) => t.type === "color" && !t.dark).length;

  return (
    <SectionShell
      title="Colors"
      description="Three-level color tokens: primitives feed semantics, semantics feed components."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyPalette}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            <Wand2 size={12} /> Regenerate palette
          </button>
          {missingDark > 0 && (
            <button
              type="button"
              onClick={fillDarkValues}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Fill {missingDark} dark value{missingDark > 1 ? "s" : ""}
            </button>
          )}
        </div>
      }
    >
      <SearchField value={search} onChange={setSearch} />

      <Accordion title="Primitive Tokens" badge={String(filteredPrimitives.length)}>
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
          {filteredPrimitives.map(([path, token]) => (
            <div key={path} className="relative">
              <ColorField
                label={path}
                value={token.value ?? "#000000"}
                darkValue={token.dark}
                onChange={(v) => setToken("primitive", path, { ...token, value: v, type: "color" })}
                onDarkChange={(v) => setToken("primitive", path, { ...token, dark: v, type: "color" })}
                onReset={() => setToken("primitive", path, undefined)}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder="color.brand.teal"
            className="w-56 rounded-lg border border-gray-200/80 px-3 py-1.5 font-mono text-[11px] outline-none focus:border-indigo-400/60"
          />
          <button
            type="button"
            disabled={!newPath.includes(".")}
            onClick={() => {
              if (!newPath.includes(".")) return;
              setToken("primitive", newPath, { value: "#3b82f6", type: "color" });
              setNewPath("");
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus size={12} /> Add token
          </button>
        </div>
      </Accordion>

      {pluginTokens.length > 0 && (
        <Accordion
          title="Plugin Tokens"
          badge={`${pluginTokens.length} from ${new Set(pluginTokens.map((t) => t.plugin)).size} plugin${new Set(pluginTokens.map((t) => t.plugin)).size > 1 ? "s" : ""}`}
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
            {pluginTokens.map((t) => {
              const added = !!config.tokens.primitive[t.path];
              return (
                <div key={t.path} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-indigo-50/30 px-3 py-2">
                  <span
                    className="inline-block h-6 w-6 shrink-0 rounded-lg border border-gray-200"
                    style={{ backgroundColor: t.value ?? "#3b82f6" }}
                  />
                  <div className="min-w-0 flex-1">
                    <code className="block truncate text-[11px] font-medium text-gray-700">{t.path}</code>
                    <span className="text-[10px] text-gray-400">
                      {t.plugin}{t.description ? ` — ${t.description}` : ""}
                    </span>
                  </div>
                  {added ? (
                    <button
                      type="button"
                      onClick={() => removePluginToken(t.path)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                      title="Remove from theme"
                    >
                      <Check size={11} /> In theme
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addPluginToken(t)}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100"
                      title="Add to theme primitive tokens"
                    >
                      <Plus size={11} /> Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            Enabled plugins register design tokens. Added tokens become regular primitive tokens — they compile to CSS variables
            and appear in the Primitive Tokens list above.
          </p>
        </Accordion>
      )}

      <Accordion title="Semantic Mappings" badge={String(Object.keys(config.tokens.semantic).length)} defaultOpen={false}>
        <div className="space-y-2">
          {Object.entries(config.tokens.semantic).map(([path, token]) => (
            <div key={path} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white px-3 py-2">
              <code className="w-56 shrink-0 truncate text-[11px] text-gray-600">{path}</code>
              <div className="min-w-0 flex-1">
                <TokenRefInput
                  value={token.value}
                  refTarget={token.ref}
                  availablePaths={primitivePaths}
                  onValueChange={(v) => setToken("semantic", path, { ...token, value: v })}
                  onRefChange={(r) => setToken("semantic", path, { ...token, ref: r, type: "color" })}
                  mono
                />
              </div>
              <button
                type="button"
                onClick={() => setToken("semantic", path, undefined)}
                className="rounded p-1 text-gray-300 transition hover:text-red-500"
                title="Remove mapping"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <SemanticAdder existing={Object.keys(config.tokens.semantic)} onAdd={(path) => setToken("semantic", path, { ref: `{${primitivePaths[0] ?? "color.brand.primary"}}`, value: config.tokens.primitive[primitivePaths[0]]?.value, type: "color" })} />
        </div>
      </Accordion>

      <Accordion title="Component Color Tokens" badge={String(Object.keys(config.tokens.component).length)} defaultOpen={false}>
        <div className="space-y-2">
          {Object.entries(config.tokens.component).map(([path, token]) => (
            <div key={path} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white px-3 py-2">
              <code className="w-56 shrink-0 truncate text-[11px] text-gray-600">{path}</code>
              <div className="min-w-0 flex-1">
                <TokenRefInput
                  value={token.value}
                  refTarget={token.ref}
                  availablePaths={[...primitivePaths, ...Object.keys(config.tokens.semantic)]}
                  onValueChange={(v) => setToken("component", path, { ...token, value: v })}
                  onRefChange={(r) => setToken("component", path, { ...token, ref: r, type: "color" })}
                  mono
                />
              </div>
              <button
                type="button"
                onClick={() => setToken("component", path, undefined)}
                className="rounded p-1 text-gray-300 transition hover:text-red-500"
                title="Remove token"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <SemanticAdder
            existing={Object.keys(config.tokens.component)}
            placeholder="button.primary.hoverBackground"
            onAdd={(path) => setToken("component", path, { ref: `{${primitivePaths[0] ?? "color.brand.primary"}}`, value: config.tokens.primitive[primitivePaths[0]]?.value, type: "color" })}
          />
        </div>
      </Accordion>
    </SectionShell>
  );
}

function SemanticAdder({
  existing,
  onAdd,
  placeholder = "color.background.muted",
}: {
  existing: string[];
  onAdd: (path: string) => void;
  placeholder?: string;
}) {
  const [path, setPath] = useState("");
  const valid = path.includes(".") && !existing.includes(path);
  return (
    <div className="flex items-center gap-2 pt-1">
      <input
        type="text"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder={placeholder}
        className="w-56 rounded-lg border border-gray-200/80 px-3 py-1.5 font-mono text-[11px] outline-none focus:border-indigo-400/60"
      />
      <button
        type="button"
        disabled={!valid}
        onClick={() => {
          onAdd(path);
          setPath("");
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
      >
        <Plus size={12} /> Add
      </button>
    </div>
  );
}
