import { useRef, useState } from "react";
import Label from "../../../../components/form/Label";
import toaster from "../../../../components/toster";
import { useUploadLayoutImageMutation } from "../../../../redux/layout/layoutAPI";
import { resolveImageUrl } from "../../../../utils/image";

export function FileImagePicker({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"url" | "upload">(value && !value.startsWith("data:") ? "url" : "upload");
  const [error, setError] = useState<string | null>(null);
  const [uploadLayoutImage, { isLoading: uploading }] = useUploadLayoutImageMutation();

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const result = await uploadLayoutImage(file).unwrap();
      if (!result?.url) throw new Error("No URL returned");
      onChange(result.url);
      setMode("url");
      toaster.success("Image uploaded");
    } catch (e: any) {
      const msg = e?.data?.Message || e?.message || "Upload failed";
      setError(msg);
      toaster.error(msg);
    }
  };

  const handleRemove = () => {
    setError(null);
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 text-xs dark:bg-gray-800">
          <button type="button" className={`rounded-md px-2 py-1 font-medium ${mode === "upload" ? "bg-white shadow-xs dark:bg-gray-900" : "text-gray-500"}`} onClick={() => setMode("upload")}>Upload</button>
          <button type="button" className={`rounded-md px-2 py-1 font-medium ${mode === "url" ? "bg-white shadow-xs dark:bg-gray-900" : "text-gray-500"}`} onClick={() => setMode("url")}>URL</button>
        </div>
      </div>

      {error && <p className="text-xs text-error-500">{error}</p>}

      {mode === "upload" ? (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div onClick={() => !uploading && fileRef.current?.click()} className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500">
            {uploading ? <span>Uploading…</span> : value ? <img src={resolveImageUrl(value)} alt="Preview" className="max-h-16 rounded object-contain" /> : <span>Click to upload image</span>}
          </div>
        </div>
      ) : (
        <input className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90"
          type="url" value={value} placeholder="https://example.com/logo.png"
          onChange={(e) => onChange(e.target.value)} />
      )}

      {value && (
        <div className="flex items-center gap-3">
          <img src={resolveImageUrl(value)} alt="Preview" className="h-10 w-10 rounded object-cover" />
          <button type="button" onClick={handleRemove}
            className="inline-flex items-center gap-1 rounded-lg border border-error-200 bg-error-50 px-2.5 py-1 text-xs font-medium text-error-600 hover:bg-error-100 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
