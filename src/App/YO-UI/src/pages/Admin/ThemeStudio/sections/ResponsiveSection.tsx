import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion, LabeledInput, SectionShell, type StudioSectionProps } from "../studioShared";

/**
 * Responsive section (blueprint §57) — breakpoints with per-breakpoint token
 * overrides that the compiler emits as media queries.
 */
export function ResponsiveSection({ config, update }: StudioSectionProps) {
  const breakpoints = config.responsive ?? {};
  const [newName, setNewName] = useState("");
  const tokenPaths = useMemo(() => Object.keys(config.tokens.primitive), [config.tokens.primitive]);
  const spacingPaths = useMemo(() => Object.keys(config.spacing.scale).map((p) => `spacing.${p}`), [config.spacing.scale]);

  const setBp = (name: string, patch: Partial<{ minWidth: string }>) =>
    update(`responsive.${name}`, (cfg) => ({
      ...cfg,
      responsive: {
        ...cfg.responsive,
        [name]: { minWidth: "768px", tokens: {}, ...cfg.responsive[name], ...patch },
      },
    }));

  const removeBp = (name: string) =>
    update(`responsive.${name}`, (cfg) => {
      const r = { ...cfg.responsive };
      delete r[name];
      return { ...cfg, responsive: r };
    });

  return (
    <SectionShell
      title="Responsive"
      description="Breakpoints with token overrides, compiled to min-width media queries."
    >
      {Object.entries(breakpoints).map(([name, bp]) => (
        <BreakpointEditor
          key={name}
          name={name}
          minWidth={bp.minWidth}
          tokens={bp.tokens ?? {}}
          tokenPaths={tokenPaths}
          spacingPaths={spacingPaths}
          onMinWidth={(v) => setBp(name, { minWidth: v })}
          onRemove={() => removeBp(name)}
          onSetToken={(path, value) =>
            update(`responsive.${name}.tokens.${path}`, (cfg) => {
              const tokens = { ...(cfg.responsive[name]?.tokens ?? {}) };
              if (value === undefined) delete tokens[path];
              else tokens[path] = { value };
              return {
                ...cfg,
                responsive: { ...cfg.responsive, [name]: { ...cfg.responsive[name], tokens } },
              };
            })
          }
        />
      ))}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="tablet"
          className="w-48 rounded-lg border border-gray-200/80 px-3 py-1.5 text-[11px] outline-none focus:border-indigo-400/60"
        />
        <button
          type="button"
          disabled={!newName || !!breakpoints[newName]}
          onClick={() => {
            setBp(newName, { minWidth: "768px" });
            setNewName("");
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          <Plus size={12} /> Add breakpoint
        </button>
      </div>
    </SectionShell>
  );
}

function BreakpointEditor({
  name,
  minWidth,
  tokens,
  tokenPaths,
  spacingPaths,
  onMinWidth,
  onRemove,
  onSetToken,
}: {
  name: string;
  minWidth: string;
  tokens: Record<string, { value?: string }>;
  tokenPaths: string[];
  spacingPaths: string[];
  onMinWidth: (v: string) => void;
  onRemove: () => void;
  onSetToken: (path: string, value: string | undefined) => void;
}) {
  const [path, setPath] = useState("");
  return (
    <Accordion title={name} badge={`≥ ${minWidth}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-48">
            <LabeledInput label="Min width" value={minWidth} onChange={onMinWidth} mono />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="mt-4 rounded p-1 text-gray-300 transition hover:text-red-500"
            title="Remove breakpoint"
          >
            <Trash2 size={12} />
          </button>
        </div>
        {Object.entries(tokens).map(([tokenPath, token]) => (
          <div key={tokenPath} className="flex items-center gap-2 rounded-lg border border-gray-200/70 bg-white px-3 py-1.5">
            <code className="w-64 shrink-0 truncate text-[11px] text-gray-600">{tokenPath}</code>
            <input
              type="text"
              value={token.value ?? ""}
              onChange={(e) => onSetToken(tokenPath, e.target.value || undefined)}
              className="min-w-0 flex-1 rounded border border-gray-200/80 px-2 py-1 font-mono text-[11px] outline-none focus:border-indigo-400/60"
            />
            <button
              type="button"
              onClick={() => onSetToken(tokenPath, undefined)}
              className="rounded p-1 text-gray-300 transition hover:text-red-500"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-64 rounded-lg border border-gray-200/80 px-2 py-1.5 text-[11px] outline-none"
          >
            <option value="">Select token…</option>
            <optgroup label="Tokens">
              {tokenPaths.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </optgroup>
            <optgroup label="Spacing / layout">
              {spacingPaths.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </optgroup>
          </select>
          <button
            type="button"
            disabled={!path || !!tokens[path]}
            onClick={() => {
              onSetToken(path, "");
              setPath("");
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus size={12} /> Override token
          </button>
        </div>
      </div>
    </Accordion>
  );
}
