import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Upload, Trash2, CheckCircle, Download, Eye } from "lucide-react";
import {
  useGetThemeListQuery,
  useGetActiveThemeQuery,
  useActivateThemeMutation,
  useDeleteThemeMutation,
  useImportThemeMutation,
  useSaveThemeMutation,
} from "../../../redux/theme/themeAPI";
import { applyPresetToConfig, generatePalette, scaleRadius, THEME_PRESETS } from "./themeUtils";
import { parseThemeConfig } from "../../../context/YOThemeContext";
import toaster from "../../../components/toster";
import type { YOTheme, ParsedThemeConfig } from "../../../types/yoThemeTypes";

function generateGUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Minimal valid base config used when no active theme exists yet.
function buildBaseConfig(): ParsedThemeConfig {
  const palette = generatePalette("#6366f1", "complementary");
  const colors: Record<string, { default: string; dark?: string }> = {};
  for (const k of Object.keys(palette.light)) {
    colors[k] = { default: palette.light[k], dark: palette.dark[k] ?? palette.light[k] };
  }
  return {
    tokens: {
      colors,
      fonts: {
        heading: { family: "Plus Jakarta Sans", source: "google", weights: [400, 600, 700] },
        body: { family: "Inter", source: "google", weights: [400, 500, 600] },
      },
      spacing: { "0": "0rem", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem", "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem", "12": "3rem", "16": "4rem", "20": "5rem", "24": "6rem" },
      "border-radius": scaleRadius(0.75),
      shadows: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.15)",
      },
      motion: { duration: "0.2s", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      focus: { width: "2px", color: "rgb(var(--c-primary))", offset: "2px" },
      fluid: { base: "1", ratio: 1.25, min: 360, max: 1280 },
    },
    components: {},
    structure: { layoutType: "DefaultShell", layoutTypes: {} },
    layouts: {},
    templates: {},
  };
}

export default function ThemeManager() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const { data: themes = [], isLoading, refetch } = useGetThemeListQuery({ search, limit: 50 });
  const { data: activeTheme } = useGetActiveThemeQuery();
  const [activateTheme] = useActivateThemeMutation();
  const [deleteTheme] = useDeleteThemeMutation();
  const [importTheme] = useImportThemeMutation();
  const [saveTheme] = useSaveThemeMutation();
  const [confirmDelete, setConfirmDelete] = useState<YOTheme | null>(null);

  const handleCreateFromPreset = async (preset: (typeof THEME_PRESETS)[number]) => {
    const base = activeTheme?.Config ? parseThemeConfig(activeTheme.Config) : buildBaseConfig();
    const cfg = applyPresetToConfig(base, preset);
    const guid = generateGUID();
    try {
      await saveTheme({
        YOThemeUniqueId: guid,
        Name: `${preset.name} Theme`,
        Slug: `${preset.id}-theme`,
        Version: "1.0.0",
        Author: "Admin",
        Description: `Generated from ${preset.name} preset`,
        Config: JSON.stringify(cfg, null, 2),
      }).unwrap();
      toaster.success(`Created "${preset.name} Theme"`);
      refetch();
    } catch {
      toaster.error("Failed to create theme from preset");
    }
  };

  const handleActivate = async (theme: YOTheme) => {
    if (theme.IsActive) return;
    await activateTheme({ YOThemeUniqueId: theme.YOThemeUniqueId });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteTheme({ YOThemeUniqueId: confirmDelete.YOThemeUniqueId, CascadeLayouts: false });
    setConfirmDelete(null);
  };

  const handleExport = async (theme: YOTheme) => {
    try {
      const resp = await fetch(`/api/v1/yotheme/export/${theme.YOThemeUniqueId}`, { credentials: "include" });
      const json = await resp.json();
      if (json?.Data) {
        const blob = new Blob([JSON.stringify(json.Data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${theme.Slug}.theme.json`;
        a.click();
        URL.revokeObjectURL(url);
        toaster.success("Theme exported");
      }
    } catch {
      toaster.error("Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importTheme(JSON.parse(text)).unwrap();
      toaster.success("Theme imported");
      refetch();
    } catch {
      toaster.error("Import failed — check file format");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Themes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your site appearance and layout</p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <Upload size={16} />
            Import Theme
          </button>
        </div>
      </div>

      {/* New from preset — instant second theme for A/B testing */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">New from preset:</span>
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleCreateFromPreset(p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:border-indigo-400 hover:text-indigo-600 transition"
            title={`Create "${p.name} Theme"`}
          >
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.seed }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search themes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Theme Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : themes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No themes installed</p>
          <p className="text-sm mt-1">Upload a .yo-theme package to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.YOThemeId}
              theme={theme}
              onActivate={() => handleActivate(theme)}
              onExport={() => handleExport(theme)}
              onDelete={() => setConfirmDelete(theme)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Theme</h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete <strong>{confirmDelete.Name}</strong>?
              {confirmDelete.IsActive && (
                <span className="block mt-1 text-amber-600">
                  This theme is currently active. Deleting it will switch to the default theme.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Theme Card ───────────────────────────────────────────

function ThemeCard({
  theme,
  onActivate,
  onExport,
  onDelete,
}: {
  theme: YOTheme;
  onActivate: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/admin/theme/${theme.YOThemeUniqueId}`)}
    >
      {/* Screenshot */}
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
        {theme.Screenshot ? (
          <img
            src={theme.Screenshot}
            alt={theme.Name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package size={40} className="text-gray-300" />
        )}

        {/* Hover overlay */}
        {hover && !theme.IsActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onActivate(); }}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
            >
              Activate
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/theme/${theme.YOThemeUniqueId}`); }}
              className="px-4 py-2 bg-white/90 text-gray-900 rounded-lg text-sm font-medium hover:bg-white transition"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{theme.Name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              v{theme.Version}
              {theme.Author ? ` by ${theme.Author}` : ""}
            </p>
          </div>
          {theme.IsActive && (
            <span className="ml-2 flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
              <CheckCircle size={12} />
              Active
            </span>
          )}
        </div>

        {theme.Description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{theme.Description}</p>
        )}

        {theme.Tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {theme.Tags.split(",").map((tag) => (
              <span
                key={tag.trim()}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {theme.ParentThemeName && (
          <p className="text-xs text-indigo-500 mt-2">Child of {theme.ParentThemeName}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {theme.IsSystem && (
            <span className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-50 rounded">
              SYSTEM
            </span>
          )}
          {theme.OverrideCount > 0 && (
            <span className="text-[10px] text-amber-600 font-medium">
              {theme.OverrideCount} override{theme.OverrideCount !== 1 ? "s" : ""}
            </span>
          )}
          <div className="ml-auto flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onExport(); }}
              className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded transition"
              title="Export theme"
            >
              <Download size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              disabled={theme.IsSystem}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
              title="Delete theme"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
