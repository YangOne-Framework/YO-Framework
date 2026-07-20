import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Palette, Type, Square, Box as ShadowIcon,
  Maximize2, Layers, Grid3X3, Code, Sparkles, Copy, Download,
  Upload, RotateCcw, Plus, MoreHorizontal, Check, Eye, GitCompare,
  Pencil, X, AlertCircle, RefreshCw, Layers3, CheckSquare, Sparkle, History,
} from "lucide-react";
import {
  useGetThemeQuery,
  useSaveThemeMutation,
  useActivateThemeMutation,
} from "../../../redux/theme/themeAPI";
import { parseThemeConfig } from "../../../context/YOThemeContext";
import {
  ColorField, ColorGroup, SearchField,
  FontField, NumericField, ShadowField,
  ComponentVariantField, SelectField,
} from "./ThemeTokenFields";
import { ThemePreview } from "./ThemePreview";
import {
  generatePalette,
  deriveDarkFromLight,
  applyPresetToConfig,
  applyPaletteToConfig,
  THEME_PRESETS,
  FONT_PAIRINGS,
  scaleRadius,
  isValidHex,
  Harmony,
  mergeStandardComponents,
  STANDARD_COMPONENTS,
  buildCssVariablesExport,
  buildTailwindConfig,
  buildReactTheme,
  buildMultiTenantCss,
  buildTailwindV4,
  buildStyleDictionary,
  buildColorScale,
  applyScaleToConfig,
  hexToRgba,
  parseFigmaVariables,
  buildFluidScale,
} from "./themeUtils";
import type { ParsedThemeConfig, ThemeTokens } from "../../../types/yoThemeTypes";

/* ================================================================== */
/*  Types & config                                                      */
/* ================================================================== */

type EditorTab = "colors" | "typography" | "radius" | "spacing" | "shadow" | "components" | "layouts" | "preview" | "code" | "generate";

const TABS: { id: EditorTab; label: string; icon: any }[] = [
  { id: "colors", label: "Colors", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "radius", label: "Radius", icon: Square },
  { id: "spacing", label: "Spacing", icon: Maximize2 },
  { id: "shadow", label: "Shadow", icon: ShadowIcon },
  { id: "components", label: "Components", icon: Layers },
  { id: "layouts", label: "Layouts", icon: Grid3X3 },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "code", label: "Code", icon: Code },
  { id: "generate", label: "Generate", icon: Sparkles },
];

const COLOR_GROUPS = [
  { title: "Brand", tokens: ["primary", "secondary", "accent"] },
  { title: "Base", tokens: ["bg", "foreground"] },
  { title: "Surfaces", tokens: ["card", "cardForeground", "popover", "popoverForeground"] },
  { title: "Text", tokens: ["text", "muted", "mutedForeground"] },
  { title: "Actions", tokens: ["destructive", "destructiveForeground"] },
  { title: "Forms", tokens: ["border", "input", "ring"] },
  { title: "Sidebar", tokens: ["sidebarBackground", "sidebarForeground", "sidebarPrimary", "sidebarAccent", "sidebarBorder", "sidebarRing"] },
  { title: "Charts", tokens: ["chart1", "chart2", "chart3", "chart4", "chart5"] },
];

function generateGUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ── History change diffing ──────────────────────────────
   Captures exactly what changed between two theme snapshots
   so the Edit History list shows e.g. "primary  #f43f5e → #3b82f6". */
export type HistoryChange = {
  category: "color" | "font" | "radius" | "spacing" | "shadow" | "motion" | "focus" | "fluid" | "component" | "layout";
  name: string;
  oldValue?: string;
  newValue?: string;
};

function fmtVal(v: unknown): string {
  if (v == null) return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function diffThemeConfig(prev: ParsedThemeConfig | null | undefined, next: ParsedThemeConfig): HistoryChange[] {
  const out: HistoryChange[] = [];
  if (!prev || !prev.tokens || !next.tokens) return out;
  const pt = prev.tokens;
  const nt = next.tokens;

  const pColors = pt.colors ?? {};
  const nColors = nt.colors ?? {};
  for (const k of new Set([...Object.keys(pColors), ...Object.keys(nColors)])) {
    if (pColors[k]?.default !== nColors[k]?.default) {
      out.push({ category: "color", name: k, oldValue: pColors[k]?.default ?? "—", newValue: nColors[k]?.default ?? "—" });
    }
  }

  const pFonts = pt.fonts ?? {};
  const nFonts = nt.fonts ?? {};
  for (const k of new Set([...Object.keys(pFonts), ...Object.keys(nFonts)])) {
    if (pFonts[k]?.family !== nFonts[k]?.family) {
      out.push({ category: "font", name: k, oldValue: pFonts[k]?.family ?? "—", newValue: nFonts[k]?.family ?? "—" });
    }
  }

  const diffScale = (category: HistoryChange["category"], pk: Record<string, any> = {}, nk: Record<string, any> = {}) => {
    for (const k of new Set([...Object.keys(pk), ...Object.keys(nk)])) {
      if (fmtVal(pk[k]) !== fmtVal(nk[k])) out.push({ category, name: k, oldValue: fmtVal(pk[k]), newValue: fmtVal(nk[k]) });
    }
  };
  diffScale("spacing", pt.spacing, nt.spacing);
  diffScale("radius", pt["border-radius"], nt["border-radius"]);
  diffScale("shadow", pt.shadows, nt.shadows);
  diffScale("motion", pt.motion, nt.motion);
  diffScale("focus", pt.focus, nt.focus);
  diffScale("fluid", pt.fluid, nt.fluid);

  const pComp = prev.components ?? {};
  const nComp = next.components ?? {};
  for (const k of new Set([...Object.keys(pComp), ...Object.keys(nComp)])) {
    if ((pComp[k]?.variant ?? "") !== (nComp[k]?.variant ?? "")) {
      out.push({ category: "component", name: k, oldValue: pComp[k]?.variant ?? "—", newValue: nComp[k]?.variant ?? "—" });
    }
  }

  if ((prev.structure?.layoutType ?? "") !== (next.structure?.layoutType ?? "")) {
    out.push({ category: "layout", name: "layout", oldValue: prev.structure?.layoutType ?? "—", newValue: next.structure?.layoutType ?? "—" });
  }

  return out;
}

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */

export default function ThemeEditor() {
  const { guid } = useParams<{ guid: string }>();
  const navigate = useNavigate();
  const { data: theme, isLoading, refetch } = useGetThemeQuery(guid!);
  const [saveTheme] = useSaveThemeMutation();
  const [activateTheme] = useActivateThemeMutation();

  const [tab, setTab] = useState<EditorTab>("colors");
  const [config, setConfig] = useState<ParsedThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [colorSearch, setColorSearch] = useState("");
  const [scaleBase, setScaleBase] = useState("#6366f1");
  const [scaleName, setScaleName] = useState("brand");
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Modal state */
  const [modal, setModal] = useState<"rename" | "import" | "assign" | "compare" | null>(null);
  const [newNameInput, setNewNameInput] = useState("");
  const [importJsonInput, setImportJsonInput] = useState("");
  const [importError, setImportError] = useState("");
  const [assignedPages, setAssignedPages] = useState<string[]>(["Home", "Blog Home"]);

  /* ── Session history / undo snapshots ── */
  type Snapshot = { id: number; label: string; ts: number; config: ParsedThemeConfig; changes?: HistoryChange[] };
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const configRef = useRef<ParsedThemeConfig | null>(null);
  const lastSnapJson = useRef<string>("");
  const lastSnapConfigRef = useRef<ParsedThemeConfig | null>(null);
  const firstRun = useRef(true);

  const pushSnapshot = useCallback((label: string) => {
    const c = configRef.current;
    if (!c) return;
    const changes = diffThemeConfig(lastSnapConfigRef.current, c);
    setHistory((h) => {
      const next = [{ id: Date.now() + Math.floor(Math.random() * 1000), label, ts: Date.now(), config: JSON.parse(JSON.stringify(c)), changes }, ...h].slice(0, 40);
      try { localStorage.setItem(`yotheme-history-${guid ?? "new"}`, JSON.stringify(next)); } catch {}
      return next;
    });
    lastSnapConfigRef.current = JSON.parse(JSON.stringify(c));
  }, [guid]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`yotheme-history-${guid ?? "new"}`);
      if (saved) {
        const parsed = JSON.parse(saved) as Snapshot[];
        setHistory(parsed);
        if (parsed[0]) lastSnapConfigRef.current = parsed[0].config;
      }
    } catch {}
  }, [guid]);

  /* Auto-snapshot after edits settle (debounced) */
  useEffect(() => {
    configRef.current = config;
    if (firstRun.current) { firstRun.current = false; lastSnapJson.current = JSON.stringify(config); lastSnapConfigRef.current = config; return; }
    const json = JSON.stringify(config);
    if (json === lastSnapJson.current) return;
    lastSnapJson.current = json;
    const id = setTimeout(() => pushSnapshot("Edit"), 1200);
    return () => clearTimeout(id);
  }, [config, pushSnapshot]);

  const restoreSnapshot = useCallback((snap: Snapshot) => {
    setConfig(JSON.parse(JSON.stringify(snap.config)));
    setDirty(true);
    lastSnapConfigRef.current = JSON.parse(JSON.stringify(snap.config));
    setToast({ msg: "Snapshot restored", type: "info" });
  }, []);

  /* Outside click to close menu */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (theme) {
      setConfig(parseThemeConfig(theme.Config));
      setNewNameInput(theme.Name);
    }
  }, [theme]);

  const updateTokens = useCallback((updater: (t: ThemeTokens) => ThemeTokens) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return { ...prev, tokens: updater(prev.tokens) };
    });
    setDirty(true);
  }, []);

  const updateConfig = useCallback((updater: (p: ParsedThemeConfig) => ParsedThemeConfig) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
    setDirty(true);
  }, []);

  /* ── Token getters ── */
  const getColor = (name: string) => config?.tokens?.colors?.[name]?.default ?? "";
  const getDarkColor = (name: string) => config?.tokens?.colors?.[name]?.dark ?? "";
  const colorExists = (name: string) => !!config?.tokens?.colors?.[name];

  const updateColor = useCallback((name: string, value: string) => {
    updateTokens((t) => ({
      ...t,
      colors: {
        ...t.colors,
        [name]: { ...(t.colors[name] ?? {}), default: value },
      },
    }));
  }, [updateTokens]);

  const updateDarkColor = useCallback((name: string, value: string) => {
    updateTokens((t) => ({
      ...t,
      colors: {
        ...t.colors,
        [name]: { ...t.colors[name], dark: value },
      },
    }));
  }, [updateTokens]);

  const toggleSyncColor = useCallback((name: string) => {
    updateTokens((t) => {
      const current = t.colors[name];
      if (!current) return t;
      const isSynced = current.default === current.dark;
      return {
        ...t,
        colors: {
          ...t.colors,
          [name]: { ...current, dark: isSynced ? "" : current.default },
        },
      };
    });
  }, [updateTokens]);

  const resetColor = useCallback((name: string) => {
    updateTokens((t) => {
      const c = { ...t.colors };
      delete c[name];
      return { ...t, colors: c };
    });
  }, [updateTokens]);

  const updateFont = useCallback((name: string, field: "family" | "source" | "weights", value: string | number[]) => {
    updateTokens((t) => ({
      ...t,
      fonts: {
        ...t.fonts,
        [name]: { ...t.fonts[name], [field]: value },
      },
    }));
  }, [updateTokens]);

  const updateNumeric = useCallback((cat: "spacing" | "border-radius", name: string, value: string) => {
    updateTokens((t) => ({ ...t, [cat]: { ...t[cat], [name]: value } }));
  }, [updateTokens]);

  const updateShadow = useCallback((name: string, value: string) => {
    updateTokens((t) => ({ ...t, shadows: { ...t.shadows, [name]: value } }));
  }, [updateTokens]);

  const updateComponentVariant = useCallback((comp: string, variant: string) => {
    updateConfig((prev) => ({
      ...prev,
      components: { ...prev.components, [comp]: { ...prev.components[comp], variant } },
    }));
  }, [updateConfig]);

  const updateComponentClasses = useCallback((comp: string, vk: string, cls: string) => {
    updateConfig((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [comp]: {
          ...prev.components[comp],
          variants: {
            ...prev.components[comp].variants,
            [vk]: { ...prev.components[comp].variants[vk], classes: cls },
          },
        },
      },
    }));
  }, [updateConfig]);

  const updateLayoutType = useCallback((value: string) => {
    updateConfig((prev) => ({
      ...prev,
      structure: { ...prev.structure, layoutType: value },
    }));
  }, [updateConfig]);

  /* ── Save ── */
  const handleSave = useCallback(async () => {
    if (!theme || !config) return;
    setSaving(true);
    try {
      await saveTheme({
        YOThemeUniqueId: theme.YOThemeUniqueId,
        Name: theme.Name,
        Slug: theme.Slug,
        Version: theme.Version,
        Author: theme.Author,
        Description: theme.Description,
        Tags: theme.Tags,
        Config: JSON.stringify(config, null, 2),
      }).unwrap();
      setDirty(false);
      refetch();
    } catch (e: any) {
      alert(e?.data?.Message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [theme, config, saveTheme, refetch]);

  /* ================================================================== */
  /*  Menu Actions                                                      */
  /* ================================================================== */

  const handleCreateNewTheme = async () => {
    if (!config) return;
    const name = prompt("Enter name for new theme:");
    if (!name) return;
    const nextGuid = generateGUID();
    setSaving(true);
    try {
      await saveTheme({
        YOThemeUniqueId: nextGuid,
        Name: name,
        Slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        Version: "1.0.0",
        Author: "Admin",
        Description: "Created from scratch",
        Config: JSON.stringify(config, null, 2),
      }).unwrap();
      alert(`Theme "${name}" created successfully! Redirecting...`);
      navigate(`/admin/theme/editor/${nextGuid}`);
    } catch (e: any) {
      alert(e?.data?.Message ?? "Failed to create theme");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateTheme = async () => {
    if (!theme || !config) return;
    const name = prompt("Enter name for duplicated theme:", `${theme.Name} Copy`);
    if (!name) return;
    const nextGuid = generateGUID();
    setSaving(true);
    try {
      await saveTheme({
        YOThemeUniqueId: nextGuid,
        Name: name,
        Slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        Version: theme.Version,
        Author: theme.Author,
        Description: `Duplicate of ${theme.Name}`,
        Tags: theme.Tags,
        Config: JSON.stringify(config, null, 2),
      }).unwrap();
      alert(`Theme "${theme.Name}" duplicated into "${name}"! Redirecting...`);
      navigate(`/admin/theme/editor/${nextGuid}`);
    } catch (e: any) {
      alert(e?.data?.Message ?? "Failed to duplicate theme");
    } finally {
      setSaving(false);
    }
  };

  const handleRenameTheme = async () => {
    if (!theme || !config || !newNameInput.trim()) return;
    setSaving(true);
    try {
      await saveTheme({
        YOThemeUniqueId: theme.YOThemeUniqueId,
        Name: newNameInput.trim(),
        Slug: theme.Slug,
        Version: theme.Version,
        Author: theme.Author,
        Description: theme.Description,
        Tags: theme.Tags,
        Config: JSON.stringify(config, null, 2),
      }).unwrap();
      setModal(null);
      refetch();
    } catch (e: any) {
      alert(e?.data?.Message ?? "Failed to rename theme");
    } finally {
      setSaving(false);
    }
  };

  const handleExportTheme = () => {
    if (!theme || !config) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${theme.Slug}-config.json`);
    dlAnchorElem.click();
    setShowThemeMenu(false);
  };

  const handleImportTheme = () => {
    try {
      /* Figma Variables export → merge color tokens */
      const figma = parseFigmaVariables(importJsonInput);
      if (figma) {
        setConfig((c) => {
          const base: ParsedThemeConfig = c ?? {
            tokens: { colors: {}, fonts: {}, spacing: {}, "border-radius": {}, shadows: {} },
            components: {},
            structure: { layoutType: "sidebar-right", layoutTypes: {} },
            layouts: {},
            templates: {},
          };
          return { ...base, tokens: { ...base.tokens, colors: { ...base.tokens.colors, ...figma } } };
        });
        setDirty(true);
        setModal(null);
        setImportJsonInput("");
        setImportError("");
        alert(`Imported ${Object.keys(figma).length} color variables from Figma Variables JSON.`);
        return;
      }
      const parsed = JSON.parse(importJsonInput);
      if (!parsed.tokens || !parsed.components) {
        setImportError("Invalid configuration structure: missing tokens or components.");
        return;
      }
      setConfig(parsed);
      setDirty(true);
      setModal(null);
      setImportJsonInput("");
      setImportError("");
      alert("Theme configuration imported successfully!");
    } catch (e) {
      setImportError("Could not parse JSON: invalid format or unsupported Figma payload.");
    }
  };

  const handleResetTheme = () => {
    if (!theme) return;
    if (confirm("Discard all changes and reset to the last saved state?")) {
      setConfig(parseThemeConfig(theme.Config));
      setDirty(false);
      setShowThemeMenu(false);
    }
  };

  const handlePublishTheme = async () => {
    if (!theme || !config) return;
    setSaving(true);
    try {
      /* First save the updated config */
      await saveTheme({
        YOThemeUniqueId: theme.YOThemeUniqueId,
        Name: theme.Name,
        Slug: theme.Slug,
        Version: theme.Version,
        Author: theme.Author,
        Description: theme.Description,
        Tags: theme.Tags,
        Config: JSON.stringify(config, null, 2),
      }).unwrap();

      /* Activate/Publish theme */
      await activateTheme({ YOThemeUniqueId: theme.YOThemeUniqueId }).unwrap();
      setDirty(false);
      refetch();
      alert(`Theme "${theme.Name}" is now the active system theme!`);
      setShowThemeMenu(false);
    } catch (e: any) {
      alert(e?.data?.Message ?? "Failed to publish theme");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignPages = () => {
    setModal(null);
    alert(`Theme applied successfully to selected pages: ${assignedPages.join(", ")}`);
  };

  /* ── Curated designer-tools action ── */
  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    if (!config) return;
    const next = applyPresetToConfig(config, preset);
    setConfig(next);
    setDirty(true);
  };

  const handleDeriveDark = () => {
    if (!config) return;
    const darkColors = deriveDarkFromLight(config.tokens.colors);
    setConfig({
      ...config,
      tokens: { ...config.tokens, colors: darkColors },
    });
    setDirty(true);
    alert("Derived dark mode variants automatically based on color contrast rules!");
  };

  const handleScaleRadiusGlobal = (rem: number) => {
    if (!config) return;
    setConfig({
      ...config,
      tokens: {
        ...config.tokens,
        "border-radius": { ...config.tokens["border-radius"], ...scaleRadius(rem) },
      },
    });
    setDirty(true);
  };

  const handleApplyFontPairing = (pair: typeof FONT_PAIRINGS[0]) => {
    if (!config) return;
    setConfig({
      ...config,
      tokens: {
        ...config.tokens,
        fonts: {
          ...config.tokens.fonts,
          heading: { ...(config.tokens.fonts.heading ?? { source: "google", weights: [400, 600, 700] }), family: pair.heading },
          body: { ...(config.tokens.fonts.body ?? { source: "google", weights: [400, 500, 600] }), family: pair.body },
        },
      },
    });
    setDirty(true);
  };

  /* ── Derived data ── */
  const t = config?.tokens;
  const colors = t?.colors ?? {};
  const fonts = t?.fonts ?? {};
  const spacing = t?.spacing ?? {};
  const radii = t?.["border-radius"] ?? {};
  const shadows = t?.shadows ?? {};
  const components = config?.components ?? {};
  const componentList = { ...STANDARD_COMPONENTS, ...components };
  const structure = config?.structure;

  const filteredColorGroups = useMemo(() => {
    if (!colorSearch) {
      return COLOR_GROUPS.map((g) => ({ ...g, tokens: g.tokens.filter((tk) => colors[tk]) })).filter((g) => g.tokens.length > 0);
    }
    const q = colorSearch.toLowerCase();
    return COLOR_GROUPS
      .map((g) => ({ ...g, tokens: g.tokens.filter((tk) => tk.includes(q) || colors[tk]?.default?.toLowerCase().includes(q)) }))
      .filter((g) => g.tokens.length > 0);
  }, [colorSearch, colors]);

  const colorCount = Object.keys(colors).length;
  const showRightPanel = tab !== "code" && tab !== "generate";

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(id);
    }
  }, [toast]);

  /* ── Loading / error ── */
  if (isLoading) return <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-50"><div className="flex flex-col items-center gap-3"><RefreshCw size={24} className="animate-spin text-indigo-500" /><div className="animate-pulse text-gray-400 font-medium text-sm">Loading visual theme developer...</div></div></div>;
  if (!theme || !config) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-50">
      <div className="text-center p-8 bg-white rounded-3xl border border-gray-200 shadow-xl max-w-sm"><AlertCircle size={32} className="text-red-500 mx-auto mb-3" /><p className="text-gray-700 font-bold text-lg">Theme configuration missing</p><button onClick={() => navigate("/admin/theme")} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all">Back to Themes</button></div>
    </div>
  );

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50/80">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-xl text-xs font-semibold shadow-lg text-white ${toast.type === "error" ? "bg-red-500" : toast.type === "success" ? "bg-emerald-500" : "bg-indigo-600"}`}>
          {toast.msg}
        </div>
      )}
      {/* ══ Top Bar ══ */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200/80 shrink-0 z-30">
        <button onClick={() => navigate(`/admin/theme/${guid}`)} title="Back to theme list"
          className="p-1.5 hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowThemeMenu(!showThemeMenu)} title="Theme actions menu"
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-50/80 hover:bg-gray-100 rounded-xl border border-gray-200/80 hover:border-gray-300/80 transition-all text-sm font-semibold text-gray-700">
            {theme.Name}
            {theme.IsActive && <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-200">Active</span>}
            <MoreHorizontal size={14} className="text-gray-400 ml-1" />
          </button>
          {showThemeMenu && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-56 bg-white rounded-2xl border border-gray-200/80 shadow-2xl py-1.5 overflow-hidden">
              <button onClick={handleCreateNewTheme} title="Start a new blank theme from scratch"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <Plus size={14} className="text-gray-400" />
                Create New Theme
              </button>
              <button onClick={handleDuplicateTheme} title="Clone this theme into a new editable copy"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <Copy size={14} className="text-gray-400" />
                Duplicate Theme
              </button>
              <button onClick={() => { setModal("rename"); setShowThemeMenu(false); }} title="Change the display name of this theme"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <Pencil size={14} className="text-gray-400" />
                Rename Theme
              </button>
              <div className="my-1 border-t border-gray-100/80" />
              <button onClick={() => { setModal("import"); setShowThemeMenu(false); }} title="Load a theme configuration from a JSON file"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <Upload size={14} className="text-gray-400" />
                Import Configuration
              </button>
              <button onClick={handleExportTheme} title="Download this theme configuration as a JSON file"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <Download size={14} className="text-gray-400" />
                Export Configuration
              </button>
              <button onClick={handleResetTheme} title="Discard all unsaved edits and reload the last saved config"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <RotateCcw size={14} className="text-gray-400" />
                Reset Theme
              </button>
              <div className="my-1 border-t border-gray-100/80" />
              <button onClick={handleSave} title="Save your changes without making this the live theme"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <Eye size={14} className="text-gray-400" />
                Save Draft
              </button>
              <button onClick={handlePublishTheme} title="Save and make this the active theme used across the site"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left font-semibold">
                <Check size={14} className="text-indigo-500" />
                Publish & Activate
              </button>
              <div className="my-1 border-t border-gray-100/80" />
              <button onClick={() => { setModal("assign"); setShowThemeMenu(false); }} title="Choose which pages should use this theme"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <GitCompare size={14} className="text-gray-400" />
                Assign to Pages
              </button>
              <button onClick={() => { setModal("compare"); setShowThemeMenu(false); }} title="Review the differences between saved and current config"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                <Layers3 size={14} className="text-gray-400" />
                Compare Changes
              </button>
            </div>
          )}
        </div>
        <div className="flex-1" />
        <button onClick={handleSave} disabled={saving || !dirty} title="Save your changes as a draft"
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:from-indigo-600 hover:to-indigo-700 transition-all disabled:opacity-40 shadow-lg shadow-indigo-500/20">
          <Save size={14} />
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={() => setShowHistory(true)} title="View edit history and restore previous snapshots"
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${history.length ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "text-gray-400 hover:bg-gray-50"}`}>
          <History size={14} />
          History{history.length ? ` (${history.length})` : ""}
        </button>
        {dirty && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" /></span>}
      </div>

      {/* ══ Tab Bar ══ */}
      <div className="flex items-center gap-0.5 px-5 bg-white border-b border-gray-200/80 shrink-0 z-20 overflow-x-auto">
        {TABS.map((td) => {
          const Icon = td.icon;
          const active = tab === td.id;
          return (
            <button key={td.id} onClick={() => setTab(td.id)} title={td.label}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                active ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <Icon size={14} />
              {td.label}
            </button>
          );
        })}
      </div>

      {/* ══ Main Content ══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className={`flex flex-col bg-white ${showRightPanel ? "w-[440px] shrink-0 border-r border-gray-200/80" : "flex-1"}`}>
          <div className="flex-1 overflow-y-auto">
            {tab === "colors" && (
              <div className="p-5 space-y-5">
                {/* Visual Theme Presets Section */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visual Starter Presets</h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {THEME_PRESETS.map((p) => (
                      <button key={p.id} onClick={() => applyPreset(p)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-100 hover:border-indigo-200 bg-gray-50/50 hover:bg-indigo-50/20 transition-all text-center">
                        <span className="h-5 w-5 rounded-full border border-gray-200" style={{ backgroundColor: p.seed }} />
                        <span className="text-[9px] font-medium text-gray-600 truncate w-full">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 tracking-tight">Color Tokens</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">{colorCount} tokens configured</p>
                  </div>
                  <button onClick={handleDeriveDark} title="Auto-generate matching dark-mode values for every color from its contrast"
                    className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-lg transition-all">
                    <Sparkle size={10} />
                    Auto Dark Mode
                  </button>
                </div>
                <SearchField value={colorSearch} onChange={setColorSearch} />
                <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-50/70 border border-gray-100 rounded-lg px-2.5 py-1.5">
                  <span className="font-semibold text-gray-500">Badge =</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-50 border border-emerald-200" /><span className="text-emerald-600 font-semibold">AAA/AA/AA-lg</span></span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-50 border border-red-200" /><span className="text-red-600 font-semibold">Low</span></span>
                  <span className="ml-auto">contrast vs white surface</span>
                </div>
                {/* Primitive scale + opacity modifier scales */}
                <div className="space-y-3 rounded-2xl border border-gray-200/80 bg-gray-50/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Primitive Color Scale</h3>
                    <button onClick={() => {
                      const sc = buildColorScale(scaleBase, scaleName);
                      if (Object.keys(sc).length) {
                        setConfig((c) => (c ? applyScaleToConfig(c, sc) : c));
                        setDirty(true);
                      }
                    }} title="Generate a 50–950 primitive scale and add it as tokens"
                      className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-all">
                      + Generate 50–950
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={scaleBase} onChange={(e) => setScaleBase(e.target.value)} title="Pick base color"
                      className="h-8 w-10 rounded-lg border border-gray-200 bg-transparent cursor-pointer" />
                    <input value={scaleName} onChange={(e) => setScaleName(e.target.value.replace(/\s+/g, "").toLowerCase())} placeholder="brand"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 font-mono w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    <div className="flex-1 flex h-8 rounded-lg overflow-hidden border border-gray-200">
                      {Object.entries(buildColorScale(scaleBase, scaleName)).map(([k, v]) => (
                        <div key={k} title={k} className="flex-1" style={{ backgroundColor: v.default }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Define a primitive scale once, then map semantic roles (primary, accent…) to specific steps like <code className="font-mono">brand-500</code>.</p>
                  <div className="pt-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dynamic Opacity Modifier Scales</p>
                    {["primary", "secondary", "accent"].filter((n) => getColor(n)).map((n) => (
                      <div key={n} className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-gray-500 w-16 capitalize">{n}</span>
                        <div className="flex-1 flex rounded-md overflow-hidden border border-gray-200">
                          {[10, 20, 40, 60, 80].map((a) => (
                            <div key={a} title={`${n}/${a}`} className="flex-1 h-6" style={{ backgroundColor: hexToRgba(getColor(n), a / 100) }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-0.5">
                  {filteredColorGroups.map((group) => (
                    <ColorGroup key={group.title} title={group.title} badge={`${group.tokens.length}`} defaultOpen={!colorSearch}>
                      {group.tokens.map((tk) => (
                        <ColorField key={tk} label={tk} value={getColor(tk)} darkValue={getDarkColor(tk)}
                          onChange={(v: string) => updateColor(tk, v)} onDarkChange={(v: string) => updateDarkColor(tk, v)}
                          synced={getColor(tk) === getDarkColor(tk)} onToggleSync={() => toggleSyncColor(tk)} onReset={() => resetColor(tk)} />
                      ))}
                    </ColorGroup>
                  ))}
                  {filteredColorGroups.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-400">No color tokens match your search</div>
                  )}
                </div>

                {/* Primitive / Other tokens not in semantic groups */}
                {(() => {
                  const known = new Set(COLOR_GROUPS.flatMap((g: any) => g.tokens));
                  const others = Object.keys(colors).filter((k) => !known.has(k));
                  if (others.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primitive / Other Tokens</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {others.map((k) => (
                          <ColorField key={k} label={k} value={getColor(k)} darkValue={getDarkColor(k)}
                            onChange={(v: string) => updateColor(k, v)} onDarkChange={(v: string) => updateDarkColor(k, v)}
                            synced={getColor(k) === getDarkColor(k)} onToggleSync={() => toggleSyncColor(k)} onReset={() => resetColor(k)} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            {tab === "typography" && (
              <Panel title="Typography">
                <div className="mb-4 space-y-2">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Curated Pairings</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_PAIRINGS.map((p) => (
                      <button key={p.id} onClick={() => handleApplyFontPairing(p)}
                        className="flex flex-col p-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 text-left transition-all">
                        <span className="text-[11px] font-bold text-gray-700">{p.name}</span>
                        <span className="text-[10px] text-gray-400 truncate mt-0.5">{p.heading} + {p.body}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(fonts).map(([name, val]) => (
                    <FontField key={name} label={name} family={val.family} source={val.source} weights={val.weights}
                      onFamilyChange={(v) => updateFont(name, "family", v)}
                      onSourceChange={(v) => updateFont(name, "source", v)}
                      onWeightsChange={(v) => updateFont(name, "weights", v)} />
                  ))}
                </div>

                {/* Fluid modular type scale */}
                <div className="pt-4 mt-2 border-t border-gray-100 space-y-3">
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fluid Modular Type Scale</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Inherently responsive headings via clamp() — scales smoothly between viewports.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumericField label="Base Size" value={config?.tokens?.fluid?.base ?? "1"} onChange={(v) => updateTokens((tk) => ({ ...tk, fluid: { ...tk.fluid, base: v } }))} min={0.5} max={3} units={["rem"]} />
                    <NumericField label="Ratio" value={String(config?.tokens?.fluid?.ratio ?? 1.25)} onChange={(v) => updateTokens((tk) => ({ ...tk, fluid: { ...tk.fluid, ratio: parseFloat(v) || 1.25 } }))} min={1.05} max={2} units={[]} />
                    <NumericField label="Min Viewport" value={String(config?.tokens?.fluid?.min ?? 360)} onChange={(v) => updateTokens((tk) => ({ ...tk, fluid: { ...tk.fluid, min: parseInt(v) || 360 } }))} min={240} max={1920} units={["px"]} />
                    <NumericField label="Max Viewport" value={String(config?.tokens?.fluid?.max ?? 1280)} onChange={(v) => updateTokens((tk) => ({ ...tk, fluid: { ...tk.fluid, max: parseInt(v) || 1280 } }))} min={320} max={2560} units={["px"]} />
                  </div>
                  <div className="space-y-1 rounded-xl bg-gray-50/60 border border-gray-100 p-3">
                    {Object.entries(buildFluidScale(config?.tokens?.fluid)).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-gray-500 w-20">{k}</span>
                        <code className="text-[10px] text-indigo-600 font-mono flex-1 truncate">{v}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            )}
            {tab === "radius" && (
              <Panel title="Border Radius">
                <div className="mb-5 p-3.5 bg-gray-50/60 rounded-2xl border border-gray-200/80 space-y-2">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Global Radius Scale Scaling</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Scale all radius values instantly to give your theme a cohesive sharpness or roundness.</p>
                  <div className="flex gap-1.5 pt-1">
                    {[
                      { label: "Sharp", rem: 0 },
                      { label: "Sleek", rem: 0.375 },
                      { label: "Modern", rem: 0.75 },
                      { label: "Round", rem: 1.25 },
                    ].map((s) => (
                      <button key={s.label} onClick={() => handleScaleRadiusGlobal(s.rem)}
                        className="flex-1 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 text-[10px] font-medium text-gray-600 hover:text-indigo-700 transition-all">
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(radii).map(([name, val]) => (
                    <NumericField key={name} label={name} value={val} onChange={(v) => updateNumeric("border-radius", name, v)} min={0} max={64} units={["px", "rem"]} />
                  ))}
                </div>
              </Panel>
            )}
            {tab === "spacing" && <Panel title="Spacing"><div className="space-y-4">{Object.entries(spacing).map(([name, val]) => <NumericField key={name} label={name} value={val} onChange={(v) => updateNumeric("spacing", name, v)} min={0} max={256} units={["px", "rem", "vw", "%"]} />)}</div></Panel>}
            {tab === "shadow" && <Panel title="Shadows"><div className="space-y-4">{Object.entries(shadows).map(([name, val]) => <ShadowField key={name} label={name} value={val} onChange={(v) => updateShadow(name, v)} />)}</div></Panel>}
            {tab === "components" && (
              <Panel title="Component Style Studio">
                <div className="mb-4 flex items-center justify-between gap-3 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-100 rounded-2xl p-3.5">
                  <div>
                    <p className="text-xs font-bold text-indigo-900">Standard Component Library</p>
                    <p className="text-[10px] text-indigo-600/80 mt-0.5 leading-relaxed">Customize the global <code className="font-mono text-[9px]">.yo-*</code> classes used across every page — like a premium sellable theme.</p>
                  </div>
                  <button onClick={() => { if (config) { setConfig(mergeStandardComponents(config)); setDirty(true); } }}
                    className="shrink-0 text-[11px] font-semibold px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20">
                    Load Full Set
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(componentList).map(([name, comp]) => (
                    <ComponentVariantField key={name} label={name} variant={comp.variant} variants={comp.variants}
                      onVariantChange={(v) => updateComponentVariant(name, v)}
                      onClassesChange={(vk, cls) => updateComponentClasses(name, vk, cls)} />
                  ))}
                </div>

                {/* Motion + focus ring standardization (component state management / a11y) */}
                <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Motion & Transitions</h3>
                    <NumericField label="Transition Duration" value={config?.tokens?.motion?.duration ?? "0.2s"} onChange={(v) => updateTokens((tk) => ({ ...tk, motion: { ...tk.motion, duration: v } }))} min={0} max={2000} units={["ms", "s"]} />
                    <SelectField label="Easing" value={config?.tokens?.motion?.easing ?? "cubic-bezier(0.4, 0, 0.2, 1)"} options={[
                      { value: "cubic-bezier(0.4, 0, 0.2, 1)", label: "Standard" },
                      { value: "ease", label: "Ease" },
                      { value: "ease-in-out", label: "Ease In-Out" },
                      { value: "linear", label: "Linear" },
                    ]} onChange={(v) => updateTokens((tk) => ({ ...tk, motion: { ...tk.motion, easing: v } }))} />
                    <SelectField label="Reduced Motion" value={String(config?.tokens?.motion?.reduced ?? false)} options={[{ value: "false", label: "Full motion" }, { value: "true", label: "Minimize" }]} onChange={(v) => updateTokens((tk) => ({ ...tk, motion: { ...tk.motion, reduced: v === "true" } }))} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Focus Ring (ADA)</h3>
                    <ColorField label="Ring Color" value={config?.tokens?.focus?.color ?? ""} onChange={(v) => updateTokens((tk) => ({ ...tk, focus: { ...tk.focus, color: v } }))} darkValue="" onDarkChange={() => {}} synced onToggleSync={() => {}} onReset={() => {}} />
                    <NumericField label="Ring Width" value={config?.tokens?.focus?.width ?? "2px"} onChange={(v) => updateTokens((tk) => ({ ...tk, focus: { ...tk.focus, width: v } }))} min={0} max={12} units={["px"]} />
                    <NumericField label="Ring Offset" value={config?.tokens?.focus?.offset ?? "2px"} onChange={(v) => updateTokens((tk) => ({ ...tk, focus: { ...tk.focus, offset: v } }))} min={0} max={12} units={["px"]} />
                  </div>
                </div>
              </Panel>
            )}
            {tab === "layouts" && <Panel title="Layouts"><div className="space-y-4"><SelectField label="Layout Type" value={structure?.layoutType ?? "sidebar-right"} options={(structure?.layoutTypes ? Object.entries(structure.layoutTypes) : []).map(([k]) => ({ value: k, label: k.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") }))} onChange={updateLayoutType} />{structure?.layoutTypes && <div className="space-y-2"><p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Shell Components</p><div className="grid gap-2">{Object.entries(structure.layoutTypes).map(([name, cfg]: [string, any]) => <div key={name} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/80"><span className="text-xs font-medium text-gray-600 w-28">{name}</span><code className="text-xs text-indigo-600 font-mono">{cfg.shell}</code></div>)}</div></div>}</div></Panel>}
            {tab === "preview" && <Panel title="Preview"><div className="flex items-center justify-center h-32 text-sm text-gray-400">Use preview toolbar above</div></Panel>}
            {tab === "code" && <CodeTab config={config} />}
            {tab === "generate" && <GenerateTab config={config} setConfig={setConfig} setDirty={setDirty} />}
          </div>
        </div>

        {/* Right preview panel */}
        {showRightPanel && (
          <div className="flex-1 flex flex-col bg-gray-50/80">
            <div className="flex-1 overflow-hidden">
              <ThemePreview config={config} />
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */
      /*  MODALS & OVERLAYS                                                */
      /* ================================================================ */}

      {/* Rename Modal */}
      {modal === "rename" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-[400px] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">Rename Theme</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Theme Name</label>
              <input type="text" value={newNameInput} onChange={(e) => setNewNameInput(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 transition-all font-medium" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setModal(null)} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
              <button onClick={handleRenameTheme} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">Rename</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {modal === "import" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-[500px] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">Import Configuration</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paste Config JSON</label>
              <textarea value={importJsonInput} onChange={(e) => setImportJsonInput(e.target.value)} rows={8} placeholder='{ "tokens": { ... }, "components": { ... } }  — or a Figma Variables export'
                className="w-full rounded-xl border border-gray-200 p-3.5 text-xs font-mono outline-none focus:border-indigo-500 transition-all resize-none bg-gray-50/50" />
              <p className="text-[10px] text-gray-400">Accepts full theme config <span className="font-mono">or</span> a Figma Variables JSON (color variables are auto-mapped as tokens).</p>
              {importError && <p className="text-[10px] text-red-500 font-medium flex items-center gap-1"><AlertCircle size={10} />{importError}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
              <button onClick={handleImportTheme} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">Import Config</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modal === "assign" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-[420px] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Assign Theme to Pages</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Select CMS pages to assign this layout theme immediately.</p>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {[
                { name: "Home (Index)", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Services", path: "/services" },
                { name: "Blog Home", path: "/blog" },
                { name: "Contact Us", path: "/contact" },
                { name: "Pricing Table", path: "/pricing" },
              ].map((p) => {
                const active = assignedPages.includes(p.name);
                return (
                  <button key={p.name} onClick={() => setAssignedPages(active ? assignedPages.filter((x) => x !== p.name) : [...assignedPages, p.name])}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition-all ${
                      active ? "border-indigo-200 bg-indigo-50/20 text-indigo-900 font-semibold" : "border-gray-100 bg-gray-50/30 hover:bg-gray-50 text-gray-600"
                    }`}>
                    <div className="flex flex-col">
                      <span className="text-xs">{p.name}</span>
                      <span className="text-[9px] text-gray-400 font-mono">{p.path}</span>
                    </div>
                    {active ? <CheckSquare size={14} className="text-indigo-600" /> : <div className="h-3.5 w-3.5 rounded border border-gray-300" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setModal(null)} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
              <button onClick={handleAssignPages} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">Apply Assignments</button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {modal === "compare" && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs">
          <div className="bg-white border-l border-gray-200 shadow-2xl w-[500px] h-full p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Diff & Token Changes</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Showing differences between Saved Configuration and current workspace.</p>
                </div>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              {/* Show actual diff table of colors */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Modified Color Tokens</span>
                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                  <div className="grid grid-cols-3 p-2.5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Token</span>
                    <span>Saved State</span>
                    <span>Draft State</span>
                  </div>
                  {Object.entries(colors).map(([k, currentVal]) => {
                    const originalVal = parseThemeConfig(theme?.Config)?.tokens?.colors?.[k];
                    const changed = originalVal?.default !== currentVal.default || originalVal?.dark !== currentVal.dark;
                    if (!changed) return null;
                    return (
                      <div key={k} className="grid grid-cols-3 p-2.5 items-center font-medium bg-amber-50/10">
                        <span className="font-semibold text-gray-700 truncate">{k}</span>
                        <div className="flex items-center gap-1 text-gray-400">
                          <span className="h-3 w-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: originalVal?.default ?? "#00000000" }} />
                          <span className="font-mono text-[10px]">{originalVal?.default ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600">
                          <span className="h-3 w-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: currentVal.default }} />
                          <span className="font-mono text-[10px] font-bold">{currentVal.default}</span>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(colors).filter((k) => {
                    const orig = parseThemeConfig(theme?.Config)?.tokens?.colors?.[k];
                    return orig?.default !== colors[k]?.default || orig?.dark !== colors[k]?.dark;
                  }).length === 0 && (
                    <div className="p-4 text-center text-gray-400 text-[11px]">No color differences found between original and draft.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-100 bg-white">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Close Diff</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ History / Snapshot panel ══ */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs">
          <div className="bg-white border-l border-gray-200 shadow-2xl w-[440px] h-full flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><History size={15} className="text-indigo-500" />Edit History</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Auto-captured snapshots · restore any point to undo edits</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {history.length === 0 && (
                <div className="text-center text-gray-400 text-xs py-10">No snapshots yet. Edit tokens and snapshots will be captured automatically.</div>
              )}
              {history.map((s, i) => (
                <div key={s.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group">
                  <div className="flex flex-col items-center pt-1">
                    <span className={`h-2.5 w-2.5 rounded-full ring-2 ${i === 0 ? "bg-indigo-500 ring-indigo-200" : "bg-gray-300 ring-gray-100"}`} />
                    {i < history.length - 1 && <span className="w-px flex-1 bg-gray-200 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 truncate">{s.label}</span>
                      {s.changes && s.changes.length > 0 && (
                        <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{s.changes.length} change{s.changes.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">{new Date(s.ts).toLocaleString()}</div>
                    {s.changes && s.changes.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {s.changes.slice(0, 4).map((c, ci) => <ChangeRow key={ci} change={c} />)}
                        {s.changes.length > 4 && <div className="text-[9px] text-gray-400 pl-0.5">+{s.changes.length - 4} more</div>}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { restoreSnapshot(s); setShowHistory(false); }}
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all">Restore</button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => { setHistory([]); try { localStorage.removeItem(`yotheme-history-${guid ?? "new"}`); } catch {} }}
                className="text-[10px] text-gray-400 hover:text-red-500 transition-all">Clear history</button>
              <button onClick={() => pushSnapshot("Manual snapshot")} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">+ Snapshot now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  History change row                                                 */
/* ================================================================== */

function ChangeRow({ change }: { change: HistoryChange }) {
  const isColor = change.category === "color";
  const swatch = (val?: string) => (
    <span
      className="h-2.5 w-2.5 rounded-full border border-gray-200 shrink-0 inline-block"
      style={{ backgroundColor: val && val !== "—" ? val : "transparent" }}
    />
  );
  return (
    <div className="flex items-center gap-1.5 text-[10px] leading-tight">
      {isColor ? (
        <>
          {swatch(change.oldValue)}
          <span className="text-gray-300">→</span>
          {swatch(change.newValue)}
        </>
      ) : null}
      <span className="font-medium text-gray-600 capitalize truncate">{change.name}</span>
      {!isColor && (
        <span className="text-gray-400 truncate">
          {change.oldValue ?? "—"} <span className="px-0.5 text-gray-300">→</span> {change.newValue ?? "—"}
        </span>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Panel wrapper                                                      */
/* ================================================================== */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent" />
      </div>
      {children}
    </div>
  );
}

/* ================================================================== */
/*  Code tab                                                           */
/* ================================================================== */

function CodeTab({ config }: { config: ParsedThemeConfig }) {
  type Fmt = "json" | "css" | "tailwind" | "v4" | "styledictionary" | "react" | "multitenant";
  const [fmt, setFmt] = useState<Fmt>("json");
  const [tenant, setTenant] = useState("client-a");
  const [copied, setCopied] = useState(false);

  const sources: Record<Fmt, string> = {
    json: JSON.stringify(config, null, 2),
    css: buildCssVariablesExport(config),
    tailwind: buildTailwindConfig(config),
    v4: buildTailwindV4(config),
    styledictionary: buildStyleDictionary(config),
    react: buildReactTheme(config),
    multitenant: buildMultiTenantCss(config, tenant),
  };
  const code = sources[fmt];

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const tabs: { id: Fmt; label: string; hint: string }[] = [
    { id: "json", label: "JSON", hint: "Full config" },
    { id: "css", label: "CSS Vars", hint: "Runtime variables" },
    { id: "tailwind", label: "Tailwind v3", hint: "tailwind.config.ts" },
    { id: "v4", label: "Tailwind v4", hint: "@theme CSS-first" },
    { id: "styledictionary", label: "Style Dict", hint: "Cross-platform tokens" },
    { id: "react", label: "React", hint: "Typed theme object" },
    { id: "multitenant", label: "Multi-tenant", hint: "Scoped stylesheet" },
  ];

  return (
    <div className="p-5 h-full flex flex-col bg-white">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-gray-800 tracking-tight">Code Export & Framework Integration</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Generate framework-ready assets from your tokens</p>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex items-center gap-0.5 mb-3 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setFmt(t.id)} title={t.hint}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${fmt === t.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {fmt === "multitenant" && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] text-gray-400">Tenant scope</span>
          <input value={tenant} onChange={(e) => setTenant(e.target.value)} placeholder="client-a"
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono w-40" />
          <span className="text-[10px] text-gray-400">→ wraps vars in <span className="font-mono">[data-theme="{tenant}"]</span></span>
        </div>
      )}

      {(fmt === "css" || fmt === "v4") && (
        <p className="text-[10px] text-gray-400 mb-3 font-mono">
          rgb/hsl channels enable <span className="text-indigo-500">color-mix()</span> alpha scales & runtime switching in <span className="text-indigo-500">.yo-*</span> classes.
        </p>
      )}

      {fmt === "styledictionary" && (
        <p className="text-[10px] text-gray-400 mb-3">
          Drop into a <span className="font-mono">Style Dictionary</span> pipeline to emit iOS/Android/SCSS/Compose tokens automatically — plug into CI for design-to-code sync.
        </p>
      )}

      <pre className="flex-1 overflow-auto rounded-2xl border border-gray-200 bg-gray-950 p-5 text-xs leading-relaxed shadow-inner">
        <code className="text-gray-100">{code}</code>
      </pre>
    </div>
  );
}

/* ================================================================== */
/*  Generate tab                                                       */
/* ================================================================== */

interface GenerateTabProps {
  config: ParsedThemeConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParsedThemeConfig | null>>;
  setDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

function GenerateTab({ config, setConfig, setDirty }: GenerateTabProps) {
  const [seed, setSeed] = useState("#6366f1");
  const [harmony, setHarmony] = useState<Harmony>("complementary");
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light");

  const previewPalette = useMemo(() => {
    if (!isValidHex(seed)) return null;
    return generatePalette(seed, harmony);
  }, [seed, harmony]);

  const handleApplyPalette = () => {
    if (!previewPalette) return;
    const next = applyPaletteToConfig(config, previewPalette);
    setConfig(next);
    setDirty(true);
    alert("Palette applied to theme configuration! View live preview in other tabs.");
  };

  return (
    <div className="p-5 h-full flex flex-col bg-white">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">Interactive Palette Generator</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Construct accessible, beautiful matching light/dark color schemes instantly from a single seed color.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1 max-w-lg">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seed Brand Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={seed} onChange={(e) => setSeed(e.target.value)} className="h-8 w-8 rounded-lg cursor-pointer border border-gray-200 shrink-0" />
              <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-mono outline-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color Harmony Mode</label>
            <select value={harmony} onChange={(e) => setHarmony(e.target.value as Harmony)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium outline-none text-gray-700 bg-white">
              <option value="complementary">Complementary (Contrast)</option>
              <option value="analogous">Analogous (Sleek)</option>
              <option value="monochrome">Monochrome (Clean)</option>
              <option value="triadic">Triadic (Vibrant)</option>
            </select>
          </div>
        </div>

        {/* Generated Preview */}
        {previewPalette && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generated Colors Output</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setActiveTab("light")}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${activeTab === "light" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Light Scheme</button>
                <button onClick={() => setActiveTab("dark")}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${activeTab === "dark" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Dark Scheme</button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Object.entries(activeTab === "light" ? previewPalette.light : previewPalette.dark).map(([name, hex]) => (
                <div key={name} className="flex flex-col gap-1 p-2 border border-gray-50 rounded-xl bg-gray-50/30 text-center">
                  <div className="h-6 w-full rounded-lg shadow-inner" style={{ backgroundColor: hex }} />
                  <span className="text-[9px] font-bold text-gray-700 truncate leading-tight">{name}</span>
                  <span className="text-[8px] font-mono text-gray-400">{hex}</span>
                </div>
              ))}
            </div>

            <button onClick={handleApplyPalette}
              className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
              <Sparkles size={14} />
              Apply Generated Scheme to Theme Config
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
