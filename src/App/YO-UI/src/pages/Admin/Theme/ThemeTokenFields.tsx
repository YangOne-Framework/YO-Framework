import { useState, useEffect, useRef, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { Copy, RotateCcw, Link2, Unlink, ChevronDown, Pipette } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Color utilities                                                    */
/* ------------------------------------------------------------------ */

function relativeLuminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const chan = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/** WCAG contrast ratio of this color when used as TEXT on a white surface. */
function getContrastOnWhite(hex: string): number {
  const lum = relativeLuminance(hex);
  const white = 1; // luminance of #ffffff
  const lighter = Math.max(white, lum);
  const darker = Math.min(white, lum);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

type ContrastInfo = { level: "AAA" | "AA" | "AA-lg" | "Low"; ratio: number; ok: boolean };

function getContrastInfo(hex: string): ContrastInfo {
  const ratio = getContrastOnWhite(hex);
  const level = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA-lg" : "Low";
  return { level, ratio, ok: ratio >= 3 };
}

const PRESETS = [
  "#000", "#fff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1",
  "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b", "#0f172a",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#2563eb", "#6366f1", "#8b5cf6", "#a855f7",
  "#d946ef", "#ec4899", "#f43f5e",
];

/* ================================================================== */
/*  Color Picker Popover — positioned fixed, no overflow issues         */
/* ================================================================== */

function ColorPickerPopover({
  color, onChange, onClose, triggerRect,
}: {
  color: string;
  onChange: (v: string) => void;
  onClose: () => void;
  triggerRect: DOMRect | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const [inputVal, setInputVal] = useState(color);

  useEffect(() => { setInputVal(color); }, [color]);

  const [tab, setTab] = useState<"picker" | "presets">("picker");

  const top = triggerRect ? triggerRect.bottom + 6 : 100;
  const left = triggerRect ? Math.max(8, Math.min(triggerRect.left, window.innerWidth - 280)) : 100;

  return (
    <div ref={ref}
      className="fixed z-[100] w-[280px] bg-white rounded-2xl border border-gray-200/80 shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150"
      style={{ top, left }}>
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        <button type="button" onClick={() => setTab("picker")}
          className={`flex-1 text-[10px] font-medium py-1 rounded-md transition-all ${tab === "picker" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Picker</button>
        <button type="button" onClick={() => setTab("presets")}
          className={`flex-1 text-[10px] font-medium py-1 rounded-md transition-all ${tab === "presets" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Swatches</button>
      </div>

      {tab === "picker" && (
        <div className="space-y-3">
          <HexColorPicker color={inputVal} onChange={(v) => { setInputVal(v); onChange(v); }}
            className="!w-full !h-40 [&_.react-colorful__saturation]:rounded-lg [&_.react-colorful__hue]:rounded-full [&_.react-colorful__hue]:h-3 [&_.react-colorful__pointer]:w-4 [&_.react-colorful__pointer]:h-4 [&_.react-colorful__pointer]:border-2 [&_.react-colorful__pointer]:border-white [&_.react-colorful__pointer]:shadow-lg" />
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg border border-gray-200 shrink-0" style={{ backgroundColor: inputVal }} />
            <input type="text" value={inputVal}
              onChange={(e) => {
                const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
                setInputVal(v);
                if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
              }}
              className="flex-1 rounded-lg border border-gray-200/80 px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-400/60 transition-all" />
            <button type="button" onClick={onClose}
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 hover:bg-indigo-50 rounded-lg transition-all">Done</button>
          </div>
        </div>
      )}

      {tab === "presets" && (
        <div>
          <div className="grid grid-cols-9 gap-1.5">
            {PRESETS.map((c) => (
              <button key={c} type="button" onClick={() => { onChange(c); setInputVal(c); }}
                className={`h-7 w-full rounded-lg border transition-all hover:scale-110 hover:shadow-md ${
                  color === c ? "ring-2 ring-indigo-500 ring-offset-1 scale-110 border-indigo-300" : "border-gray-200/80"
                }`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <button type="button" onClick={onClose}
            className="w-full mt-3 text-[10px] font-medium text-indigo-600 hover:text-indigo-800 py-1.5 hover:bg-indigo-50 rounded-lg transition-all">Done</button>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  COLOR FIELD — with react-colorful popover                          */
/* ================================================================== */

interface ColorFieldProps {
  label: string;
  value: string;
  darkValue?: string;
  onChange: (v: string) => void;
  onDarkChange?: (v: string) => void;
  synced?: boolean;
  onToggleSync?: () => void;
  onReset?: () => void;
}

export function ColorField({
  label, value, darkValue, onChange, onDarkChange,
  synced, onToggleSync, onReset,
}: ColorFieldProps) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const current = mode === "dark" ? darkValue ?? value : value;
  const validHex = /^#[0-9a-fA-F]{6}$/.test(current) || /^#[0-9a-fA-F]{3}$/.test(current);
  const contrast = getContrastInfo(current);
  const bgOk = contrast.ok;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const handlePickerOpen = useCallback(() => {
    if (swatchRef.current) {
      setTriggerRect(swatchRef.current.getBoundingClientRect());
    }
    setShowPicker(true);
  }, []);

  const handlePickerChange = useCallback((v: string) => {
    if (mode === "dark" && onDarkChange) onDarkChange(v);
    else onChange(v);
  }, [mode, onDarkChange, onChange]);

  const colorValue = mode === "dark" && darkValue !== undefined ? darkValue : value;

  return (
    <div className="bg-white/90 border border-gray-200/80 rounded-xl transition-all hover:border-gray-300/80 hover:shadow-sm">
      {/* Light / Dark toggle */}
      <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1">
        <span className="text-[11px] font-semibold text-gray-600 truncate tracking-wide">{label}</span>
        <div className="flex items-center gap-0.5 ml-2">
          {onDarkChange && (
            <>
              <button type="button" onClick={() => setMode("light")}
                title="Edit Light mode color"
                className={`text-[9px] font-medium px-1.5 py-0.5 rounded transition-all ${mode === "light" ? "bg-gray-200/70 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}>L</button>
              <button type="button" onClick={() => setMode("dark")}
                title="Edit Dark mode color"
                className={`text-[9px] font-medium px-1.5 py-0.5 rounded transition-all ${mode === "dark" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"}`}>D</button>
            </>
          )}
          <div className="w-px h-3 bg-gray-200 mx-1" />
          {onToggleSync && (
            <button type="button" onClick={onToggleSync}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-500 transition-all"
              title={synced ? "Dark value is linked to light — click to set a different dark color" : "Dark value differs from light — click to copy light value to dark"}>
              {synced ? <Link2 size={10} /> : <Unlink size={10} />}
            </button>
          )}
          {onReset && (
            <button type="button" onClick={onReset}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
              title="Remove this token (revert to theme default)">
              <RotateCcw size={10} />
            </button>
          )}
          <button type="button" onClick={handleCopy}
            className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
            title="Copy color value to clipboard">
            {copied ? <span className="text-[8px] text-green-600 font-semibold">OK</span> : <Copy size={10} />}
          </button>
        </div>
      </div>

      {/* Main row: swatch + text input */}
      <div className="flex items-center gap-2 px-3.5 pb-2.5">
        <button ref={swatchRef} type="button" onClick={handlePickerOpen}
          title="Open color picker"
          className="relative block h-9 w-9 shrink-0 rounded-lg border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_2px_rgba(99,102,241,0.3)] transition-shadow overflow-hidden cursor-pointer">
          <div className="h-full w-full rounded-[5px]" style={{ backgroundColor: validHex ? current : "#e2e8f0" }} />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity rounded-[5px]">
            <Pipette size={12} className="text-white" />
          </div>
        </button>
        <input type="text" value={colorValue}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
            if (mode === "dark" && onDarkChange) onDarkChange(v);
            else onChange(v);
          }}
          title="Color value (hex)"
          className="flex-1 bg-transparent text-xs font-mono text-gray-600 outline-none min-w-0" />
        {validHex && (
          <span
            title={`WCAG contrast vs white surface: ${contrast.ratio}:1 — ${contrast.level === "Low" ? "low legibility, better as a background than as text" : "acceptable as text on white"}`}
            className={`text-[9px] font-semibold px-1 py-0.5 rounded cursor-help ${
              bgOk ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}>{contrast.level}</span>
        )}
      </div>

      {/* Color picker popover */}
      {showPicker && (
        <ColorPickerPopover
          color={current}
          onChange={handlePickerChange}
          onClose={() => setShowPicker(false)}
          triggerRect={triggerRect}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  COLOR GROUP — fixed accordion                                      */
/* ================================================================== */

interface ColorGroupProps {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ColorGroup({ title, badge, defaultOpen = true, children }: ColorGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);
  return (
    <div className="mb-2 last:mb-0">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-gray-50/80 transition-all group/btn">
        <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 shrink-0 ${open ? "" : "-rotate-90"}`} />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">{title}</span>
        {badge && <span className="text-[9px] font-medium text-indigo-500 bg-indigo-50/80 px-1.5 py-0.5 rounded-md ml-auto">{badge}</span>}
      </button>
      <div className={`${open ? "block mt-1.5" : "hidden"} space-y-1.5`}>
        {children}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SEARCH                                                             */
/* ================================================================== */

interface SearchFieldProps { value: string; onChange: (v: string) => void; }

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div className="relative">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Search color tokens..."
        className="w-full rounded-xl border border-gray-200/80 bg-white pl-9 pr-4 py-2.5 text-xs text-gray-700 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-gray-400" />
    </div>
  );
}

/* ================================================================== */
/*  FONT FIELD                                                         */
/* ================================================================== */

const GOOGLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
  "Source Sans Pro", "Nunito", "Raleway", "Ubuntu", "Playfair Display",
  "Merriweather", "PT Serif", "Work Sans", "DM Sans", "Plus Jakarta Sans",
  "Manrope", "Figtree", "Outfit", "JetBrains Mono", "Fira Code",
  "Space Mono", "DM Mono",
];

interface FontFieldProps {
  label: string;
  family: string;
  source: string;
  weights: number[];
  onFamilyChange: (v: string) => void;
  onSourceChange: (v: string) => void;
  onWeightsChange: (v: number[]) => void;
}

const WEIGHT_MAP: Record<number, string> = {
  100: "Thin", 200: "XL", 300: "Light", 400: "Regular",
  500: "Medium", 600: "Semibold", 700: "Bold", 800: "XBold", 900: "Black",
};

export function FontField({ label, family, source, weights, onFamilyChange, onSourceChange, onWeightsChange }: FontFieldProps) {
  const [search, setSearch] = useState("");
  const filtered = search ? GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(search.toLowerCase())) : GOOGLE_FONTS;
  const allWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  return (
    <div className="bg-white/90 rounded-2xl border border-gray-200/80 p-4 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-[9px] font-mono text-gray-400 bg-gray-100/80 px-1.5 py-0.5 rounded-md">{source}</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        <div className="col-span-3 space-y-1.5">
          <input type="text" placeholder="Search fonts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200/80 px-3.5 py-2 text-xs outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-50 transition-all" />
          <select value={family} onChange={(e) => onFamilyChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200/80 px-3.5 py-2 text-xs outline-none focus:border-indigo-400/60 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
            style={{ fontFamily: `'${family}', system-ui, sans-serif` }}>
            {filtered.map((f) => <option key={f} value={f} style={{ fontFamily: `'${f}', system-ui, sans-serif` }}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Source</label>
          <select value={source} onChange={(e) => onSourceChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200/80 px-2.5 py-2 text-xs outline-none focus:border-indigo-400/60 transition-all">
            <option value="google">Google</option>
            <option value="self-hosted">Self</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[9px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Weights</label>
        <div className="flex flex-wrap gap-1">
          {allWeights.map((w) => (
            <button key={w} type="button" onClick={() => onWeightsChange(weights.includes(w) ? weights.filter((x) => x !== w) : [...weights, w].sort())}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-lg border transition-all ${
                weights.includes(w) ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
              title={WEIGHT_MAP[w]}>{w}</button>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t border-gray-100/80">
        <p className="text-[9px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Preview</p>
        {weights.slice(0, 2).map((w) => (
          <p key={w} className="text-sm truncate py-0.5" style={{ fontFamily: `'${family}', system-ui, sans-serif`, fontWeight: w }}>
            The quick brown fox jumps — {w}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  NUMERIC SLIDER — clean, reliable                                   */
/* ================================================================== */

interface NumericFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  units?: string[];
}

export function NumericField({ label, value, onChange, min = 0, max = 200, step = 0.25, units = ["px", "rem"] }: NumericFieldProps) {
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);
  const num = parseFloat(val) || 0;
  const curUnit = units.find((u) => val.includes(u)) || units[0];
  const pct = ((num - min) / (max - min)) * 100;

  const update = (v: string, u?: string) => {
    const nv = v + (u ?? curUnit);
    setVal(nv);
    onChange(nv);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</label>
        <span className="text-[10px] font-mono text-gray-400">{val}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative h-5 flex items-center">
          <input type="range" min={min} max={max} step={step} value={num}
            onChange={(e) => update(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          {/* Visual track */}
          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
          </div>
          {/* Custom thumb indicator */}
          <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm pointer-events-none transition-all"
            style={{ left: `calc(${Math.min(100, Math.max(0, pct))}% - 8px)` }} />
        </div>
        <div className="flex items-center bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm shrink-0">
          <input type="text" value={val}
            onChange={(e) => { setVal(e.target.value); onChange(e.target.value); }}
            className="w-14 px-2.5 py-2 text-xs font-mono text-gray-700 text-center outline-none" />
          {units.length > 1 && (
            <select value={curUnit} onChange={(e) => update(num.toString(), e.target.value)}
              className="border-l border-gray-200/80 px-1.5 py-2 text-[10px] text-gray-500 bg-gray-50 outline-none cursor-pointer">
              {units.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SHADOW FIELD                                                       */
/* ================================================================== */

interface ShadowFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function ShadowRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-medium text-gray-400 w-8 shrink-0">{label}</span>
      <div className="flex-1 relative h-4 flex items-center">
        <input type="range" min={min} max={max} step={1} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-indigo-500 shadow-sm pointer-events-none transition-all"
          style={{ left: `calc(${Math.min(100, Math.max(0, pct))}% - 7px)` }} />
      </div>
      <span className="text-[10px] font-mono text-gray-400 w-9 text-right shrink-0">{value}px</span>
    </div>
  );
}

export function ShadowField({ label, value, onChange }: ShadowFieldProps) {
  const parts = value.match(/(-?\d+\.?\d*px)/g) || [];
  const [x = 0, y = 0, blur = 0, spread = 0] = parts.map((p) => parseFloat(p) || 0);
  const color = value.replace(/[\d.\-px\s]+/g, "").trim() || "rgb(0 0 0 / 0.1)";
  const rebuild = (nx: number, ny: number, nb: number, ns: number, nc: string) => onChange(`${nx}px ${ny}px ${nb}px ${ns}px ${nc}`);

  return (
    <div className="bg-white/90 rounded-2xl border border-gray-200/80 p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="h-7 w-12 rounded-lg border border-gray-200/80 bg-white transition-shadow" style={{ boxShadow: value }} />
      </div>
      <ShadowRow label="X" value={x} min={-20} max={20} onChange={(n) => rebuild(n, y, blur, spread, color)} />
      <ShadowRow label="Y" value={y} min={-20} max={20} onChange={(n) => rebuild(x, n, blur, spread, color)} />
      <ShadowRow label="Blur" value={blur} min={0} max={100} onChange={(n) => rebuild(x, y, n, spread, color)} />
      <ShadowRow label="Spr" value={spread} min={-20} max={20} onChange={(n) => rebuild(x, y, blur, n, color)} />
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] font-medium text-gray-400 w-8 shrink-0">Color</span>
        <span className="h-5 w-5 rounded-md border border-gray-200 shrink-0" style={{ backgroundColor: color }} />
        <input type="text" value={color} onChange={(e) => rebuild(x, y, blur, spread, e.target.value)}
          className="flex-1 rounded-lg border border-gray-200/80 px-2.5 py-1.5 text-[11px] font-mono outline-none focus:border-indigo-400/60 transition-all" />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COMPONENT VARIANT                                                  */
/* ================================================================== */

interface ComponentVariantFieldProps {
  label: string;
  variant: string;
  variants: Record<string, { classes: string }>;
  onVariantChange: (v: string) => void;
  onClassesChange: (variant: string, classes: string) => void;
}

/* Live preview sample markup per component type (uses standard .yo-* classes) */
const PREVIEW_SAMPLES: Record<string, React.ReactNode> = {
  button: <button className="yo-btn yo-btn-primary">Primary Button</button>,
  card: <div className="yo-card p-4 w-44"><p className="text-sm font-semibold">Card Title</p><p className="text-xs opacity-70 mt-1">Sample card body</p></div>,
  badge: <span className="yo-badge yo-badge-primary">New</span>,
  input: <input className="yo-input w-48" placeholder="Sample input..." />,
  alert: <div className="yo-alert yo-alert-success w-56"><span>Operation successful!</span></div>,
  navbar: <div className="yo-navbar w-72"><span className="yo-navbar-brand">Brand</span><span className="yo-navbar-link yo-navbar-link-active">Active</span></div>,
  sidebar: <div className="yo-sidebar w-40"><span className="yo-sidebar-item yo-sidebar-item-active">Dashboard</span><span className="yo-sidebar-item">Settings</span></div>,
  table: (
    <div className="yo-table-container w-64">
      <table className="yo-table">
        <thead><tr><th className="yo-table-header">A</th><th className="yo-table-header">B</th></tr></thead>
        <tbody><tr className="yo-table-row"><td className="yo-table-cell">1</td><td className="yo-table-cell">2</td></tr></tbody>
      </table>
    </div>
  ),
  footer: <div className="yo-footer w-64"><span className="yo-footer-link">Footer link</span></div>,
  accordion: (
    <div className="yo-accordion w-60">
      <div className="yo-accordion-item"><button className="yo-accordion-trigger">Section One <span>+</span></button><div className="yo-accordion-content">Collapsible body content.</div></div>
      <div className="yo-accordion-item"><button className="yo-accordion-trigger">Section Two <span>+</span></button></div>
    </div>
  ),
  modal: (
    <div className="yo-modal">
      <p className="text-sm font-semibold text-[var(--yo-text)]">Confirm action</p>
      <p className="text-xs text-[var(--yo-muted-foreground)] mt-1">This cannot be undone.</p>
      <div className="flex gap-2 mt-3 justify-end"><button className="yo-btn yo-btn-ghost !text-xs">Cancel</button><button className="yo-btn yo-btn-primary !text-xs">Confirm</button></div>
    </div>
  ),
  tabs: (
    <div className="yo-tabs w-64">
      <span className="yo-tab yo-tab-active">Overview</span>
      <span className="yo-tab">Activity</span>
      <span className="yo-tab">Settings</span>
    </div>
  ),
  breadcrumb: (
    <div className="yo-breadcrumb">
      <span>Home</span><span className="yo-breadcrumb-sep">/</span>
      <span>Projects</span><span className="yo-breadcrumb-sep">/</span>
      <span className="yo-breadcrumb-current">Current</span>
    </div>
  ),
  avatar: <div className="flex items-center gap-2"><span className="yo-avatar">JD</span><span className="yo-avatar !rounded-full">AB</span></div>,
  switch: (
    <div className="flex items-center gap-3">
      <span className="yo-switch" data-on="false"><span className="yo-switch-thumb" /></span>
      <span className="yo-switch" data-on="true"><span className="yo-switch-thumb" /></span>
    </div>
  ),
  progress: (
    <div className="w-52 space-y-2">
      <div className="yo-progress"><div className="yo-progress-bar" style={{ width: "65%" }} /></div>
      <div className="yo-progress"><div className="yo-progress-bar" style={{ width: "30%" }} /></div>
    </div>
  ),
  toast: (
    <div className="flex flex-col gap-2">
      <div className="yo-toast w-56"><span>Settings saved.</span></div>
      <div className="yo-toast yo-toast-success w-56"><span>Published successfully.</span></div>
    </div>
  ),
  tooltip: <span className="yo-tooltip">Hover tooltip text</span>,
  pagination: (
    <div className="yo-pagination">
      <span className="yo-page">‹</span><span className="yo-page yo-page-active">1</span>
      <span className="yo-page">2</span><span className="yo-page">3</span><span className="yo-page">›</span>
    </div>
  ),
};

export function ComponentVariantField({ label, variant, variants, onVariantChange, onClassesChange }: ComponentVariantFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const [stateView, setStateView] = useState<"default" | "hover" | "focus" | "active" | "disabled">("default");
  const activeClasses = variants[variant]?.classes ?? "";
  const sample = PREVIEW_SAMPLES[label.toLowerCase()];
  const stateClass =
    stateView === "disabled" ? "opacity-50 pointer-events-none cursor-not-allowed"
    : stateView === "focus" ? "ring-2 ring-offset-2 ring-indigo-500 rounded-lg"
    : stateView === "active" ? "brightness-90 [transform:scale(0.98)]"
    : stateView === "hover" ? "brightness-110"
    : "";
  const states: ("default" | "hover" | "focus" | "active" | "disabled")[] = ["default", "hover", "focus", "active", "disabled"];
  return (
    <div className="bg-white/90 rounded-2xl border border-gray-200/80 p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <button type="button" onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-medium text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50/60 px-2 py-0.5 rounded-lg transition-all">
          {expanded ? "Collapse" : "Edit Classes"}
        </button>
      </div>

      {/* Component state management preview */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mr-1">State</span>
        {states.map((s) => (
          <button key={s} type="button" onClick={() => setStateView(s)}
            className={`text-[9px] font-semibold px-2 py-1 rounded-lg border transition-all ${
              stateView === s ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
            }`}>{s}</button>
        ))}
      </div>

      {/* Live preview of the active variant */}
      <div className="flex items-center justify-center min-h-[3.5rem] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/60 border border-gray-100 p-3 overflow-x-auto">
        <span className={stateClass}>{sample ?? <span className="text-[10px] text-gray-400 font-mono break-all text-center">{activeClasses}</span>}</span>
      </div>

      {/* Tailwind class reference for this variant */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider shrink-0">Tailwind</span>
        <code className="text-[10px] font-mono text-indigo-600 bg-indigo-50/70 px-2 py-1 rounded-md truncate flex-1" title={activeClasses}>{activeClasses}</code>
      </div>

      {/* Variant selector */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(variants).map(([k]) => (
          <button key={k} type="button" onClick={() => onVariantChange(k)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-xl border transition-all ${
              variant === k ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}>{k.charAt(0).toUpperCase() + k.slice(1)}</button>
        ))}
      </div>

      {expanded && (
        <div className="space-y-2 pt-2 border-t border-gray-100/80">
          {Object.entries(variants).map(([k, cfg]) => (
            <div key={k} className="flex items-start gap-2">
              <span className="text-[10px] font-medium text-gray-500 w-12 shrink-0 mt-2">{k}</span>
              <input type="text" value={cfg.classes} onChange={(e) => onClassesChange(k, e.target.value)}
                className="flex-1 rounded-xl border border-gray-200/80 px-3 py-1.5 text-[11px] font-mono text-gray-700 outline-none focus:border-indigo-400/60 transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  SELECT / TEXT helpers                                              */
/* ================================================================== */

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200/80 px-3.5 py-2.5 text-xs text-gray-700 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-50 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}

export function TextField({ label, value, onChange, placeholder, mono }: TextFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-200/80 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-50 transition-all ${mono ? "font-mono" : ""}`} />
    </div>
  );
}
