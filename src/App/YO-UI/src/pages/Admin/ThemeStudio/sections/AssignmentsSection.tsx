import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  useDeleteAssignmentMutation,
  useGetAssignmentsQuery,
  useSaveAssignmentMutation,
} from "../../../../redux/theme/themeStudioAPI";
import type { ThemeAssignment } from "../../../../types/yoThemeStudioTypes";
import { Accordion, LabeledInput, LabeledSelect, SectionShell, type StudioSectionProps } from "../studioShared";

const TARGET_TYPES = [
  { value: "global", label: "Global Default", needsKey: false },
  { value: "product", label: "Product", needsKey: true },
  { value: "application", label: "Application", needsKey: true },
  { value: "website", label: "Website", needsKey: true },
  { value: "portal", label: "Portal", needsKey: true },
  { value: "pagegroup", label: "Page Group", needsKey: true },
  { value: "route", label: "Route", needsKey: true },
  { value: "feature", label: "Feature", needsKey: true },
  { value: "campaign", label: "Campaign", needsKey: true },
] as const;

/**
 * Assignments section (blueprint §10) — bind this theme to applications,
 * websites, routes, features or campaigns with priority and schedule windows.
 */
export function AssignmentsSection({ guid }: StudioSectionProps) {
  const { data: assignments = [] } = useGetAssignmentsQuery(guid);
  const [saveAssignment] = useSaveAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [draft, setDraft] = useState<Partial<ThemeAssignment>>({
    TargetType: "application",
    Priority: 0,
    IsActive: true,
  });

  const targetType = TARGET_TYPES.find((t) => t.value === draft.TargetType) ?? TARGET_TYPES[1];

  return (
    <SectionShell
      title="Assignments"
      description="Where this theme applies. More specific targets win over broader ones; scheduled windows activate automatically."
    >
      <Accordion title="Current Assignments" badge={String(assignments.length)}>
        {assignments.length === 0 ? (
          <p className="text-xs text-gray-400">
            No assignments yet — this theme is not applied anywhere. Add one below, or set the theme as the platform default.
          </p>
        ) : (
          <div className="space-y-1.5">
            {assignments.map((a) => (
              <div key={a.ThemeAssignmentId} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white px-3 py-2">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                  {a.TargetType}
                </span>
                <code className="text-[11px] text-gray-600">{a.TargetKey ?? "—"}</code>
                {a.Priority !== 0 && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">+{a.Priority}</span>
                )}
                {a.IsDefault && (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">DEFAULT</span>
                )}
                {(a.ActiveFrom || a.ActiveTo) && (
                  <span className="text-[10px] text-gray-400">
                    {a.ActiveFrom ? new Date(a.ActiveFrom).toLocaleDateString() : "…"} → {a.ActiveTo ? new Date(a.ActiveTo).toLocaleDateString() : "…"}
                  </span>
                )}
                {!a.IsActive && <span className="text-[10px] text-gray-300">(disabled)</span>}
                <button
                  type="button"
                  onClick={() => deleteAssignment(a.ThemeAssignmentId)}
                  className="ml-auto rounded p-1 text-gray-300 transition hover:text-red-500"
                  title="Remove assignment"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      <Accordion title="Add Assignment" defaultOpen={assignments.length === 0}>
        <div className="grid grid-cols-2 gap-3">
          <LabeledSelect
            label="Target type"
            value={draft.TargetType ?? "application"}
            options={TARGET_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            onChange={(v) => setDraft({ ...draft, TargetType: v })}
          />
          {targetType.needsKey ? (
            <LabeledInput
              label={draft.TargetType === "route" || draft.TargetType === "pagegroup" ? "Route pattern" : "Target key"}
              value={draft.TargetKey ?? ""}
              onChange={(v) => setDraft({ ...draft, TargetKey: v })}
              placeholder={draft.TargetType === "route" ? "/offers/*" : draft.TargetType === "application" ? "public-travel-site" : "key"}
              mono
            />
          ) : (
            <div />
          )}
          <LabeledInput
            label="Priority"
            value={String(draft.Priority ?? 0)}
            onChange={(v) => setDraft({ ...draft, Priority: Number(v) || 0 })}
            mono
          />
          <div className="flex items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={draft.IsDefault ?? false}
                onChange={(e) => setDraft({ ...draft, IsDefault: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
              />
              Default for target
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={draft.IsActive ?? true}
                onChange={(e) => setDraft({ ...draft, IsActive: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
              />
              Active
            </label>
          </div>
          <LabeledInput
            label="Active from (UTC, optional)"
            value={draft.ActiveFrom ?? ""}
            onChange={(v) => setDraft({ ...draft, ActiveFrom: v || undefined })}
            placeholder="2026-12-20 00:00"
            mono
          />
          <LabeledInput
            label="Active to (UTC, optional)"
            value={draft.ActiveTo ?? ""}
            onChange={(v) => setDraft({ ...draft, ActiveTo: v || undefined })}
            placeholder="2026-12-31 23:59"
            mono
          />
        </div>
        <button
          type="button"
          disabled={targetType.needsKey && !draft.TargetKey}
          onClick={async () => {
            await saveAssignment({
              ...draft,
              YOThemeUniqueId: guid,
              TargetKey: targetType.needsKey ? draft.TargetKey : null,
            });
            setDraft({ TargetType: "application", Priority: 0, IsActive: true });
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-40"
        >
          <Plus size={12} /> Add assignment
        </button>
      </Accordion>
    </SectionShell>
  );
}
