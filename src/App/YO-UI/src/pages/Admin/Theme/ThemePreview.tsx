import { useState, useMemo } from "react";
import { Monitor, Tablet, Smartphone, Sun, Moon, LayoutDashboard, Globe, FileText, ShoppingCart, LogIn, ChevronRight, MessageSquare, Star, Plus, MapPin, Check, Eye, Grid3x3, AlertTriangle, Contrast, Circle } from "lucide-react";
import { buildTokenCss } from "../../../context/YOThemeContext";
import { GoogleFontLoader } from "../../../components/GoogleFontLoader";
import type { ParsedThemeConfig } from "../../../types/yoThemeTypes";

type PreviewMode = "dashboard" | "landing" | "blog" | "form" | "pricing" | "system";
type DeviceMode = "desktop" | "tablet" | "mobile";
type ThemeMode = "light" | "dark" | "midnight" | "high-contrast";
type Density = "comfortable" | "compact" | "dense";

interface Props { config: ParsedThemeConfig | null; }

/* Scoped overrides so the Spacing tab's sliders reflect live in the preview
   (Tailwind spacing utilities are compiled with fixed values, so we rebind
   the ones actually used inside the preview frame to the spacing tokens).
   Works for any token naming: a step maps to its token by name, otherwise to
   the token at the equivalent position on the theme's spacing scale. */
function parseLen(v: string): number {
  const m = /([\d.]+)\s*(px|rem|em)?/.exec(v ?? "");
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2] ?? "px";
  return unit === "rem" || unit === "em" ? n * 16 : n;
}
const SPACING_STEPS = ["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"];
const SPACING_NOMINAL: Record<string, number> = {
  "0":0,"0.5":2,"1":4,"1.5":6,"2":8,"2.5":10,"3":12,"3.5":14,"4":16,"5":20,"6":24,"7":28,"8":32,"9":36,
  "10":40,"11":44,"12":48,"14":56,"16":64,"20":80,"24":96,"28":112,"32":128,"36":144,"40":160,"44":176,
  "48":192,"52":208,"56":224,"60":240,"64":256,"72":288,"80":320,"96":384,
};

function buildSpacingOverrides(spacing?: Record<string, string>): string {
  if (!spacing) return "";
  const entries = Object.entries(spacing);
  if (entries.length === 0) return "";
  const byName = Object.fromEntries(entries);
  const sorted = [...entries].sort((a, b) => parseLen(a[1]) - parseLen(b[1]));
  const valueForStep = (step: string): string => {
    if (byName[step]) return byName[step];
    const target = SPACING_NOMINAL[step] ?? 0;
    let best = sorted[0];
    let bestDiff = Infinity;
    for (const e of sorted) {
      const d = Math.abs(parseLen(e[1]) - target);
      if (d < bestDiff) { bestDiff = d; best = e; }
    }
    return best ? best[1] : "0";
  };
  const esc = (n: string) => n.replace(/\./g, "\\.");
  const decls: [string, (v: string) => string][] = [
    ["p", (v) => `padding: ${v};`],
    ["px", (v) => `padding-left: ${v}; padding-right: ${v};`],
    ["py", (v) => `padding-top: ${v}; padding-bottom: ${v};`],
    ["pt", (v) => `padding-top: ${v};`],
    ["pb", (v) => `padding-bottom: ${v};`],
    ["pl", (v) => `padding-left: ${v};`],
    ["pr", (v) => `padding-right: ${v};`],
    ["m", (v) => `margin: ${v};`],
    ["mx", (v) => `margin-left: ${v}; margin-right: ${v};`],
    ["my", (v) => `margin-top: ${v}; margin-bottom: ${v};`],
    ["mt", (v) => `margin-top: ${v};`],
    ["mb", (v) => `margin-bottom: ${v};`],
    ["ml", (v) => `margin-left: ${v};`],
    ["mr", (v) => `margin-right: ${v};`],
    ["gap", (v) => `gap: ${v};`],
  ];
  let css = "";
  for (const step of SPACING_STEPS) {
    const v = valueForStep(step);
    for (const [prefix, tmpl] of decls) {
      css += `.yo-preview-root .${prefix}-${esc(step)} { ${tmpl(v)} }\n`;
    }
    css += `.yo-preview-root .space-x-${esc(step)} > * + * { margin-left: ${v}; }\n`;
    css += `.yo-preview-root .space-y-${esc(step)} > * + * { margin-top: ${v}; }\n`;
  }
  return css;
}

export function ThemePreview({ config }: Props) {
  const [mode, setMode] = useState<PreviewMode>("dashboard");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [cbMode, setCbMode] = useState<"none" | "protan" | "deutan" | "tritan">("none");
  const [showGrid, setShowGrid] = useState(false);
  const [cbOpen, setCbOpen] = useState(false);

  const cssVars = useMemo(() => {
    if (!config?.tokens) return "";
    /* Compile standard classes along with token variables */
    const vars = buildTokenCss(config.tokens, config.components);

    /* ── Multi-mode dimming overrides ── */
    let extra = "";
    if (theme === "dark") {
      const darkVars = Object.entries(config.tokens.colors)
        .filter(([, v]) => (v as any).dark)
        .map(([k, v]) => `  --yo-${k}: ${(v as any).dark};`)
        .join("\n");
      extra = `\n\n.yo-dark {\n${darkVars}\n  --yo-card: #111827;\n  --yo-cardForeground: #e2e8f0;\n  --yo-bg: #0b1120;\n  --yo-text: #f1f5f9;\n  --yo-border: #1e293b;\n}`;
    } else if (theme === "midnight") {
      const darkVars = Object.entries(config.tokens.colors)
        .filter(([, v]) => (v as any).dark)
        .map(([k, v]) => `  --yo-${k}: ${(v as any).dark};`)
        .join("\n");
      extra = `\n\n.yo-dark {\n${darkVars}\n  --yo-card: #0a0a0c;\n  --yo-cardForeground: #fafafa;\n  --yo-bg: #000000;\n  --yo-text: #ffffff;\n  --yo-muted: #a1a1aa;\n  --yo-border: #1f1f23;\n  --yo-popover: #0a0a0c;\n}`;
    } else if (theme === "high-contrast") {
      extra = `\n\n.yo-hc {\n  --yo-bg: #ffffff;\n  --yo-text: #000000;\n  --yo-card: #ffffff;\n  --yo-cardForeground: #000000;\n  --yo-popover: #ffffff;\n  --yo-popoverForeground: #000000;\n  --yo-muted: #000000;\n  --yo-mutedForeground: #1a1a1a;\n  --yo-border: #000000;\n  --yo-input: #ffffff;\n  --yo-ring: #000000;\n  --yo-primary: #0000ee;\n  --yo-primaryForeground: #ffffff;\n}`;
    }

    /* ── Data density scales (affect standard component spacing) ── */
    const densityCss =
      density === "compact"
        ? `\n\n.yo-density-compact .yo-card { padding: 1rem; }\n.yo-density-compact .yo-btn { padding: 0.4rem 1rem; }\n.yo-density-compact .yo-input { padding: 0.4rem 0.7rem; }\n.yo-density-compact .yo-navbar { padding: 0.5rem 1rem; }\n.yo-density-compact .yo-table th, .yo-density-compact .yo-table td { padding: 0.4rem 0.75rem; }\n.yo-density-compact .yo-badge { padding: 0.1rem 0.5rem; }`
        : density === "dense"
        ? `\n\n.yo-density-dense .yo-card { padding: 0.65rem; }\n.yo-density-dense .yo-btn { padding: 0.25rem 0.75rem; font-size: 0.8rem; }\n.yo-density-dense .yo-input { padding: 0.25rem 0.6rem; font-size: 0.8rem; }\n.yo-density-dense .yo-navbar { padding: 0.35rem 0.75rem; }\n.yo-density-dense .yo-table th, .yo-density-dense .yo-table td { padding: 0.25rem 0.6rem; font-size: 0.8rem; }\n.yo-density-dense .yo-badge { padding: 0.05rem 0.4rem; font-size: 0.65rem; }`
        : "";

    const spacingCss = buildSpacingOverrides(config.tokens.spacing);

    return vars + extra + densityCss + spacingCss;
  }, [config, theme, density]);

  if (!config) return <div className="flex items-center justify-center h-full text-sm text-gray-400">No theme configuration loaded</div>;

  const t = config.tokens;
  const f = (name: string) => t.fonts?.[name]?.family ?? "Inter";

  /* Frame width calculation */
  const frameWidth = device === "mobile" ? "w-[375px]" : device === "tablet" ? "w-[768px]" : "w-full max-w-5xl";
  const frameRadius = device === "mobile" ? "rounded-[2.5rem]" : device === "tablet" ? "rounded-3xl" : "rounded-2xl";
  const frameBorder = device === "mobile" ? "border-[6px]" : device === "tablet" ? "border-[4px]" : "border";

  /* Premium Standard Theme Shell Navbar */
  const previewNavbar = (
    <nav className="yo-navbar shrink-0">
      <div className="yo-navbar-brand">YangOne Studio</div>
      <div className="hidden sm:flex items-center gap-6">
        <span className="yo-navbar-link yo-navbar-link-active">Explore</span>
        <span className="yo-navbar-link">Solutions</span>
        <span className="yo-navbar-link">Pricing</span>
        <span className="yo-navbar-link">Showcase</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="yo-btn yo-btn-outline !py-1.5 !px-3 !text-xs">Sign In</button>
        <button className="yo-btn yo-btn-primary !py-1.5 !px-3.5 !text-xs">Get Started</button>
      </div>
    </nav>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-100 to-gray-200/80">
      <GoogleFontLoader fonts={config?.tokens?.fonts} />
      <style>{`${cssVars}`}</style>

      {/* Color-blindness simulation filters (SVG) */}
      <svg className="absolute w-0 h-0" aria-hidden>
        <filter id="cb-protan"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0  0 0 0 1 0" /></filter>
        <filter id="cb-deutan"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0  0 0 0 1 0" /></filter>
        <filter id="cb-tritan"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0  0 0.475 0.525 0  0 0 0 1 0" /></filter>
      </svg>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 shrink-0">
        <div className="flex items-center gap-1">
          {([
            ["dashboard", "Dashboard layout preview", LayoutDashboard],
            ["landing", "Landing page preview", Globe],
            ["blog", "Blog listing preview", FileText],
            ["form", "Form / login preview", LogIn],
            ["pricing", "Pricing page preview", ShoppingCart],
            ["system", "System status & validation states", AlertTriangle],
          ] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setMode(key)} title={label}
              className={`p-2 rounded-xl transition-all ${mode === key ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <Icon size={15} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Multi-mode dimming */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5" title="Theme mode / dimming variant">
            <button onClick={() => setTheme("light")} title="Light mode"
              className={`p-1.5 rounded-lg transition-all ${theme === "light" ? "bg-white text-amber-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Sun size={14} /></button>
            <button onClick={() => setTheme("dark")} title="Dark mode"
              className={`p-1.5 rounded-lg transition-all ${theme === "dark" ? "bg-gray-800 text-yellow-400 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Moon size={14} /></button>
            <button onClick={() => setTheme("midnight")} title="Midnight / OLED black"
              className={`p-1.5 rounded-lg transition-all ${theme === "midnight" ? "bg-gray-900 text-fuchsia-400 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Contrast size={14} /></button>
            <button onClick={() => setTheme("high-contrast")} title="High-contrast (strict compliance)"
              className={`p-1.5 rounded-lg transition-all ${theme === "high-contrast" ? "bg-white text-black ring-1 ring-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Circle size={14} /></button>
          </div>

          {/* Data density */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5" title="Data density scale">
            {(["comfortable", "compact", "dense"] as const).map((d) => (
              <button key={d} onClick={() => setDensity(d)} title={`${d} density`}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${density === d ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                {d === "comfortable" ? "Comf" : d === "compact" ? "Comp" : "Dense"}
              </button>
            ))}
          </div>

          {/* Color-blindness simulator */}
          <div className="relative">
            <button onClick={() => setCbOpen((v) => !v)} title="Simulate color vision deficiency"
              className={`p-1.5 rounded-lg transition-all ${cbMode !== "none" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <Eye size={14} />
            </button>
            {cbOpen && (
              <div className="absolute z-20 right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 text-xs">
                {([["none", "No simulation"], ["protan", "Protanopia (red)"], ["deutan", "Deuteranopia (green)"], ["tritan", "Tritanopia (blue)"]] as const).map(([k, label]) => (
                  <button key={k} onClick={() => { setCbMode(k); setCbOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${cbMode === k ? "text-indigo-600 font-medium" : "text-gray-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layout grid overlay */}
          <button onClick={() => setShowGrid((v) => !v)} title="Toggle layout grid overlay"
            className={`p-1.5 rounded-lg transition-all ${showGrid ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
            <Grid3x3 size={14} />
          </button>

          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
            {([
              ["desktop", "Desktop viewport", Monitor],
              ["tablet", "Tablet viewport", Tablet],
              ["mobile", "Mobile viewport", Smartphone],
            ] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setDevice(key)} title={label}
                className={`p-1.5 rounded-lg transition-all ${device === key ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview canvas with device frame */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className={`${frameWidth} ${frameRadius} ${frameBorder} shadow-2xl transition-all duration-300 overflow-hidden bg-[var(--yo-bg)] text-[var(--yo-text)] yo-preview-root ${theme === "dark" || theme === "midnight" ? "yo-dark" : theme === "high-contrast" ? "yo-hc" : ""} ${density !== "comfortable" ? `yo-density-${density}` : ""} ${config?.tokens?.motion?.reduced ? "yo-reduced-motion" : ""} relative`}
          style={{
            borderColor: device === "desktop" ? "transparent" : "#222",
            fontFamily: `'${f("body")}', system-ui, sans-serif`,
            filter: cbMode !== "none" ? `url(#cb-${cbMode})` : undefined,
          }}>
          
          {/* Notch for mobile */}
          {device === "mobile" && (
            <div className="flex justify-center -mt-[2px] mb-0 bg-black">
              <div className="h-5 w-28 bg-black rounded-b-2xl flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                <span className="h-1 w-12 rounded-full bg-gray-800" />
              </div>
            </div>
          )}
          {device === "tablet" && (
            <div className="flex justify-center pt-1.5 pb-1 bg-black">
              <span className="h-1.5 w-16 rounded-full bg-gray-800" />
            </div>
          )}

          {/* Layout grid overlay */}
          {showGrid && (
            <div className="pointer-events-none absolute inset-0 z-10"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(99,102,241,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.12) 1px, transparent 1px)",
                backgroundSize: "var(--spacing-4, 1rem) var(--spacing-4, 1rem)",
              }} />
          )}

          {/* Render Preview Layouts exclusively with Standard CSS Classes */}
          <div className="yo-body min-h-[500px] flex flex-col bg-[var(--yo-bg)] text-[var(--yo-text)]">
            {mode === "dashboard" && <DashboardPreview navbar={previewNavbar} />}
            {mode === "landing" && <LandingPreview navbar={previewNavbar} />}
            {mode === "blog" && <BlogPreview navbar={previewNavbar} />}
            {mode === "form" && <FormPreview navbar={previewNavbar} />}
            {mode === "pricing" && <PricingPreview navbar={previewNavbar} />}
            {mode === "system" && <SystemStatusPreview />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DASHBOARD PREVIEW (Standard Platform Classes)                     */
/* ================================================================== */

function DashboardPreview({ navbar }: { navbar: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      {navbar}
      <div className="flex flex-1">
        {/* Standard Sidebar */}
        <div className="yo-sidebar w-48 hidden md:block shrink-0">
          <div className="space-y-1">
            <span className="yo-sidebar-item yo-sidebar-item-active">Overview</span>
            <span className="yo-sidebar-item">Analytics</span>
            <span className="yo-sidebar-item">Campaigns</span>
            <span className="yo-sidebar-item">Design Tokens</span>
            <span className="yo-sidebar-item">Custom CSS</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="yo-heading-1 text-xl">Operational Board</h1>
              <p className="text-xs text-[var(--yo-muted-foreground)] mt-0.5">Real-time stats compiled from standard classes.</p>
            </div>
            <button className="yo-btn yo-btn-primary !py-1.5 !px-3 !text-xs">
              <Plus size={12} /> Add Metric
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Active Revenue", val: "$24,592.10", b: "primary" },
              { label: "Unique Readers", val: "4,821", b: "secondary" },
              { label: "Pending Orders", val: "18", b: "accent" }
            ].map((card, i) => (
              <div key={i} className="yo-card p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                  <span className={`yo-badge yo-badge-${card.b}`}>{card.b}</span>
                </div>
                <h3 className="text-xl font-extrabold text-[var(--yo-text)]">{card.val}</h3>
                <p className="text-[9px] text-green-500 font-semibold">+12% from last quarter</p>
              </div>
            ))}
          </div>

          {/* Standard Table Component */}
          <div className="yo-card">
            <div className="yo-card-header flex justify-between items-center">
              <span>Latest Customer Transactions</span>
              <span className="yo-badge yo-badge-success">Sync Active</span>
            </div>
            <div className="yo-table-container">
              <table className="yo-table">
                <thead>
                  <tr>
                    <th className="yo-table-header">Customer</th>
                    <th className="yo-table-header">Location</th>
                    <th className="yo-table-header">Status</th>
                    <th className="yo-table-header">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "John Doe", loc: "San Francisco, CA", status: "success", amt: "$120.00" },
                    { name: "Sarah Connor", loc: "Los Angeles, CA", status: "danger", amt: "$450.00" },
                    { name: "Bruce Wayne", loc: "Gotham City", status: "primary", amt: "$9,240.00" }
                  ].map((row, i) => (
                    <tr key={i} className="yo-table-row">
                      <td className="yo-table-cell font-semibold">{row.name}</td>
                      <td className="yo-table-cell text-xs text-[var(--yo-muted-foreground)]"><MapPin size={10} className="inline mr-1" />{row.loc}</td>
                      <td className="yo-table-cell"><span className={`yo-badge yo-badge-${row.status}`}>{row.status}</span></td>
                      <td className="yo-table-cell font-bold font-mono text-xs">{row.amt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LANDING PREVIEW (Standard Platform Classes)                       */
/* ================================================================== */

function LandingPreview({ navbar }: { navbar: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      {navbar}
      
      {/* Hero Section */}
      <section className="px-6 py-16 text-center space-y-6 max-w-3xl mx-auto">
        <span className="yo-badge yo-badge-accent">Core Framework System</span>
        <h1 className="yo-heading-1 text-3xl sm:text-4xl leading-tight">
          Enterprise Design System Builder. Custom-tailored layout <span className="text-[var(--yo-primary)]">instantly</span>.
        </h1>
        <p className="text-sm leading-relaxed max-w-lg mx-auto text-[var(--yo-muted-foreground)]">
          Create premium sellable themes in minutes. Standard component classes give you full power without messy inline configurations.
        </p>
        <div className="flex items-center justify-center gap-3 pt-3">
          <button className="yo-btn yo-btn-primary">Get Started Free <ChevronRight size={14} /></button>
          <button className="yo-btn yo-btn-outline">Read Tech Specs</button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-6 bg-gradient-to-b from-transparent to-[var(--yo-border)]">
        {[
          { title: "Universal CSS Classes", desc: "No inline styling. Compile robust standard .yo-* components matching Bootstrap/Bulma premium features." },
          { title: "Instant Dark Conversion", desc: "Native contrast and math engines analyze your colors to compile optimized dark-variants on-the-fly." },
          { title: "Fluid Custom Layouts", desc: "Reorganize columns, sidebar orientations, footers, and page-widths directly from the admin dashboard." }
        ].map((feat, i) => (
          <div key={i} className="yo-card yo-card-hover p-5 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--yo-primary)] flex items-center justify-center text-white font-bold shadow-md">
              {i + 1}
            </div>
            <h3 className="yo-heading-3 text-sm">{feat.title}</h3>
            <p className="text-xs text-[var(--yo-muted-foreground)] leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ================================================================== */
/*  BLOG PREVIEW (Standard Platform Classes)                          */
/* ================================================================== */

function BlogPreview({ navbar }: { navbar: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      {navbar}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="yo-heading-1 text-xl">Design & Engineering Blog</h1>
            <p className="text-xs text-[var(--yo-muted-foreground)]">Premium curated news for web builders.</p>
          </div>
          <button className="yo-btn yo-btn-outline !py-1.5 !px-3 !text-xs">Browse Categories</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <article key={i} className="yo-card yo-card-hover flex flex-col">
              <div className="h-40 bg-[var(--yo-primary)]/10 flex items-center justify-center text-[var(--yo-primary)] border-b border-[var(--yo-border)] font-bold text-lg">
                #ArticleCover{i}
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="yo-badge yo-badge-secondary">Engineering</span>
                    <span className="text-[10px] text-[var(--yo-muted-foreground)]">4 mins read</span>
                  </div>
                  <h3 className="yo-heading-2 text-sm">Building world-class sellable UI kits from standard templates</h3>
                  <p className="text-xs text-[var(--yo-muted-foreground)] leading-relaxed line-clamp-2">Learn the exact workflow premium developers use to compile custom themes using variables and robust class names.</p>
                </div>
                <button className="yo-btn yo-btn-text !text-xs self-start !px-0">Read Article <ChevronRight size={12} /></button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  FORM PREVIEW (Standard Platform Classes)                          */
/* ================================================================== */

function FormPreview({ navbar }: { navbar: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      {navbar}
      <div className="p-6 max-w-sm mx-auto w-full">
        <div className="yo-card p-6 space-y-5">
          <div className="text-center space-y-1">
            <h1 className="yo-heading-1 text-lg">Platform Onboarding</h1>
            <p className="text-xs text-[var(--yo-muted-foreground)]">Provide credentials to activate premium tools</p>
          </div>

          <div className="space-y-3">
            <div className="yo-form-group">
              <label className="yo-label">Company Email</label>
              <input type="email" placeholder="designers@agency.com" className="yo-input" />
            </div>

            <div className="yo-form-group">
              <label className="yo-label">Customizer Secret Password</label>
              <input type="password" placeholder="••••••••" className="yo-input" />
            </div>

            <div className="yo-form-group">
              <label className="yo-label">Select Framework Edition</label>
              <select className="yo-select">
                <option>YangOne Premium Studio (Recommended)</option>
                <option>YangOne Lite Community</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded border-[var(--yo-border)] accent-[var(--yo-primary)]" />
                Remember credentials
              </label>
              <span className="text-[var(--yo-primary)] font-semibold cursor-pointer">Recover Code?</span>
            </div>

            <button className="yo-btn yo-btn-primary w-full !mt-2">Unlock Enterprise Access</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PRICING PREVIEW (Standard Platform Classes)                       */
/* ================================================================== */

function PricingPreview({ navbar }: { navbar: React.ReactNode }) {
  const tiers = [
    { name: "Starter Kit", price: "$29", desc: "For single designers", features: ["1 Active Theme", "3 layout templates", "Email support"], b: "outline" },
    { name: "Agency Suite", price: "$89", desc: "For growing production teams", features: ["Unlimited themes", "Customizer code variables", "Auto dark conversion", "Standard platform classes"], featured: true, b: "primary" },
    { name: "Enterprise Pro", price: "$249", desc: "For worldwide premium sells", features: ["White-labeled output", "Zip package imports", "Dedicated theme manager", "Live API endpoints"], b: "outline" }
  ];

  return (
    <div className="flex flex-col flex-1">
      {navbar}
      <div className="p-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="yo-badge yo-badge-accent">Guaranteed Sales Boost</span>
          <h1 className="yo-heading-1 text-2xl">Simple, transparent, standard prices.</h1>
          <p className="text-xs text-[var(--yo-muted-foreground)]">Launch premium-grade websites without compounding fees.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <div key={i} className={`yo-card p-5 space-y-4 flex flex-col justify-between ${tier.featured ? "border-[var(--yo-primary)] scale-[1.03]" : ""}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tier.name}</span>
                  {tier.featured && <span className="yo-badge yo-badge-accent">Most Popular</span>}
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-[var(--yo-text)]">{tier.price}</span>
                  <span className="text-xs text-[var(--yo-muted-foreground)]"> / mo</span>
                </div>
                <p className="text-xs text-[var(--yo-muted-foreground)] leading-relaxed">{tier.desc}</p>
                
                <ul className="space-y-2 pt-2 border-t border-[var(--yo-border)]">
                  {tier.features.map((feat) => (
                    <li key={feat} className="text-xs flex items-center gap-2">
                      <Check size={12} className="text-green-500 shrink-0" />
                      <span className="text-xs text-[var(--yo-text)]">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`yo-btn yo-btn-${tier.b} w-full`}>Select Plan</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* System status viewport — error, warning, validation & empty states */
function SystemStatusPreview() {
  return (
    <div className="flex flex-col flex-1">
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="yo-heading-1 text-xl">System Status & Validation</h1>
          <p className="text-xs text-[var(--yo-muted-foreground)]">Stress-test your tokens against real interface failure states.</p>
        </div>

        {/* Alert banners */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alert Banners</span>
          <div className="yo-alert yo-alert-info">Heads up — your trial expires in 3 days.</div>
          <div className="yo-alert yo-alert-success">Profile saved successfully.</div>
          <div className="yo-alert yo-alert-warning">Low disk space — exports may fail.</div>
          <div className="yo-alert yo-alert-error">Payment failed. Please update your card.</div>
        </div>

        {/* Form validation */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Form Validation</span>
          <div className="yo-card p-4 space-y-3 max-w-md">
            <div>
              <label className="text-xs font-medium text-[var(--yo-text)]">Email address</label>
              <input className="yo-input w-full border-red-400" defaultValue="not-an-email" />
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={11} />Enter a valid email address.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--yo-text)]">Username</label>
              <input className="yo-input w-full border-green-400" defaultValue="jane_doe" />
              <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1"><Check size={11} />Looks good.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--yo-text)]">Disabled field</label>
              <input className="yo-input w-full opacity-50 cursor-not-allowed" disabled defaultValue="Read only" />
            </div>
            <div className="flex gap-2 pt-1">
              <button className="yo-btn yo-btn-primary">Submit</button>
              <button className="yo-btn yo-btn-outline" disabled>Disabled</button>
            </div>
          </div>
        </div>

        {/* Empty state + toast */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Empty State & Toast</span>
          <div className="yo-card p-8 flex flex-col items-center justify-center text-center space-y-2 border-dashed">
            <div className="h-10 w-10 rounded-full bg-[var(--yo-muted)]/20 flex items-center justify-center text-[var(--yo-muted-foreground)]">
              <Plus size={18} />
            </div>
            <p className="text-xs font-semibold text-[var(--yo-text)]">No projects yet</p>
            <p className="text-[11px] text-[var(--yo-muted-foreground)]">Create your first project to get started.</p>
            <button className="yo-btn yo-btn-primary !text-xs">New Project</button>
          </div>
          <div className="yo-alert yo-alert-success flex items-center justify-between">
            <span>Settings synced to all environments.</span>
            <button className="yo-btn yo-btn-ghost !text-xs !py-1 !px-2">Undo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
