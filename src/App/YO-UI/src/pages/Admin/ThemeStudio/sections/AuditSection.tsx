import { useGetAuditQuery } from "../../../../redux/theme/themeStudioAPI";
import { SectionShell, type StudioSectionProps } from "../studioShared";

/**
 * Audit section (blueprint §83) — who changed what, when. Entries are written
 * by the backend on saves, status changes and publications.
 */
export function AuditSection({ guid }: StudioSectionProps) {
  const { data: entries = [], isLoading } = useGetAuditQuery(guid);

  return (
    <SectionShell
      title="Audit History"
      description="Configuration changes, lifecycle transitions and publications for this theme."
    >
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-gray-400">No audit entries yet.</p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <div
              key={entry.ThemeAuditLogId}
              className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-xs"
            >
              <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-gray-600">
                {entry.Action}
              </span>
              {entry.Section && <span className="text-gray-400">{entry.Section}</span>}
              {entry.PropertyPath && <code className="text-[10px] text-gray-500">{entry.PropertyPath}</code>}
              <span className="ml-auto text-[10px] text-gray-400">
                {new Date(entry.PerformedOn).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
