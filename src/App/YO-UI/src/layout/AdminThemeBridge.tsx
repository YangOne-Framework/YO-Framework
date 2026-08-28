import { useEffect, useMemo, useState } from "react";
import { useGetActiveStudioThemeQuery } from "../redux/theme/themeStudioAPI";
import { parseThemeConfig } from "../services/runtimeThemeCss";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Bridges the active YOTheme Studio theme into the admin shell: the platform
 * primary color is re-pointed at the theme's `primary` token so the admin UI
 * follows the published brand without a rebuild. Light/dark stays under the
 * admin ThemeContext (localStorage) — this only maps brand color tokens.
 */
export default function AdminThemeBridge() {
  const { data: activeTheme } = useGetActiveStudioThemeQuery();

  const css = useMemo(() => {
    const config = parseThemeConfig(activeTheme?.Config ?? null);
    const primary = config?.tokens?.colors?.primary?.default;
    if (!primary || !HEX.test(primary)) return "";
    return [
      `:root {`,
      `  --color-primary: ${primary};`,
      `  --color-brand-500: ${primary};`,
      `  --color-brand-600: color-mix(in srgb, ${primary} 82%, black);`,
      `  --color-brand-700: color-mix(in srgb, ${primary} 68%, black);`,
      `  --color-brand-400: color-mix(in srgb, ${primary} 78%, white);`,
      `  --color-brand-300: color-mix(in srgb, ${primary} 55%, white);`,
      `  --color-brand-200: color-mix(in srgb, ${primary} 32%, white);`,
      `  --color-brand-100: color-mix(in srgb, ${primary} 18%, white);`,
      `  --color-brand-50: color-mix(in srgb, ${primary} 8%, white);`,
      `  --color-primary-v6: color-mix(in srgb, ${primary} 8%, transparent);`,
      `}`,
    ].join("\n");
  }, [activeTheme]);

  if (!css) return null;
  return <style>{css}</style>;
}
