import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Trash2, Palette } from "lucide-react";
import {
  useGetThemeQuery,
  useSaveThemeMutation,
  useActivateThemeMutation,
  useDeleteThemeMutation,
  useGetThemeOverridesQuery,
  useGetThemeAssignmentsQuery,
} from "../../../redux/theme/themeAPI";
import { parseThemeConfig } from "../../../context/YOThemeContext";
import type { YOTheme, ParsedThemeConfig } from "../../../types/yoThemeTypes";

type Tab = "overview" | "config" | "overrides" | "assignments";

export default function ThemeDetail() {
  const { guid } = useParams<{ guid: string }>();
  const navigate = useNavigate();
  const { data: theme, isLoading, refetch } = useGetThemeQuery(guid!);
  const [saveTheme] = useSaveThemeMutation();
  const [activateTheme] = useActivateThemeMutation();
  const [deleteTheme] = useDeleteThemeMutation();

  const [tab, setTab] = useState<Tab>("overview");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [configJson, setConfigJson] = useState("");
  const [configError, setConfigError] = useState("");
  const [saving, setSaving] = useState(false);
  const [parsedConfig, setParsedConfig] = useState<ParsedThemeConfig | null>(null);

  useEffect(() => {
    if (theme) {
      setName(theme.Name);
      setDescription(theme.Description ?? "");
      setConfigJson(formatJson(theme.Config));
      setParsedConfig(parseThemeConfig(theme.Config));
    }
  }, [theme]);

  function formatJson(json: string | null | undefined): string {
    if (!json) return "{}";
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }

  function handleConfigChange(value: string) {
    setConfigJson(value);
    try {
      JSON.parse(value);
      setConfigError("");
    } catch {
      setConfigError("Invalid JSON");
    }
  }

  async function handleSave() {
    if (!theme) return;
    setSaving(true);
    try {
      let configToSave = theme.Config;
      if (configJson && configJson !== "{}") {
        JSON.parse(configJson);
        configToSave = configJson;
      }

      await saveTheme({
        YOThemeUniqueId: theme.YOThemeUniqueId,
        Name: name,
        Slug: theme.Slug,
        Version: theme.Version,
        Author: theme.Author,
        Description: description,
        Tags: theme.Tags,
        Config: configToSave,
      }).unwrap();
      refetch();
    } catch (e: any) {
      alert(e?.data?.Message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    if (!theme) return;
    await activateTheme({ YOThemeUniqueId: theme.YOThemeUniqueId });
  }

  async function handleDelete() {
    if (!theme || theme.IsSystem) return;
    if (!confirm(`Delete "${theme.Name}"?`)) return;
    await deleteTheme({ YOThemeUniqueId: theme.YOThemeUniqueId, CascadeLayouts: false });
    navigate("/admin/theme");
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400">
        Loading theme...
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p className="text-lg font-medium">Theme not found</p>
        <button
          onClick={() => navigate("/admin/theme")}
          className="mt-4 text-indigo-600 hover:underline text-sm"
        >
          Back to themes
        </button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "config", label: "Theme Config" },
    { key: "overrides", label: "Overrides" },
    { key: "assignments", label: "Assignments" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/theme")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{theme.Name}</h1>
            {theme.IsActive && (
              <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                Active
              </span>
            )}
            {theme.IsSystem && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                System
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            v{theme.Version}{theme.Author ? ` by ${theme.Author}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {!theme.IsActive && (
            <button
              onClick={handleActivate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <Eye size={16} />
              Activate
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/theme/editor/${guid}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition text-sm font-medium"
          >
            <Palette size={16} />
            Visual Editor
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !!configError}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
          {!theme.IsSystem && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm font-medium"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <OverviewTab theme={theme} name={name} description={description} onNameChange={setName} onDescriptionChange={setDescription} />
      )}

      {tab === "config" && (
        <ConfigTab configJson={configJson} configError={configError} onConfigChange={handleConfigChange} parsedConfig={parsedConfig} />
      )}

      {tab === "overrides" && <OverridesTab themeId={theme.YOThemeId} />}
      {tab === "assignments" && <AssignmentsTab themeId={theme.YOThemeId} themeName={theme.Name} />}
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────

function OverviewTab({
  theme, name, description, onNameChange, onDescriptionChange,
}: {
  theme: YOTheme;
  name: string;
  description: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={theme.Slug}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
            <input
              type="text"
              value={theme.Version}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={theme.Author ?? ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 text-sm mb-3">Theme Info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd className="text-gray-900 font-medium">{theme.IsActive ? "Active" : "Inactive"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Overrides</dt>
              <dd className="text-gray-900">{theme.OverrideCount}</dd>
            </div>
            {theme.ParentThemeName && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Parent</dt>
                <dd className="text-gray-900">{theme.ParentThemeName}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Tags</dt>
              <dd className="text-gray-900 text-right">{theme.Tags ?? "—"}</dd>
            </div>
          </dl>
        </div>
        {theme.Screenshot && (
          <img src={theme.Screenshot} alt={theme.Name} className="rounded-lg border border-gray-200 w-full" />
        )}
      </div>
    </div>
  );
}

// ── Config Tab ─────────────────────────────────────────

function ConfigTab({
  configJson, configError, onConfigChange, parsedConfig,
}: {
  configJson: string;
  configError: string;
  onConfigChange: (v: string) => void;
  parsedConfig: ParsedThemeConfig | null;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">theme.json</label>
          {configError && <span className="text-xs text-red-500">{configError}</span>}
        </div>
        <textarea
          value={configJson}
          onChange={(e) => onConfigChange(e.target.value)}
          rows={30}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 text-sm mb-3">Config Summary</h3>
          {parsedConfig ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Colors</dt>
                <dd className="text-gray-900">{Object.keys(parsedConfig.tokens?.colors ?? {}).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fonts</dt>
                <dd className="text-gray-900">{Object.keys(parsedConfig.tokens?.fonts ?? {}).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Components</dt>
                <dd className="text-gray-900">{Object.keys(parsedConfig.components ?? {}).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Layouts</dt>
                <dd className="text-gray-900">{Object.keys(parsedConfig.layouts ?? {}).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Templates</dt>
                <dd className="text-gray-900">{Object.keys(parsedConfig.templates ?? {}).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Layout Type</dt>
                <dd className="text-gray-900">{parsedConfig.structure?.layoutType ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-xs text-gray-400">Unable to parse config</p>
          )}
        </div>
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Structure:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="text-indigo-600">tokens</code> — CSS variables (colors, fonts, spacing)</li>
            <li><code className="text-indigo-600">components</code> — Variant configs (button style, card style)</li>
            <li><code className="text-indigo-600">structure</code> — Shell layout type</li>
            <li><code className="text-indigo-600">layouts</code> — Zone definitions</li>
            <li><code className="text-indigo-600">templates</code> — Template hierarchy</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Overrides Tab ──────────────────────────────────────

function OverridesTab({ themeId }: { themeId: number }) {
  const { data: overrides = [], isLoading } = useGetThemeOverridesQuery(themeId);

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>;

  return (
    <div>
      {overrides.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm font-medium">No customizations</p>
          <p className="text-xs mt-1">This theme has no customizer overrides yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {overrides.map((o) => (
            <div key={o.KeyPath} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <code className="text-xs text-indigo-600 font-medium w-64 shrink-0">{o.KeyPath}</code>
              <code className="text-xs text-gray-700 break-all">{o.Value}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Assignments Tab ─────────────────────────────────────

function AssignmentsTab({ themeId, themeName }: { themeId: number; themeName: string }) {
  const navigate = useNavigate();
  const { data: assignments = [], isLoading } = useGetThemeAssignmentsQuery(themeId);

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>;

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm font-medium">No assignments</p>
        <p className="text-xs mt-1">No layouts or pages are using this theme yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {assignments.length} entit{assignments.length === 1 ? "y" : "ies"} using <strong>{themeName}</strong>
      </p>
      <div className="space-y-2">
        {assignments.map((a) => (
          <div
            key={`${a.EntityType}-${a.EntityId}`}
            className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer"
            onClick={() => {
              if (a.EntityType === "Layout") navigate(`/admin/layout/edit?id=${a.EntityGUID}`);
              if (a.EntityType === "Page") navigate(`/admin/yopage/builder?id=${a.EntityGUID}`);
            }}
          >
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              a.EntityType === "Layout"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}>
              {a.EntityType}
            </span>
            <span className="text-sm font-medium text-gray-900">{a.EntityName}</span>
            <span className="ml-auto text-xs text-gray-400">{a.EntityGUID}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
