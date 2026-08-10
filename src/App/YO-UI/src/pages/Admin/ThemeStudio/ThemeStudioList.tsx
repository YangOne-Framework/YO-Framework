import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Archive, Copy, Download, FilePlus2, Import, Loader2, MoreHorizontal,
  Palette, Plus, Search, Star, Trash2,
} from "lucide-react";
import {
  useCreateStudioThemeMutation,
  useDeleteStudioThemeMutation,
  useGetStudioThemesQuery,
} from "../../../redux/theme/themeStudioAPI";
import {
  useDuplicateThemeMutation,
  useGetReviewQueueQuery,
  useSetDefaultThemeMutation,
  useSetThemeStatusMutation,
} from "../../../redux/theme/themeStudioAPI";
import { createEmptyStudioConfig, normalizeToStudioConfig } from "../../../services/themeMigration";
import type { YOTheme } from "../../../types/yoThemeTypes";
import type { ThemeStatus } from "../../../types/yoThemeStudioTypes";
import { StatusChip } from "./studioShared";

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "under_review", label: "In Review" },
  { key: "approved", label: "Approved" },
  { key: "archived", label: "Archived" },
];

/**
 * YOTheme Studio dashboard (blueprint §16) — theme cards with lifecycle
 * status, create/duplicate/import/archive and set-default actions.
 */
export default function ThemeStudioList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: themes = [], isLoading, refetch } = useGetStudioThemesQuery({ limit: 100 });
  const { data: reviewQueue = [], isLoading: reviewQueueLoading } = useGetReviewQueueQuery();
  const [createThemeMutation] = useCreateStudioThemeMutation();
  const [deleteTheme] = useDeleteStudioThemeMutation();
  const [duplicateTheme] = useDuplicateThemeMutation();
  const [setDefault] = useSetDefaultThemeMutation();
  const [setStatus] = useSetThemeStatusMutation();

  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      themes.filter((t: YOTheme) => {
        const matchesSearch =
          !search || t.Name.toLowerCase().includes(search.toLowerCase()) || t.Slug.toLowerCase().includes(search.toLowerCase());
        const status = t.Status ?? (t.IsActive ? "published" : "draft");
        const matchesStatus =
          statusFilter === "all" || status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [themes, search, statusFilter],
  );

  const createTheme = async (name: string, config: Record<string, unknown>) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "theme";
    try {
      const result = await createThemeMutation({
        Name: name,
        Slug: slug,
        Version: "1.0.0",
        Config: JSON.stringify(config),
        SchemaVersion: 2,
      }).unwrap();
      const guid = result?.YOThemeUniqueId;
      toast.success("Theme created");
      refetch();
      if (guid) navigate(`/admin/theme-studio/editor/${guid}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create theme");
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawConfig = parsed?.config ?? parsed?.Config ?? parsed;
      const { config } = normalizeToStudioConfig(rawConfig);
      const name = parsed?.meta?.name ?? parsed?.name ?? parsed?.Name ?? file.name.replace(/\.(yotheme\.)?json$/i, "");
      await createTheme(`${name} (imported)`, config as unknown as Record<string, unknown>);
    } catch {
      toast.error("Could not import — invalid theme package");
    }
  };

  const doDuplicate = async (theme: YOTheme) => {
    try {
      await duplicateTheme({ guid: theme.YOThemeUniqueId }).unwrap();
      toast.success("Duplicated as a new draft");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Duplicate failed");
    }
  };

  const doArchive = async (theme: YOTheme) => {
    try {
      await setStatus({ guid: theme.YOThemeUniqueId, status: "archived" }).unwrap();
      toast.success("Theme archived");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not archive");
    }
  };

  const doSetDefault = async (theme: YOTheme) => {
    try {
      await setDefault(theme.YOThemeUniqueId).unwrap();
      toast.success(`“${theme.Name}” is now the default theme`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not set default");
    }
  };

  const doDelete = async (theme: YOTheme) => {
    if (!window.confirm(`Delete “${theme.Name}”? This cannot be undone.`)) return;
    try {
      await deleteTheme({ YOThemeUniqueId: theme.YOThemeUniqueId, CascadeLayouts: false }).unwrap();
      toast.success("Theme deleted");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const statusOf = (t: YOTheme): ThemeStatus => t.Status ?? (t.IsActive ? "published" : "draft");

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Theme Studio</h1>
          <p className="text-xs text-gray-500">
            Design tokens, component styles and layouts — published to every application from one place.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Import size={13} /> Import
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={13} /> New Theme
          </button>
        </div>
      </div>

      {(reviewQueueLoading || reviewQueue.length > 0) && (
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-amber-900">Review queue</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{reviewQueue.length}</span>
            <p className="text-[11px] text-amber-700/70">Themes awaiting governance decisions or ready for publication.</p>
          </div>
          {reviewQueueLoading ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700"><Loader2 size={13} className="animate-spin" /> Loading review queue…</div>
          ) : (
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {reviewQueue.map((item) => (
                <button key={item.YOThemeUniqueId} type="button" onClick={() => navigate(`/admin/theme-studio/editor/${item.YOThemeUniqueId}`)} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-left transition hover:border-amber-300 hover:shadow-sm">
                  <div className="flex items-center gap-2"><span className="truncate text-xs font-semibold text-gray-800">{item.Name}</span><StatusChip status={item.Status} /></div>
                  <p className="mt-1 text-[10px] text-gray-400">{item.Slug} · {item.PendingApprovals} pending approval{item.PendingApprovals === 1 ? "" : "s"} · {item.OpenComments} open comment{item.OpenComments === 1 ? "" : "s"}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search themes…"
            className="w-60 rounded-xl border border-gray-200/80 bg-white py-2 pl-8 pr-3 text-xs outline-none transition-all focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-50"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                statusFilter === f.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 py-16 text-gray-400">
          <Palette size={28} />
          <p className="text-sm">No themes match — create your first theme to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((theme: YOTheme) => (
            <ThemeCard
              key={theme.YOThemeUniqueId}
              theme={theme}
              status={statusOf(theme)}
              menuOpen={menuFor === theme.YOThemeUniqueId}
              onToggleMenu={() => setMenuFor(menuFor === theme.YOThemeUniqueId ? null : theme.YOThemeUniqueId)}
              onOpen={() => navigate(`/admin/theme-studio/editor/${theme.YOThemeUniqueId}`)}
              onOpenLegacy={() => navigate(`/admin/theme/editor/${theme.YOThemeUniqueId}`)}
              onDuplicate={() => doDuplicate(theme)}
              onSetDefault={() => doSetDefault(theme)}
              onArchive={() => doArchive(theme)}
              onDelete={() => doDelete(theme)}
            />
          ))}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-gray-800">Create a new theme</h3>
            <p className="mt-0.5 text-xs text-gray-500">Starts as a draft with the default token set — customize everything in the studio.</p>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Corporate Theme"
              className="mt-4 w-full rounded-xl border border-gray-200/80 px-3 py-2 text-sm outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-50"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setCreating(false); setNewName(""); }}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newName.trim()}
                onClick={() => {
                  const name = newName.trim();
                  setCreating(false);
                  setNewName("");
                  createTheme(name, createEmptyStudioConfig() as unknown as Record<string, unknown>);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
              >
                <FilePlus2 size={13} /> Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeCard({
  theme,
  status,
  menuOpen,
  onToggleMenu,
  onOpen,
  onOpenLegacy,
  onDuplicate,
  onSetDefault,
  onArchive,
  onDelete,
}: {
  theme: YOTheme;
  status: ThemeStatus;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpen: () => void;
  onOpenLegacy: () => void;
  onDuplicate: () => void;
  onSetDefault: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const swatches = useMemo(() => {
    try {
      const config = JSON.parse(theme.Config ?? "{}");
      if (config.version === 2) {
        return Object.values(config.tokens?.primitive ?? {})
          .filter((t) => (t as { type?: string }).type === "color")
          .slice(0, 5)
          .map((t) => (t as { value?: string }).value ?? "#e2e8f0");
      }
      return Object.values(config.tokens?.colors ?? {})
        .slice(0, 5)
        .map((c) => (c as { default?: string }).default ?? "#e2e8f0");
    } catch {
      return [];
    }
  }, [theme.Config]);

  return (
    <div className="group relative rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex -space-x-1.5 pt-1">
          {swatches.length ? (
            swatches.map((s, i) => (
              <span key={i} className="h-6 w-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: s }} />
            ))
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-400">?</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-800">{theme.Name}</h3>
            {theme.IsDefault && <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />}
          </div>
          <p className="truncate text-[10px] text-gray-400">
            {theme.Slug} · updated {theme.UpdatedOn ? new Date(theme.UpdatedOn).toLocaleDateString() : "—"}
          </p>
        </div>
        <StatusChip status={status} />
        <div className="relative">
          <button
            type="button"
            onClick={onToggleMenu}
            className="rounded-lg p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-500"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-30 w-48 rounded-xl border border-gray-200/80 bg-white py-1 shadow-xl">
              <MenuItem icon={<Copy size={12} />} label="Duplicate" onClick={onDuplicate} />
              {!theme.IsDefault && status === "published" && (
                <MenuItem icon={<Star size={12} />} label="Set as default" onClick={onSetDefault} />
              )}
              <MenuItem icon={<Download size={12} />} label="Export (open studio)" onClick={onOpen} />
              {status !== "archived" ? (
                <MenuItem icon={<Archive size={12} />} label="Archive" onClick={onArchive} />
              ) : null}
              {!theme.IsSystem && !theme.IsDefault && (
                <MenuItem icon={<Trash2 size={12} />} label="Delete" danger onClick={onDelete} />
              )}
            </div>
          )}
        </div>
      </div>

      {theme.Description && <p className="mt-2 line-clamp-2 text-[11px] text-gray-500">{theme.Description}</p>}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          Open in Studio
        </button>
        <button
          type="button"
          onClick={onOpenLegacy}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
          title="Open in the classic theme editor"
        >
          Classic
        </button>
      </div>
    </div>
  );
}

function MenuItem({
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
