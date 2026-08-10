import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FontField, NumericField } from "../ThemeTokenFields";
import { Accordion, LabeledSelect, SectionShell, type StudioSectionProps } from "../studioShared";

/**
 * Typography section (blueprint §44) — font roles, sources, weights and the
 * fluid modular type scale.
 */
export function TypographySection({ config, update }: StudioSectionProps) {
  const [newFontKey, setNewFontKey] = useState("");
  const fonts = config.typography.fonts ?? {};
  const fluid = config.typography.fluid ?? {};

  const setFont = (key: string, patch: Record<string, unknown>) =>
    update(`typography.fonts.${key}`, (cfg) => ({
      ...cfg,
      typography: {
        ...cfg.typography,
        fonts: {
          ...cfg.typography.fonts,
          [key]: { weights: [400], source: "google", ...cfg.typography.fonts[key], ...patch },
        },
      },
    }));

  const removeFont = (key: string) =>
    update(`typography.fonts.${key}`, (cfg) => {
      const fontsCopy = { ...cfg.typography.fonts };
      delete fontsCopy[key];
      return { ...cfg, typography: { ...cfg.typography, fonts: fontsCopy } };
    });

  return (
    <SectionShell
      title="Typography"
      description="Font roles, loading sources and the fluid modular scale used by headings and body text."
    >
      <Accordion title="Font Roles" badge={String(Object.keys(fonts).length)}>
        <div className="space-y-3">
          {Object.entries(fonts).map(([key, font]) => (
            <div key={key} className="relative">
              <FontField
                label={key}
                family={font.family ?? "Inter"}
                source={font.source ?? "google"}
                weights={font.weights ?? [400]}
                onFamilyChange={(v) => setFont(key, { family: v })}
                onSourceChange={(v) => setFont(key, { source: v })}
                onWeightsChange={(v) => setFont(key, { weights: v })}
              />
              <button
                type="button"
                onClick={() => removeFont(key)}
                className="absolute right-3 top-3 rounded p-1 text-gray-300 transition hover:text-red-500"
                title="Remove font role"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFontKey}
              onChange={(e) => setNewFontKey(e.target.value)}
              placeholder="display"
              className="w-48 rounded-lg border border-gray-200/80 px-3 py-1.5 text-[11px] outline-none focus:border-indigo-400/60"
            />
            <button
              type="button"
              disabled={!newFontKey || !!fonts[newFontKey]}
              onClick={() => {
                setFont(newFontKey, { family: "Inter" });
                setNewFontKey("");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <Plus size={12} /> Add role
            </button>
          </div>
        </div>
      </Accordion>

      <Accordion title="Fluid Type Scale" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4">
          <NumericField
            label="Base size"
            value={fluid.base ?? "16px"}
            min={12}
            max={22}
            step={0.5}
            units={["px", "rem"]}
            onChange={(v) =>
              update("typography.fluid.base", (cfg) => ({
                ...cfg,
                typography: { ...cfg.typography, fluid: { ...cfg.typography.fluid, base: v } },
              }))
            }
          />
          <LabeledSelect
            label="Scale ratio"
            value={String(fluid.ratio ?? 1.25)}
            options={[
              { value: "1.125", label: "1.125 — Major second" },
              { value: "1.2", label: "1.2 — Minor third" },
              { value: "1.25", label: "1.25 — Major third" },
              { value: "1.333", label: "1.333 — Perfect fourth" },
              { value: "1.5", label: "1.5 — Perfect fifth" },
              { value: "1.618", label: "1.618 — Golden ratio" },
            ]}
            onChange={(v) =>
              update("typography.fluid.ratio", (cfg) => ({
                ...cfg,
                typography: { ...cfg.typography, fluid: { ...cfg.typography.fluid, ratio: Number(v) } },
              }))
            }
          />
          <NumericField
            label="Min viewport"
            value={`${fluid.min ?? 360}px`}
            min={280}
            max={768}
            step={10}
            units={["px"]}
            onChange={(v) =>
              update("typography.fluid.min", (cfg) => ({
                ...cfg,
                typography: { ...cfg.typography, fluid: { ...cfg.typography.fluid, min: parseFloat(v) || 360 } },
              }))
            }
          />
          <NumericField
            label="Max viewport"
            value={`${fluid.max ?? 1280}px`}
            min={768}
            max={1920}
            step={10}
            units={["px"]}
            onChange={(v) =>
              update("typography.fluid.max", (cfg) => ({
                ...cfg,
                typography: { ...cfg.typography, fluid: { ...cfg.typography.fluid, max: parseFloat(v) || 1280 } },
              }))
            }
          />
        </div>
      </Accordion>
    </SectionShell>
  );
}
