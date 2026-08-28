import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { StudioThemeConfig, ThemeStatus } from "../../../types/yoThemeStudioTypes";
import { THEME_STATUS_LABELS } from "../../../types/yoThemeStudioTypes";

/* ------------------------------------------------------------------ */
/*  Section contract                                                    */
/* ------------------------------------------------------------------ */

export interface StudioSectionProps {
  config: StudioThemeConfig;
  /** Apply an immutable draft update. `path` is used for change tracking
   *  and audit (e.g. "colors", "tokens.semantic.color.action.primary"). */
  update: (path: string, fn: (cfg: StudioThemeConfig) => StudioThemeConfig) => void;
  guid: string;
}

export type StudioMode = "simple" | "advanced";

export const STUDIO_MODES: Array<{ key: StudioMode; label: string }> = [
  { key: "simple", label: "Simple" },
  { key: "advanced", label: "Advanced" },
];

/* ------------------------------------------------------------------ */
/*  Status chip                                                         */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<ThemeStatus, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-indigo-50 text-indigo-700 border-indigo-200",
  archived: "bg-gray-100 text-gray-400 border-gray-200 line-through",
};

export function StatusChip({ status }: { status: ThemeStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[status] ?? STATUS_STYLES.draft}`}>
      {THEME_STATUS_LABELS[status] ?? status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section card + accordion                                            */
/* ------------------------------------------------------------------ */

export function SectionShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function Accordion({
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-gray-50/60 rounded-2xl"
      >
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "" : "-rotate-90"}`} />
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        {badge && (
          <span className="ml-auto rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">{badge}</span>
        )}
      </button>
      {open && <div className="border-t border-gray-100 px-4 py-3.5">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small form primitives                                               */
/* ------------------------------------------------------------------ */

export function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</span>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition-all focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-50 ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}

export function LabeledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition-all focus:border-indigo-400/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

/** Ref-or-value picker: bind a token to another token reference or a raw value.
 *  References are stored in the compiler-standard braced form "{token.path}". */
export function TokenRefInput({
  value,
  refTarget,
  availablePaths,
  onValueChange,
  onRefChange,
  mono,
}: {
  value?: string;
  refTarget?: string;
  availablePaths: string[];
  onValueChange: (v: string | undefined) => void;
  onRefChange: (v: string | undefined) => void;
  mono?: boolean;
}) {
  const isRef = !!refTarget;
  const bareRef = refTarget?.replace(/^\{|\}$/g, "");
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={isRef ? `ref:${bareRef}` : "raw"}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "raw") onRefChange(undefined);
          else onRefChange(`{${v.slice(4)}}`);
        }}
        className="w-36 shrink-0 rounded-lg border border-gray-200/80 bg-white px-2 py-1.5 text-[10px] text-gray-600 outline-none focus:border-indigo-400/60"
        title="Bind to token or use a raw value"
      >
        <option value="raw">Raw value</option>
        {availablePaths.map((p) => (
          <option key={p} value={`ref:${p}`}>{p}</option>
        ))}
      </select>
      {!isRef && (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onValueChange(e.target.value || undefined)}
          placeholder="#2563eb / 1rem / …"
          className={`min-w-0 flex-1 rounded-lg border border-gray-200/80 bg-white px-2 py-1.5 text-[11px] text-gray-700 outline-none focus:border-indigo-400/60 ${mono ? "font-mono" : ""}`}
        />
      )}
    </div>
  );
}
