/**
 * Resolve an image URL for use in <img src> or a CSS background `url(...)`.
 *
 * - Absolute URLs (http(s)://, protocol-relative //, or data:) are returned as-is.
 * - Relative paths (e.g. /uploads/layout/images/...) are prefixed with the CDN
 *   base path (VITE_CDN_PATH) following the app-wide convention used by media
 *   library and other uploaded assets, so they resolve in the builder, preview
 *   and on the published site.
 * - Bare relative paths are normalized to root-relative first.
 */
export function resolveImageUrl(url: unknown): string {
  if (!url || typeof url !== "string") return "";
  const value = url.trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  const cdnPath = import.meta.env.VITE_CDN_PATH || "";
  if (value.startsWith("/")) return `${cdnPath}${value}`;
  return `${cdnPath}/${value}`;
}
