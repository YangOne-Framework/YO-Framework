import type { ThemeAssetRow } from "../types/yoThemeStudioTypes";
import type { YOThemePackage } from "../types/yoThemeTypes";

export type PackageAssets = YOThemePackage["assets"];

const MAX_FILE_BYTES = 5 * 1024 * 1024; // per-asset guard
const CDN = (import.meta as { env?: Record<string, string> }).env?.VITE_CDN_PATH ?? "";

/** Resolve an asset path to a fetchable URL (relative paths hit the CDN origin). */
function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${CDN}${path}`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(blob);
  });
}

function filenameOf(path: string): string {
  const clean = path.split("?")[0].split("#")[0];
  return clean.substring(clean.lastIndexOf("/") + 1) || "asset";
}

/**
 * Fetch every theme asset row's binary and embed it into the package.
 * The map key is the original AssetPath so folder structure survives
 * inside the single .yo-theme.json and can be restored on import.
 * Unreachable files are skipped and reported, never fatal.
 */
export async function collectThemeAssets(
  rows: ThemeAssetRow[],
): Promise<{ assets: PackageAssets; failed: string[] }> {
  const assets: PackageAssets = {};
  const failed: string[] = [];
  for (const row of rows) {
    if (!row.AssetPath) continue;
    try {
      const res = await fetch(resolveUrl(row.AssetPath));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (blob.size > MAX_FILE_BYTES) throw new Error("file exceeds 5 MB package limit");
      assets[row.AssetPath] = {
        data: await blobToBase64(blob),
        mime: row.MimeType || blob.type || "application/octet-stream",
        filename: filenameOf(row.AssetPath),
      };
    } catch {
      failed.push(row.AssetPath);
    }
  }
  return { assets, failed };
}

export function base64ToFile(b64: string, filename: string, mime: string): File {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime || "application/octet-stream" });
}

/** Guess the YOThemeAsset.AssetType from a package entry. */
export function guessAssetType(mime: string, path: string): string {
  const p = path.toLowerCase();
  if (p.includes("favicon") && /image|icon/.test(mime)) return "favicon";
  if (/font|woff|ttf|otf/.test(mime) || /\.woff2?|\.ttf|\.otf$/.test(p)) return "font";
  if (mime.startsWith("image/svg")) return p.includes("logo-dark") ? "logo-dark" : p.includes("logo") ? "logo" : "image";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "file";
  return "file";
}

export interface UploadedAsset {
  oldPath: string;
  newPath: string;
  mime: string;
  filename: string;
}

/**
 * Upload every embedded package entry under `dir` via the media library and
 * return old→new path mappings so asset rows (and font references) can be
 * re-created against this installation.
 */
export async function uploadPackageAssets(
  assets: PackageAssets,
  dir: string,
  uploadOne: (file: File, dir: string) => Promise<void>,
): Promise<{ uploaded: UploadedAsset[]; failed: string[] }> {
  const uploaded: UploadedAsset[] = [];
  const failed: string[] = [];
  for (const [oldPath, entry] of Object.entries(assets)) {
    try {
      if (!entry?.data) throw new Error("empty payload");
      const file = base64ToFile(entry.data, entry.filename || filenameOf(oldPath), entry.mime || "");
      await uploadOne(file, dir);
      uploaded.push({
        oldPath,
        newPath: `/uploads/media/${dir.replace(/^\/+|\/+$/g, "")}/${file.name}`,
        mime: entry.mime || file.type,
        filename: file.name,
      });
    } catch {
      failed.push(oldPath);
    }
  }
  return { uploaded, failed };
}
