import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Archive, Code2, Copy, Download, Eye, EyeOff, FileCode2,
  History, Loader2, MoreHorizontal, Redo2, RotateCcw, Save, Star, Undo2, UploadCloud,
} from "lucide-react";
import { Modal } from "../../../components/ui/modal";
import {
  useGetStudioConfigQuery,
  usePublishThemeMutation,
  useSaveStudioConfigMutation,
  useSetDefaultThemeMutation,
  useSetThemeStatusMutation,
  useDuplicateThemeMutation,
} from "../../../redux/theme/themeStudioAPI";
import { useGetStudioThemesQuery } from "../../../redux/theme/themeStudioAPI";
import { createEmptyStudioConfig, ensurePublishableTokens, normalizeToStudioConfig } from "../../../services/themeMigration";
import { compileTheme, type StudioCompileOutput } from "../../../services/themeCompiler";
import type { MigrationSummary, StudioThemeConfig, ThemeStatus } from "../../../types/yoThemeStudioTypes";
import { STUDIO_MODES, StatusChip, type StudioMode, type StudioSectionProps } from "./studioShared";
import { StudioPreview } from "./StudioPreview";
import { SimpleWizard } from "./SimpleWizard";
import { MigrationSummaryDialog } from "./MigrationSummaryDialog";
import { BrandSection } from "./sections/BrandSection";
import { ColorsSection } from "./sections/ColorsSection";
import { TypographySection } from "./sections/TypographySection";
import { ScalesSection } from "./sections/ScalesSection";
import { ComponentsSection } from "./sections/ComponentsSection";
import { LayoutSection } from "./sections/LayoutSection";
import { ResponsiveSection } from "./sections/ResponsiveSection";
import { AccessibilitySection } from "./sections/AccessibilitySection";
import { CodeSection } from "./sections/CodeSection";
import { AssetsSection } from "./sections/AssetsSection";
import { ScopedStylesSection } from "./sections/ScopedStylesSection";
import { CustomCssSection } from "./sections/CustomCssSection";
import { PluginsSection } from "./sections/PluginsSection";

type SectionKey =
  | "brand" | "colors" | "typography" | "spacing" | "shape" | "elevation" | "motion"
  | "components" | "layout" | "responsive" | "accessibility" | "assets" | "code" | "scopes"
  | "customCss" | "plugins";

interface SectionDef {
  key: SectionKey;
  label: string;
  modes: StudioMode[];
}

const SECTIONS: SectionDef[] = [
  { key: "brand", label: "Brand", modes: ["advanced"] },
  { key: "colors", label: "Colors", modes: ["advanced"] },
  { key: "typography", label: "Typography", modes: ["advanced"] },
  { key: "spacing", label: "Spacing", modes: ["advanced"] },
  { key: "shape", label: "Shape", modes: ["advanced"] },
  { key: "elevation", label: "Elevation", modes: ["advanced"] },
  { key: "motion", label: "Motion", modes: ["advanced"] },
  { key: "components", label: "Components", modes: ["advanced"] },
  { key: "layout", label: "Layout", modes: ["advanced"] },
  { key: "responsive", label: "Responsive", modes: ["advanced"] },
  { key: "accessibility", label: "Accessibility", modes: ["advanced"] },
  { key: "assets", label: "Assets", modes: ["advanced"] },
  { key: "code", label: "Code", modes: ["advanced"] },
  { key: "scopes", label: "Scoped Styles", modes: ["advanced"] },
  { key: "customCss", label: "Custom CSS", modes: ["advanced"] },
  { key: "plugins", label: "Plugins", modes: ["advanced"] },
];

const HISTORY_LIMIT = 50;

export default function ThemeStudioEditor() {
  const { guid = "" } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetStudioConfigQuery(guid, { skip: !guid });
  const { refetch: refetchThemeList } = useGetStudioThemesQuery({ limit: 1 });

  const [saveConfig, { isLoading: isSaving }] = useSaveStudioConfigMutation();
  const [publishTheme, { isLoading: isPublishing }] = usePublishThemeMutation();
  const [setStatus] = useSetThemeStatusMutation();
  const [setDefault] = useSetDefaultThemeMutation();
  const [duplicateTheme] = useDuplicateThemeMutation();

  /* ── draft state with undo/redo + change tracking (blueprint §18) ──
     All history side effects run OUTSIDE the setState updaters — React
     StrictMode double-invokes updater functions, which previously pushed
     duplicate history entries and made Undo require multiple clicks. */
  const emptyCfg = useMemo(() => createEmptyStudioConfig(), []);
  const [draft, setDraft] = useState<StudioThemeConfig>(emptyCfg);
  const [baseline, setBaseline] = useState<StudioThemeConfig>(emptyCfg);
  const [past, setPast] = useState<StudioThemeConfig[]>([]);
  const [future, setFuture] = useState<StudioThemeConfig[]>([]);
  const [changedPaths, setChangedPaths] = useState<Set<string>>(new Set());
  const [migrationSummary, setMigrationSummary] = useState<MigrationSummary | null>(null);
  const [themeStatus, setThemeStatus] = useState<ThemeStatus>("draft");
  const initializedFor = useRef<string | null>(null);
  const draftRef = useRef<StudioThemeConfig>(emptyCfg);

  const applyDraft = useCallback((next: StudioThemeConfig) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  useEffect(() => {
    if (!data || initializedFor.current === guid) return;
    initializedFor.current = guid;
    const { config, summary } = normalizeToStudioConfig(data.rawConfig);
    applyDraft(config);
    setBaseline(config);
    setPast([]);
    setFuture([]);
    setChangedPaths(new Set());
    setThemeStatus(data.row?.Status ?? "draft");
    if (summary) setMigrationSummary(summary);
  }, [data, guid, applyDraft]);

  const dirty = useMemo(
    () => !!draft && !!baseline && JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );

  const update = useCallback<StudioSectionProps["update"]>((path, fn) => {
    const current = draftRef.current;
    if (!current) return;
    const next = fn(current);
    if (next === current) return;
    draftRef.current = next;
    setPast((p) => [...p.slice(-HISTORY_LIMIT + 1), current]);
    setFuture([]);
    setChangedPaths((prev) => new Set(prev).add(path));
    setDraft(next);
  }, []);

  const undo = useCallback(() => {
    const current = draftRef.current;
    if (!current || past.length === 0) return;
    const previous = past[past.length - 1];
    draftRef.current = previous;
    setPast(past.slice(0, -1));
    setFuture([current, ...future]);
    setDraft(previous);
  }, [past, future]);

  const redo = useCallback(() => {
    const current = draftRef.current;
    if (!current || future.length === 0) return;
    const [next, ...rest] = future;
    draftRef.current = next;
    setPast([...past, current]);
    setFuture(rest);
    setDraft(next);
  }, [past, future]);

  /* ── editor chrome state ── */
  const [mode, setMode] = useState<StudioMode>("simple");
  const [section, setSection] = useState<SectionKey>("colors");
  const [showPreview, setShowPreview] = useState(true);
  const [showChanges, setShowChanges] = useState(false);
  const [publishCompile, setPublishCompile] = useState<StudioCompileOutput | null>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);

  /* ── actions ── */

  const handleSave = async () => {
    if (!draft) return;
    try {
      ensurePublishableTokens(draft);
      const result = await saveConfig({ guid, config: draft as unknown as Record<string, unknown> }).unwrap();
      setBaseline(draft);
      setChangedPaths(new Set());
      if (result?.Data?.Status) setThemeStatus(result.Data.Status);
      toast.success("Draft saved");
      refetchThemeList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save draft");
    }
  };

  const handleStatus = async (status: ThemeStatus, successMessage: string) => {
    try {
      const result = await setStatus({ guid, status }).unwrap();
      setThemeStatus(result?.Data?.Status ?? status);
      toast.success(successMessage);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Status change failed");
    }
  };

  const openPublishGate = () => {
    if (!draft) return;
    setPublishCompile(compileTheme(draft));
  };
  const handlePublish = async () => {
    if (!publishCompile?.success || !draft) return;
    try {
      /* Simple flow: persist the exact config shown, then publish it.
         No review/approval lifecycle — the backend gate only checks
         compiler validity. */
      ensurePublishableTokens(draft);
      const desired = draft as unknown as Record<string, unknown>;
      await saveConfig({ guid, config: desired }).unwrap();
      const result = await publishTheme({ guid, config: desired, compiledCss: publishCompile.css }).unwrap();
      setThemeStatus("published");
      setBaseline(draft);
      setChangedPaths(new Set());
      setPublishCompile(null);
      toast.success("Theme published — live applications will pick it up");
      refetchThemeList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    }
  };

  const handleSetDefault = async () => {
    try {
      await setDefault(guid).unwrap();
      toast.success("Default theme updated");
      refetchThemeList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not set default theme");
    }
  };

  const handleDuplicate = async () => {
    try {
      const result = await duplicateTheme({ guid }).unwrap();
      const newGuid = result?.Data?.YOThemeUniqueId;
      toast.success("Duplicated as a new draft");
      if (newGuid) navigate(`/admin/theme/editor/${newGuid}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Duplicate failed");
    }
  };

  const handleExport = () => {
    if (!draft) return;
    const blob = new Blob([JSON.stringify({ name: data?.row?.Name, version: data?.row?.Version ?? "1.0.0", config: draft }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data?.row?.Slug ?? "theme"}.yotheme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── render helpers ── */

  const visibleSections = SECTIONS.filter((s) => s.modes.includes(mode));

  const renderSection = () => {
    if (!draft) return null;
    const props: StudioSectionProps = { config: draft, update, guid };
    switch (section) {
      case "brand": return <BrandSection {...props} />;
      case "colors": return <ColorsSection {...props} />;
      case "typography": return <TypographySection {...props} />;
      case "spacing": return <ScalesSection {...props} group="spacing" />;
      case "shape": return <ScalesSection {...props} group="shape" />;
      case "elevation": return <ScalesSection {...props} group="elevation" />;
      case "motion": return <ScalesSection {...props} group="motion" />;
      case "components": return <ComponentsSection {...props} />;
      case "layout": return <LayoutSection {...props} />;
      case "responsive": return <ResponsiveSection {...props} />;
      case "accessibility": return <AccessibilitySection {...props} />;
      case "assets": return <AssetsSection {...props} />;
      case "code": return <CodeSection {...props} />;
      case "scopes": return <ScopedStylesSection {...props} />;
      case "customCss": return <CustomCssSection {...props} />;
      case "plugins": return <PluginsSection />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (error || !data?.row) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Theme not found or failed to load.
        </div>
      </div>
    );
  }

  const row = data.row;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50/50">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 border-b border-gray-200/70 bg-white px-4 py-2.5">
        <button
          type="button"
          onClick={() => navigate("/admin/theme")}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          title="Back to themes"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold text-gray-800">{row.Name}</h1>
            <StatusChip status={themeStatus} />
            {row.IsDefault && <Star size={12} className="fill-amber-400 text-amber-400" />}
          </div>
          <p className="text-[10px] text-gray-400">
            {row.Slug} · v{row.Version ?? "1.0.0"} · schema v{row.SchemaVersion ?? 2}
          </p>
        </div>

        {/* mode switcher */}
        <div className="mx-auto flex items-center gap-0.5 rounded-xl bg-gray-100 p-1">
          {STUDIO_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                mode === m.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowChanges(!showChanges)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              title="Changed paths"
            >
              <History size={13} />
              <span className="font-semibold text-gray-700">{changedPaths.size}</span>
              {dirty ? " (unsaved)" : ""}
            </button>
            {showChanges && changedPaths.size > 0 && (
              <div className="absolute right-0 top-9 z-30 max-h-52 w-96 overflow-y-auto rounded-xl border border-gray-200/80 bg-white p-3 shadow-xl">
                {Array.from(changedPaths).map((p) => (
                  <code key={p} className="block truncate py-0.5 text-[10px] text-gray-500">{p}</code>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={undo}
            disabled={!past.length}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            title="Undo"
          >
            <Undo2 size={12} /> Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!future.length}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            title="Redo"
          >
            <Redo2 size={12} /> Redo
          </button>
          <button
            type="button"
            onClick={() => {
              applyDraft(baseline);
              setPast([]);
              setFuture([]);
              setChangedPaths(new Set());
            }}
            disabled={!dirty}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition hover:text-gray-700 disabled:opacity-40"
            title="Discard unsaved changes"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 lg:hidden"
          >
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />} Preview
          </button>
          <span className="mx-0.5 h-4 w-px bg-gray-200" />
          {themeStatus === "published" && (
            <button
              type="button"
              onClick={() => handleStatus("draft", "Reopened as working draft — the published version stays live")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RotateCcw size={12} /> Reopen
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-900 disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Draft
          </button>
          <button
            type="button"
            onClick={openPublishGate}
            disabled={!dirty && themeStatus === "published"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            <UploadCloud size={12} /> Publish
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOverflowOpen(!overflowOpen)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <MoreHorizontal size={16} />
            </button>
            {overflowOpen && (
              <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-gray-200/80 bg-white py-1 shadow-xl">
                <OverflowItem icon={<Copy size={13} />} label="Duplicate theme" onClick={() => { setOverflowOpen(false); handleDuplicate(); }} />
                <OverflowItem icon={<Download size={13} />} label="Export JSON" onClick={() => { setOverflowOpen(false); handleExport(); }} />
                {!row.IsDefault && themeStatus === "published" && (
                  <OverflowItem icon={<Star size={13} />} label="Set as default" onClick={() => { setOverflowOpen(false); handleSetDefault(); }} />
                )}
                {themeStatus !== "archived" && (
                  <OverflowItem
                    icon={<Archive size={13} />}
                    label="Archive"
                    danger
                    onClick={() => { setOverflowOpen(false); handleStatus("archived", "Theme archived"); }}
                  />
                )}
                {themeStatus === "archived" && (
                  <OverflowItem icon={<RotateCcw size={13} />} label="Restore to draft" onClick={() => { setOverflowOpen(false); handleStatus("draft", "Restored to draft"); }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {mode !== "simple" && (
          <nav className="w-44 shrink-0 space-y-0.5 overflow-y-auto border-r border-gray-200/70 bg-white p-2">
            {visibleSections.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSection(s.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ${
                  section === s.key ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {s.key === "code" ? <Code2 size={13} /> : s.key === "customCss" ? <FileCode2 size={13} /> : null}
                {s.label}
              </button>
            ))}
          </nav>
        )}
        <main className="min-w-0 flex-1 overflow-y-auto p-5">
          {mode === "simple" ? <SimpleWizard config={draft!} update={update} guid={guid} /> : renderSection()}
        </main>
        {showPreview && (
          <aside className="w-full shrink-0 border-l border-gray-200/70 bg-white lg:w-[42%]">
            <StudioPreview
              config={draft!}
              onModeSelect={(mode) =>
                update("appearance.defaultMode", (cfg) => ({
                  ...cfg,
                  appearance: { ...cfg.appearance, defaultMode: mode },
                }))
              }
            />
          </aside>
        )}
      </div>

      {/* ── Publish gate dialog (blueprint §84) ── */}
      {publishCompile && (
        <Modal isOpen onClose={() => setPublishCompile(null)} className="max-w-lg">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-800">
              {publishCompile.success ? "Ready to publish" : "Publishing blocked by validation"}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Compiled CSS: {Math.round(publishCompile.sizeBytes / 1024)} KB · {publishCompile.validation.length} check result{publishCompile.validation.length === 1 ? "" : "s"}
            </p>
            {publishCompile.validation.length > 0 && (
              <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
                {publishCompile.validation.map((v, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      v.Severity === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : v.Severity === "warning"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                  >
                    {v.Message}
                    {v.SuggestedFix && <div className="mt-0.5 text-[10px] opacity-80">Fix: {v.SuggestedFix}</div>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPublishCompile(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!publishCompile.success || isPublishing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
              >
                {isPublishing ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                Publish theme
              </button>
            </div>
          </div>
        </Modal>
      )}

      {migrationSummary && (
        <MigrationSummaryDialog summary={migrationSummary} onClose={() => setMigrationSummary(null)} />
      )}
    </div>
  );
}

function OverflowItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition ${
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
