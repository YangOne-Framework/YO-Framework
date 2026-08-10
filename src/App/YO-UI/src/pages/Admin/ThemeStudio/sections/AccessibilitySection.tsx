import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { compileTheme } from "../../../../services/themeCompiler";
import type { StudioThemeConfig } from "../../../../types/yoThemeStudioTypes";
import type { ValidationItem } from "../../../../types/yoThemeStudioTypes";
import { Accordion, SectionShell, type StudioSectionProps } from "../studioShared";

const SEVERITY_ICON = {
  error: <XCircle size={14} className="shrink-0 text-red-500" />,
  warning: <AlertTriangle size={14} className="shrink-0 text-amber-500" />,
  info: <Info size={14} className="shrink-0 text-blue-500" />,
};

/**
 * Accessibility & validation section (blueprint §61, §84) — live, plain-language
 * validation results from the studio compiler with suggested fixes.
 */
export function AccessibilitySection({ config }: StudioSectionProps) {
  const compiled = useMemo(() => compileTheme(config ?? {} as StudioThemeConfig), [config]);
  const errors = compiled.validation.filter((v) => v.Severity === "error");
  const warnings = compiled.validation.filter((v) => v.Severity === "warning");

  const contrastItems = compiled.validation.filter((v) => v.Type === "accessibility");

  return (
    <SectionShell
      title="Accessibility & Validation"
      description="Live checks against the draft — contrast, dark-mode coverage, naming and references."
    >
      <div className="grid grid-cols-3 gap-3">
        <HealthCard
          label="Errors"
          value={errors.length}
          tone={errors.length ? "text-red-600" : "text-emerald-600"}
          icon={errors.length ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
        />
        <HealthCard
          label="Warnings"
          value={warnings.length}
          tone={warnings.length ? "text-amber-600" : "text-emerald-600"}
          icon={warnings.length ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        />
        <HealthCard
          label="Publish gate"
          value={compiled.success ? "Passing" : "Blocked"}
          tone={compiled.success ? "text-emerald-600" : "text-red-600"}
          icon={compiled.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          textValue
        />
      </div>

      <Accordion title="Contrast & Dark Mode" badge={String(contrastItems.length)}>
        {contrastItems.length === 0 ? (
          <p className="flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle2 size={14} /> All contrast checks pass and every color has a dark-mode value.
          </p>
        ) : (
          <ValidationList items={contrastItems} />
        )}
      </Accordion>

      <Accordion title="All Checks" badge={String(compiled.validation.length)} defaultOpen={false}>
        {compiled.validation.length === 0 ? (
          <p className="flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle2 size={14} /> No issues found in the current draft.
          </p>
        ) : (
          <ValidationList items={compiled.validation} />
        )}
      </Accordion>

      <Accordion title="Focus & Motion" defaultOpen={false}>
        <FocusMotionSummary config={config} />
      </Accordion>
    </SectionShell>
  );
}

function HealthCard({
  label,
  value,
  tone,
  icon,
  textValue,
}: {
  label: string;
  value: number | string;
  tone: string;
  icon: React.ReactNode;
  textValue?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <span className={tone}>{icon}</span>
      <div>
        <div className={`${textValue ? "text-sm" : "text-xl"} font-bold ${tone}`}>{value}</div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</div>
      </div>
    </div>
  );
}

function ValidationList({ items }: { items: ValidationItem[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((v, i) => (
        <div key={i} className="flex items-start gap-2.5 rounded-xl border border-gray-200/70 bg-white px-3 py-2">
          <span className="pt-0.5">{SEVERITY_ICON[v.Severity]}</span>
          <div className="min-w-0">
            <div className="text-xs text-gray-700">{v.Message}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium uppercase tracking-wider">{v.Type}</span>
              {v.PropertyPath && <code>{v.PropertyPath}</code>}
              {v.SuggestedFix && <span className="text-gray-500">Fix: {v.SuggestedFix}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FocusMotionSummary({ config }: { config: StudioSectionProps["config"] }) {
  const focus = config.shape.focus;
  const motion = config.motion;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
      <dt className="text-gray-400">Focus ring</dt>
      <dd className="font-mono text-gray-600">{focus.width} / {focus.offset}</dd>
      <dt className="text-gray-400">Transition</dt>
      <dd className="font-mono text-gray-600">{motion.duration} {motion.easing}</dd>
      <dt className="text-gray-400">Reduced motion</dt>
      <dd className="text-gray-600">{(motion as { reduced?: boolean }).reduced ? "Respected" : "Not configured"}</dd>
      <dt className="text-gray-400">Appearance</dt>
      <dd className="text-gray-600">{config.appearance.supportedModes.join(" + ")}</dd>
    </dl>
  );
}
