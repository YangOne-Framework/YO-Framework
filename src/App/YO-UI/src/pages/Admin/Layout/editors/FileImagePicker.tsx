import { useRef, useState } from "react";
import Label from "../../../../components/form/Label";

export function FileImagePicker({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"url" | "upload">(value && !value.startsWith("data:") ? "url" : "upload");
  const [preview, setPreview] = useState(value);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 text-xs dark:bg-gray-800">
          <button className={`rounded-md px-2 py-1 font-medium ${mode === "upload" ? "bg-white shadow-xs dark:bg-gray-900" : "text-gray-500"}`} onClick={() => setMode("upload")}>Upload</button>
          <button className={`rounded-md px-2 py-1 font-medium ${mode === "url" ? "bg-white shadow-xs dark:bg-gray-900" : "text-gray-500"}`} onClick={() => setMode("url")}>URL</button>
        </div>
      </div>

      {mode === "upload" ? (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div onClick={() => fileRef.current?.click()} className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500">
            {preview ? <img src={preview} alt="Preview" className="max-h-16 rounded object-contain" /> : <span>Click to upload image</span>}
          </div>
        </div>
      ) : (
        <input className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90"
          type="url" value={value} placeholder="https://example.com/logo.png"
          onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }} />
      )}
    </div>
  );
}
