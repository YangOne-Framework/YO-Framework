import type { ParsedThemeConfig } from "../types/yoThemeTypes";

/**
 * Injects <link> tags for every Google-sourced font family declared in the
 * theme tokens, so the selected heading/body fonts actually load and render.
 * Without this, changing a font family in the editor falls back to system-ui
 * and the preview appears unchanged.
 */
export function GoogleFontLoader({ fonts }: { fonts: ParsedThemeConfig["tokens"]["fonts"] }) {
  if (!fonts) return null;

  const families = Object.values(fonts)
    .filter((f) => f.source === "google")
    .map((f) => `${f.family.replace(/ /g, "+")}:wght@${f.weights.join(";")}`)
    .join("&family=");

  if (!families) return null;

  return (
    <link
      rel="stylesheet"
      href={`https://fonts.googleapis.com/css2?family=${families}&display=swap`}
    />
  );
}
