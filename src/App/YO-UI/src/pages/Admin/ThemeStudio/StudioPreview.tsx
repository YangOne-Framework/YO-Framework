import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Monitor, Moon, RefreshCw, Smartphone, Sun, Tablet } from "lucide-react";
import type { StudioThemeConfig } from "../../../types/yoThemeStudioTypes";
import { encodeBase64Url } from "../../../services/previewEncoding";
import { useGetYoPageListQuery } from "../../../redux/cmspage/cmsPageAPI";

type Device = "mobile" | "tablet" | "desktop";

const DEVICE_WIDTHS: Record<Device, string> = {
  mobile: "375px",
  tablet: "768px",
  desktop: "100%",
};

const DEBOUNCE_MS = 350;

/**
 * Live preview — loads the ACTUAL published page (default: home) inside an
 * iframe and injects the current unsaved studio draft via ?themeConfig, so
 * every token change is visible immediately against the real page content.
 * Dark/light is forced through ?mode, which the page applies as CSS vars.
 */
export function StudioPreview({
  config,
  slug,
  onModeSelect,
}: {
  config: StudioThemeConfig;
  /** Fallback when no published pages exist. */
  slug?: string;
  onModeSelect?: (mode: "light" | "dark") => void;
}) {
  /* Preview the first real published page — a hardcoded slug breaks on any
     install where that page doesn't exist. Falls back to home/root. */
  const { data: pages } = useGetYoPageListQuery({ limit: 20, status: "published" });
  const previewSlug = useMemo(() => {
    const list = (pages as unknown as { data?: Array<{ Slug?: string; Status?: string }> } | undefined)?.data ?? [];
    const firstPublished = list.find((p) => p.Slug && p.Status === "published")?.Slug;
    return slug ?? firstPublished ?? "home";
  }, [pages, slug]);
  const [device, setDevice] = useState<Device>("desktop");
  const [forcedDark, setForcedDark] = useState<boolean | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [src, setSrc] = useState("");
  const timer = useRef<number | null>(null);
  const lastSrc = useRef("");

  /* Follow the theme's defaultMode (so changes reflect live); the toggle
     writes the chosen mode back to the theme when the editor is connected. */
  const dark = forcedDark !== null ? forcedDark : config?.appearance?.defaultMode === "dark";

  const toggleMode = () => {
    const next = !dark;
    setForcedDark(next);
    onModeSelect?.(next ? "dark" : "light");
  };

  useEffect(() => {
    if (!config?.tokens) {
      setSrc("");
      return;
    }
    const next = `/preview/${previewSlug}?themeConfig=${encodeBase64Url(JSON.stringify(config))}&mode=${dark ? "dark" : "light"}&v=${reloadKey}`;
    if (next === lastSrc.current) return;
    lastSrc.current = next;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSrc(next), DEBOUNCE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [config, dark, previewSlug, reloadKey]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-gray-200/70 bg-gray-50/60 px-2 py-1.5">
        {(
          [
            { key: "mobile", icon: <Smartphone size={13} /> },
            { key: "tablet", icon: <Tablet size={13} /> },
            { key: "desktop", icon: <Monitor size={13} /> },
          ] as Array<{ key: Device; icon: React.ReactNode }>
        ).map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDevice(d.key)}
            className={`rounded-lg p-1.5 transition-all ${device === d.key ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            title={d.key}
          >
            {d.icon}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <button
          type="button"
          onClick={toggleMode}
          className={`rounded-lg p-1.5 transition-all ${dark ? "bg-gray-800 text-amber-300" : "text-gray-400 hover:text-gray-600"}`}
          title={dark ? "Switch to light preview" : "Switch to dark preview"}
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
          title="Reload preview"
        >
          <RefreshCw size={13} />
        </button>
        <a
          href={src || `/#`}
          target="_blank"
          rel="noreferrer"
          className={`rounded-lg p-1.5 transition-all hover:bg-gray-100 ${src ? "text-gray-400 hover:text-gray-600" : "pointer-events-none text-gray-300"}`}
          title="Open preview in a new tab"
        >
          <ExternalLink size={13} />
        </a>
        <span className="ml-auto truncate pr-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Live preview · /{previewSlug}
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100/70 p-3">
        {src ? (
          <iframe
            key={src}
            title={`Live preview of /${previewSlug}`}
            src={src}
            className="mx-auto block h-full min-h-[480px] rounded-xl border border-gray-200 bg-white shadow-sm transition-all"
            style={{ width: DEVICE_WIDTHS[device] }}
          />
        ) : (
          <div className="flex h-full min-h-[480px] items-center justify-center text-xs text-gray-400">
            No theme config — nothing to preview yet
          </div>
        )}
      </div>
    </div>
  );
}
