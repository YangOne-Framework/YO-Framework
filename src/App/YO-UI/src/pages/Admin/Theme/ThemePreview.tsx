import { useState, useMemo } from "react";
import { Monitor, Tablet, Smartphone, Sun, Moon, LayoutDashboard, Globe, FileText, ShoppingCart, LogIn } from "lucide-react";
import { buildTokenCss } from "../../../context/YOThemeContext";
import type { ParsedThemeConfig } from "../../../types/yoThemeTypes";

type PreviewMode = "dashboard" | "landing" | "blog" | "form" | "pricing";
type DeviceMode = "desktop" | "tablet" | "mobile";
type ThemeMode = "light" | "dark";

interface Props { config: ParsedThemeConfig | null; }

export function ThemePreview({ config }: Props) {
  const [mode, setMode] = useState<PreviewMode>("dashboard");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [theme, setTheme] = useState<ThemeMode>("light");

  const cssVars = useMemo(() => {
    if (!config?.tokens) return "";
    const vars = buildTokenCss(config.tokens);
    if (theme === "dark" && config.tokens.colors) {
      const dark = Object.entries(config.tokens.colors).filter(([, v]) => v.dark).map(([k, v]) => `  --yo-${k}: ${v.dark};`).join("\n");
      return vars + "\n" + dark;
    }
    return vars;
  }, [config, theme]);

  if (!config) return <div className="flex items-center justify-center h-full text-sm text-gray-400">No theme loaded</div>;

  const t = config.tokens;
  const c = (name: string) => t.colors?.[name]?.default ?? "#e2e8f0";
  const f = (name: string) => t.fonts?.[name]?.family ?? "Inter";
  const r = (name: string) => t["border-radius"]?.[name] ?? "0.5rem";
  const s = (name: string) => t.shadows?.[name] ?? "0 1px 2px 0 rgb(0 0 0 / 0.05)";
  const primary = c("primary");

  const bg = theme === "dark" ? (t.colors?.bg?.dark ?? "#0f172a") : c("bg");
  const text = theme === "dark" ? (t.colors?.text?.dark ?? "#e2e8f0") : c("text");
  const border = theme === "dark" ? (t.colors?.border?.dark ?? "#334155") : c("border");
  const card = theme === "dark" ? (t.colors?.card?.dark ?? "#1e293b") : (t.colors?.card?.default ?? "#fff");
  const mutedText = theme === "dark" ? "#94a3b8" : c("muted");

  /* Device frame dimensions */
  const frameWidth = device === "mobile" ? "w-[375px]" : device === "tablet" ? "w-[768px]" : "w-full max-w-5xl";
  const frameRadius = device === "mobile" ? "rounded-[2.5rem]" : device === "tablet" ? "rounded-3xl" : "rounded-2xl";
  const frameBorder = device === "mobile" ? "border-[6px]" : device === "tablet" ? "border-[4px]" : "border";
  const frameShadow = device === "desktop" ? "shadow-2xl" : "shadow-2xl";

  const previewBar = (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: border }}>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 mx-4 flex items-center gap-4">
        <span className="text-xs font-bold tracking-tight" style={{ color: primary }}>Brand</span>
        {["Nav 1", "Nav 2", "Nav 3"].map((n) => (
          <span key={n} className="text-[11px] hidden sm:inline" style={{ color: text }}>{n}</span>
        ))}
      </div>
      <button className="text-[11px] font-medium px-3 py-1 rounded-lg text-white shadow-sm" style={{ backgroundColor: primary, borderRadius: r("sm") }}>Sign In</button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-100 to-gray-200/80">
      <style>{`:root { ${cssVars} }`}</style>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 shrink-0">
        <div className="flex items-center gap-1">
          {([["dashboard", LayoutDashboard], ["landing", Globe], ["blog", FileText], ["form", LogIn], ["pricing", ShoppingCart]] as const).map(([key, Icon]) => (
            <button key={key} onClick={() => setMode(key)}
              className={`p-2 rounded-xl transition-all ${mode === key ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <Icon size={15} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
            <button onClick={() => setTheme("light")}
              className={`p-1.5 rounded-lg transition-all ${theme === "light" ? "bg-white text-amber-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <Sun size={14} />
            </button>
            <button onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-lg transition-all ${theme === "dark" ? "bg-gray-800 text-yellow-400 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <Moon size={14} />
            </button>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([key, Icon]) => (
              <button key={key} onClick={() => setDevice(key)}
                className={`p-1.5 rounded-lg transition-all ${device === key ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview canvas with device frame */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className={`${frameWidth} ${frameRadius} ${frameBorder} ${frameShadow} transition-all duration-300 overflow-hidden bg-white`}
          style={{ borderColor: device === "desktop" ? "transparent" : "#2d2d2d", backgroundColor: bg, color: text, fontFamily: `'${f("body")}', system-ui, sans-serif` }}>
          {/* Notch for mobile */}
          {device === "mobile" && (
            <div className="flex justify-center -mt-[2px] mb-0">
              <div className="h-5 w-28 bg-black rounded-b-2xl flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                <span className="h-1 w-12 rounded-full bg-gray-800" />
              </div>
            </div>
          )}
          {device === "tablet" && (
            <div className="flex justify-center pt-1 pb-0">
              <span className="h-1.5 w-16 rounded-full bg-gray-800" />
            </div>
          )}

          {/* Preview content */}
          {mode === "dashboard" && <DashboardPreview c={c} f={f} r={r} s={s} primary={primary} bg={bg} text={text} border={border} card={card} mutedText={mutedText} previewBar={previewBar} />}
          {mode === "landing" && <LandingPreview c={c} f={f} r={r} s={s} primary={primary} bg={bg} text={text} border={border} card={card} mutedText={mutedText} previewBar={previewBar} />}
          {mode === "blog" && <BlogPreview c={c} f={f} r={r} primary={primary} bg={bg} text={text} border={border} card={card} mutedText={mutedText} previewBar={previewBar} />}
          {mode === "form" && <FormPreview c={c} f={f} r={r} primary={primary} bg={bg} text={text} border={border} card={card} mutedText={mutedText} previewBar={previewBar} />}
          {mode === "pricing" && <PricingPreview c={c} f={f} r={r} s={s} primary={primary} bg={bg} text={text} border={border} card={card} mutedText={mutedText} previewBar={previewBar} />}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PREVIEW VARIANTS                                                   */
/* ================================================================== */

function DashboardPreview({ c, f, r, s, primary, bg, text, border, card, mutedText, previewBar }: any) {
  return (
    <div>
      {previewBar}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: mutedText }}>Here's what's happening today.</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: primary + "15", color: primary }}>Last 7 days</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[ { l: "Revenue", v: "$48,295", ch: "+14.5%", up: true }, { l: "Users", v: "2,847", ch: "+8.2%", up: true }, { l: "Orders", v: "1,024", ch: "-3.1%", up: false }, { l: "Conv.", v: "3.24%", ch: "+1.8%", up: true } ].map((m) => (
            <div key={m.l} className="p-4 rounded-xl" style={{ backgroundColor: card, border: `1px solid ${border}`, boxShadow: s("sm") }}>
              <p className="text-[11px] font-medium" style={{ color: mutedText }}>{m.l}</p>
              <p className="text-xl font-bold mt-1" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>{m.v}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: m.up ? "#22c55e" : "#ef4444" }}>{m.ch}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 p-4 rounded-xl" style={{ backgroundColor: card, border: `1px solid ${border}` }}>
            <p className="text-sm font-semibold mb-3">Revenue Trend</p>
            <div className="flex items-end gap-2 h-28">
              {[35, 55, 42, 70, 60, 85, 75, 90, 65, 80, 72, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm transition-all hover:opacity-80" style={{ height: `${h * 0.7}%`, background: `linear-gradient(to top, ${primary}, ${primary}88)`, borderRadius: r("sm") }} />
              ))}
            </div>
          </div>
          <div className="col-span-2 p-4 rounded-xl" style={{ backgroundColor: card, border: `1px solid ${border}` }}>
            <p className="text-sm font-semibold mb-3">Activity</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: border }}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: primary }}>{i}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Event {i}</p>
                  <p className="text-[10px]" style={{ color: mutedText }}>{i * 2} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPreview({ c, f, r, s, primary, bg, text, border, card, mutedText, previewBar }: any) {
  return (
    <div>
      {previewBar}
      <section className="px-8 py-20 text-center space-y-6 bg-gradient-to-b from-transparent via-transparent to-gray-50/30" style={{ borderBottom: `1px solid ${border}` }}>
        <span className="text-[11px] font-medium px-3 py-1 rounded-full inline-block" style={{ backgroundColor: primary + "12", color: primary }}>Now in beta</span>
        <h1 className="text-4xl font-bold max-w-2xl mx-auto leading-[1.15] tracking-tight" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>
          Build something people <span style={{ color: primary }}>love</span>
        </h1>
        <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: mutedText }}>
          A modern platform for creating beautiful, performant digital experiences. Ship faster with confidence.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ backgroundColor: primary, borderRadius: r("md") }}>Get Started Free</button>
          <button className="text-sm font-semibold px-6 py-2.5 rounded-xl transition-all" style={{ border: `1.5px solid ${border}`, color: text, borderRadius: r("md") }}>Documentation</button>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-5 px-8 py-12">
        {[{ icon: "⚡", title: "Lightning Fast", desc: "Optimized for performance with automatic code splitting." }, { icon: "🔒", title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption." }, { icon: "🎨", title: "Beautiful Design", desc: "Pre-built components that look great out of the box." }].map((feat) => (
          <div key={feat.title} className="p-5 rounded-2xl space-y-3 transition-all hover:-translate-y-0.5" style={{ backgroundColor: card, border: `1px solid ${border}`, boxShadow: s("sm") }}>
            <span className="text-2xl">{feat.icon}</span>
            <p className="text-sm font-bold" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>{feat.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: mutedText }}>{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function BlogPreview({ c, f, r, primary, bg, text, border, card, mutedText, previewBar }: any) {
  return (
    <div>
      {previewBar}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>Latest Articles</h1>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: primary, borderRadius: r("sm") }}>View All</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <article key={i} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: card, border: `1px solid ${border}` }}>
              <div className="h-36 relative overflow-hidden" style={{ backgroundColor: primary + "20" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-xl opacity-40" style={{ backgroundColor: primary }} />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: primary + "15", color: primary }}>Design</span>
                  <span className="text-[10px]" style={{ color: mutedText }}>5 min read</span>
                </div>
                <p className="text-sm font-bold leading-snug" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>Article title goes here {i}</p>
                <p className="text-xs leading-relaxed" style={{ color: mutedText }}>A short description that gives readers a taste of what this article covers...</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormPreview({ c, f, r, primary, bg, text, border, card, mutedText, previewBar }: any) {
  return (
    <div>
      {previewBar}
      <div className="p-6 max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/20" style={{ backgroundColor: primary }}>Y</div>
          <h1 className="text-xl font-bold" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>Welcome back</h1>
          <p className="text-sm" style={{ color: mutedText }}>Sign in to your account</p>
        </div>
        <div className="space-y-4 p-6 rounded-2xl" style={{ backgroundColor: card, border: `1px solid ${border}` }}>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: text }}>Email</label>
            <input type="text" placeholder="you@example.com"
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
              style={{ borderColor: border, borderRadius: r("md"), backgroundColor: bg, color: text, "--tw-ring-color": primary } as React.CSSProperties} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: text }}>Password</label>
            <input type="password" placeholder="••••••••"
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
              style={{ borderColor: border, borderRadius: r("md"), backgroundColor: bg, color: text, "--tw-ring-color": primary } as React.CSSProperties} />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="rounded" style={{ accentColor: primary }} />
              Remember me
            </label>
            <span className="text-xs font-medium cursor-pointer" style={{ color: primary }}>Forgot?</span>
          </div>
          <button className="w-full text-sm font-semibold py-2.5 rounded-xl text-white shadow-lg transition-all hover:-translate-y-0.5" style={{ backgroundColor: primary, borderRadius: r("md"), boxShadow: `0 4px 14px ${primary}40` }}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingPreview({ c, f, r, s, primary, bg, text, border, card, mutedText, previewBar }: any) {
  const tiers = [
    { name: "Starter", price: "$19", desc: "For individuals", features: ["1 project", "Basic analytics", "48h support"] },
    { name: "Pro", price: "$49", desc: "For teams", features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domains"], featured: true },
    { name: "Enterprise", price: "$99", desc: "For organizations", features: ["Everything in Pro", "SSO", "99.99% SLA", "Dedicated manager", "Custom integrations"] },
  ];
  return (
    <div>
      {previewBar}
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: `'${f("heading")}', system-ui, sans-serif` }}>Simple Pricing</h1>
          <p className="text-sm mt-1" style={{ color: mutedText }}>No hidden fees, cancel anytime</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div key={tier.name} className="p-5 rounded-2xl space-y-4 transition-all hover:-translate-y-1" style={{
              backgroundColor: tier.featured ? primary : card,
              color: tier.featured ? "#fff" : text,
              border: `1px solid ${tier.featured ? primary : border}`,
              boxShadow: tier.featured ? `0 20px 40px ${primary}30` : s("md"),
              transform: tier.featured ? "scale(1.03)" : undefined,
            }}>
              <p className="text-xs font-semibold tracking-wider uppercase opacity-80">{tier.name}</p>
              <div>
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-xs opacity-70 ml-1">/mo</span>
              </div>
              <p className="text-xs opacity-80">{tier.desc}</p>
              <ul className="space-y-2">
                {tier.features.map((feat) => (
                  <li key={feat} className="text-xs flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full text-xs font-semibold py-2.5 rounded-xl transition-all" style={{
                backgroundColor: tier.featured ? "#fff" : primary,
                color: tier.featured ? primary : "#fff",
                borderRadius: r("md"),
              }}>Get Started</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
