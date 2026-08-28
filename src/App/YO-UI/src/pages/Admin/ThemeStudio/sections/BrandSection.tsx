import { useGetBrandKitsQuery } from "../../../../redux/theme/themeStudioAPI";
import { Accordion, LabeledInput, LabeledSelect, SectionShell, type StudioSectionProps } from "../studioShared";

/**
 * Brand section (blueprint §31) — brand kit linkage, identity and appearance
 * modes. Brand kits themselves are managed from the studio dashboard.
 */
export function BrandSection({ config, update }: StudioSectionProps) {
  const { data: brandKits = [] } = useGetBrandKitsQuery();
  /* Legacy/migrated themes may lack the appearance block entirely. */
  const appearance = {
    defaultMode: "light" as "light" | "dark",
    supportedModes: ["light", "dark"] as Array<"light" | "dark">,
    ...(config.appearance ?? {}),
  };
  if (!appearance.supportedModes?.length) appearance.supportedModes = ["light", "dark"];

  return (
    <SectionShell
      title="Brand"
      description="Brand identity, brand kit linkage and appearance modes for this theme."
    >
      <Accordion title="Appearance Modes" badge={appearance.defaultMode}>
        <div className="grid grid-cols-2 gap-3">
          <LabeledSelect
            label="Default mode"
            value={appearance.defaultMode}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            onChange={(v) =>
              update("appearance.defaultMode", (cfg) => ({
                ...cfg,
                appearance: { ...cfg.appearance, defaultMode: v as "light" | "dark" },
              }))
            }
          />
          <div>
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">Supported modes</span>
            <div className="flex gap-2 pt-1.5">
              {(["light", "dark"] as const).map((mode) => {
                const active = appearance.supportedModes.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      update("appearance.supportedModes", (cfg) => {
                        const current: Array<"light" | "dark"> = cfg.appearance?.supportedModes?.length
                          ? cfg.appearance.supportedModes
                          : ["light", "dark"];
                        const modes = active
                          ? current.filter((m) => m !== mode)
                          : [...current, mode];
                        return {
                          ...cfg,
                          appearance: {
                            ...cfg.appearance,
                            supportedModes: modes.length ? modes : ["light"],
                          },
                        };
                      })
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                      active
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Brand Kit" defaultOpen={false}>
        <div className="space-y-3">
          <LabeledSelect
            label="Linked brand kit"
            value={String(config.brand?.brandKitId ?? "")}
            options={[
              { value: "", label: "None" },
              ...brandKits.map((k) => ({ value: String(k.BrandKitId), label: k.Name })),
            ]}
            onChange={(v) =>
              update("brand.brandKitId", (cfg) => ({
                ...cfg,
                brand: { ...cfg.brand, brandKitId: v ? Number(v) : null },
              }))
            }
          />
          <p className="text-[11px] text-gray-400">
            Applying a brand kit seeds brand colors and fonts into the Colors and
            Typography sections — tokens remain fully editable afterwards.
          </p>
        </div>
      </Accordion>

      <Accordion title="Identity" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="Primary font"
            value={config.brand?.primaryFont ?? ""}
            onChange={(v) =>
              update("brand.primaryFont", (cfg) => ({ ...cfg, brand: { ...cfg.brand, primaryFont: v } }))
            }
            placeholder="Inter"
          />
          <LabeledInput
            label="Heading font"
            value={config.brand?.headingFont ?? ""}
            onChange={(v) =>
              update("brand.headingFont", (cfg) => ({ ...cfg, brand: { ...cfg.brand, headingFont: v } }))
            }
            placeholder="Poppins"
          />
        </div>
      </Accordion>
    </SectionShell>
  );
}
