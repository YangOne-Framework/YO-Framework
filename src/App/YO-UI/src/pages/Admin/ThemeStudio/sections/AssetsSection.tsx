import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  useAddThemeAssetMutation,
  useDeleteThemeAssetMutation,
  useGetThemeAssetsQuery,
} from "../../../../redux/theme/themeStudioAPI";
import { Accordion, LabeledInput, LabeledSelect, SectionShell, type StudioSectionProps } from "../studioShared";

const ASSET_TYPES = ["logo", "logo-dark", "logo-compact", "favicon", "font", "image", "illustration", "video", "file"];

/**
 * Assets section (blueprint §64) — theme-scoped brand assets stored in
 * dbo.YOThemeAsset, referenced by tokens and custom CSS.
 */
export function AssetsSection({ guid }: StudioSectionProps) {
  const { data: assets = [] } = useGetThemeAssetsQuery(guid);
  const [addAsset, { isLoading }] = useAddThemeAssetMutation();
  const [deleteAsset] = useDeleteThemeAssetMutation();
  const [draft, setDraft] = useState({ assetType: "logo", assetPath: "", assetName: "", altText: "" });

  return (
    <SectionShell
      title="Assets"
      description="Logos, favicons, fonts and media that ship with this theme."
    >
      <Accordion title="Theme Assets" badge={String(assets.length)}>
        {assets.length === 0 ? (
          <p className="text-xs text-gray-400">No assets yet — add a logo or favicon below.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {assets.map((asset) => (
              <div key={asset.YOThemeAssetId} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-3">
                {/\.(png|jpe?g|svg|webp|gif|ico)$/i.test(asset.AssetPath ?? "") ? (
                  <img src={asset.AssetPath} alt={asset.AltText ?? asset.AssetType} className="h-10 w-10 rounded-lg border border-gray-100 object-contain" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[9px] font-bold uppercase text-gray-400">
                    {asset.AssetType?.slice(0, 4)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-700">{asset.AssetName ?? asset.AssetType}</div>
                  <div className="truncate text-[10px] text-gray-400">{asset.AssetPath}</div>
                </div>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500">
                  {asset.AssetType}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deleteAsset(asset.YOThemeAssetId).unwrap();
                      toast.success("Asset removed");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Remove failed");
                    }
                  }}
                  className="rounded p-1 text-gray-300 transition hover:text-red-500"
                  title="Remove asset"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      <Accordion title="Add Asset" defaultOpen={assets.length === 0}>
        <div className="grid grid-cols-2 gap-3">
          <LabeledSelect
            label="Type"
            value={draft.assetType}
            options={ASSET_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(v) => setDraft({ ...draft, assetType: v })}
          />
          <LabeledInput
            label="Name"
            value={draft.assetName}
            onChange={(v) => setDraft({ ...draft, assetName: v })}
            placeholder="Primary logo"
          />
          <div className="col-span-2">
            <LabeledInput
              label="Asset path / URL"
              value={draft.assetPath}
              onChange={(v) => setDraft({ ...draft, assetPath: v })}
              placeholder="/Uploads/theme/logo.svg"
              mono
            />
          </div>
          <div className="col-span-2">
            <LabeledInput
              label="Alt text"
              value={draft.altText}
              onChange={(v) => setDraft({ ...draft, altText: v })}
              placeholder="Company logo"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={!draft.assetPath || isLoading}
          onClick={async () => {
            try {
              await addAsset({
                guid,
                assetType: draft.assetType,
                assetPath: draft.assetPath,
                assetName: draft.assetName || draft.assetType,
                altText: draft.altText,
              }).unwrap();
              toast.success("Asset added");
              setDraft({ assetType: "logo", assetPath: "", assetName: "", altText: "" });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed to add asset");
            }
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-40"
        >
          <Plus size={12} /> Add asset
        </button>
      </Accordion>
    </SectionShell>
  );
}
