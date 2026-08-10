import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ShadowField } from "../ThemeTokenFields";
import type { StudioThemeConfig } from "../../../../types/yoThemeStudioTypes";
import { Accordion, LabeledInput, SectionShell, type StudioSectionProps } from "../studioShared";

/** Generic editable Record<string, string> group with add/remove rows. */
function RecordEditor({
  entries,
  onSet,
  onRemove,
  addPlaceholder,
  valueInput,
}: {
  entries: Array<[string, string]>;
  onSet: (key: string, value: string) => void;
  onRemove: (key: string) => void;
  addPlaceholder: string;
  valueInput?: (key: string, value: string) => React.ReactNode;
}) {
  const [newKey, setNewKey] = useState("");
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-start gap-2">
          <code className="w-24 shrink-0 pt-2 text-[11px] text-gray-500">{key}</code>
          <div className="min-w-0 flex-1">
            {valueInput ? (
              valueInput(key, value)
            ) : (
              <LabeledInput label="" value={value} onChange={(v) => onSet(key, v)} mono />
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(key)}
            className="mt-2 rounded p-1 text-gray-300 transition hover:text-red-500"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={addPlaceholder}
          className="w-40 rounded-lg border border-gray-200/80 px-3 py-1.5 text-[11px] outline-none focus:border-indigo-400/60"
        />
        <button
          type="button"
          disabled={!newKey}
          onClick={() => {
            onSet(newKey, "");
            setNewKey("");
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  );
}

type ScaleGroup = "spacing" | "shape" | "elevation";

/**
 * Spacing / Shape / Elevation / Motion sections (blueprint §45–§47) — scale
 * groups that compile to the existing --spacing-*, --radius-*, --shadow-* vars.
 */
export function ScalesSection({ config, update, group }: StudioSectionProps & { group: ScaleGroup | "motion" }) {
  if (group === "motion") return <MotionSection config={config} update={update} guid="" />;
  if (group === "spacing") return <SpacingSection config={config} update={update} guid="" />;
  if (group === "shape") return <ShapeSection config={config} update={update} guid="" />;
  return <ElevationSection config={config} update={update} guid="" />;
}

function SpacingSection({ config, update }: StudioSectionProps) {
  const scale = config.spacing.scale ?? {};
  const set = (key: string, value: string) =>
    update(`spacing.scale.${key}`, (cfg) => ({
      ...cfg,
      spacing: { ...cfg.spacing, scale: { ...cfg.spacing.scale, [key]: value } },
    }));
  const remove = (key: string) =>
    update(`spacing.scale.${key}`, (cfg) => {
      const s = { ...cfg.spacing.scale };
      delete s[key];
      return { ...cfg, spacing: { ...cfg.spacing, scale: s } };
    });

  return (
    <SectionShell title="Spacing" description="Spacing scale compiled to --spacing-* variables.">
      <Accordion title="Spacing Scale" badge={String(Object.keys(scale).length)}>
        <RecordEditor entries={Object.entries(scale)} onSet={set} onRemove={remove} addPlaceholder="3xl" />
      </Accordion>
    </SectionShell>
  );
}

function ShapeSection({ config, update }: StudioSectionProps) {
  const radius = config.shape.radius ?? {};
  const focus = config.shape.focus;
  const set = (key: string, value: string) =>
    update(`shape.radius.${key}`, (cfg) => ({
      ...cfg,
      shape: { ...cfg.shape, radius: { ...cfg.shape.radius, [key]: value } },
    }));
  const remove = (key: string) =>
    update(`shape.radius.${key}`, (cfg) => {
      const r = { ...cfg.shape.radius };
      delete r[key];
      return { ...cfg, shape: { ...cfg.shape, radius: r } };
    });

  return (
    <SectionShell title="Shape" description="Corner radius scale and focus-ring geometry.">
      <Accordion title="Radius Scale" badge={String(Object.keys(radius).length)}>
        <RecordEditor entries={Object.entries(radius)} onSet={set} onRemove={remove} addPlaceholder="2xl" />
      </Accordion>
      <Accordion title="Focus Ring" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-3">
          <LabeledInput
            label="Width"
            value={focus.width}
            onChange={(v) => update("shape.focus.width", (cfg) => ({ ...cfg, shape: { ...cfg.shape, focus: { ...cfg.shape.focus, width: v } } }))}
            mono
          />
          <LabeledInput
            label="Color"
            value={focus.color}
            onChange={(v) => update("shape.focus.color", (cfg) => ({ ...cfg, shape: { ...cfg.shape, focus: { ...cfg.shape.focus, color: v } } }))}
            mono
          />
          <LabeledInput
            label="Offset"
            value={focus.offset}
            onChange={(v) => update("shape.focus.offset", (cfg) => ({ ...cfg, shape: { ...cfg.shape, focus: { ...cfg.shape.focus, offset: v } } }))}
            mono
          />
        </div>
      </Accordion>
    </SectionShell>
  );
}

function ElevationSection({ config, update }: StudioSectionProps) {
  const shadows = config.elevation.shadows ?? {};
  const set = (key: string, value: string) =>
    update(`elevation.shadows.${key}`, (cfg) => ({
      ...cfg,
      elevation: { shadows: { ...cfg.elevation.shadows, [key]: value } },
    }));
  const remove = (key: string) =>
    update(`elevation.shadows.${key}`, (cfg) => {
      const s = { ...cfg.elevation.shadows };
      delete s[key];
      return { ...cfg, elevation: { shadows: s } };
    });

  return (
    <SectionShell title="Elevation" description="Shadow scale compiled to --shadow-* variables.">
      <Accordion title="Shadow Scale" badge={String(Object.keys(shadows).length)}>
        <RecordEditor
          entries={Object.entries(shadows)}
          onSet={set}
          onRemove={remove}
          addPlaceholder="2xl"
          valueInput={(key, value) => <ShadowField label={key} value={value} onChange={(v) => set(key, v)} />}
        />
      </Accordion>
    </SectionShell>
  );
}

function MotionSection({ config, update }: StudioSectionProps) {
  const motion = config.motion;
  const reduced = (motion as { reduced?: boolean }).reduced ?? false;

  return (
    <SectionShell title="Motion" description="Transition duration, easing and reduced-motion behavior (blueprint §47).">
      <Accordion title="Transitions">
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="Duration"
            value={motion.duration}
            onChange={(v) => update("motion.duration", (cfg) => ({ ...cfg, motion: { ...cfg.motion, duration: v } }))}
            mono
          />
          <LabeledInput
            label="Easing"
            value={motion.easing}
            onChange={(v) => update("motion.easing", (cfg) => ({ ...cfg, motion: { ...cfg.motion, easing: v } }))}
            mono
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={reduced}
            onChange={(e) =>
              update("motion.reduced", (cfg) => ({
                ...cfg,
                motion: { ...cfg.motion, reduced: e.target.checked } as StudioThemeConfig["motion"],
              }))
            }
            className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
          />
          Respect reduced motion — disable transitions and animations
        </label>
      </Accordion>
    </SectionShell>
  );
}
