import { useMemo, useState } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  useCheckThemeScheduleConflictsMutation,
  useDeleteThemeScheduleMutation,
  useGetAssignmentsQuery,
  useGetThemeSchedulesQuery,
  useSaveThemeScheduleMutation,
} from "../../../../redux/theme/themeStudioAPI";
import { SectionShell, type StudioSectionProps } from "../studioShared";

export function SchedulingSection({ guid }: StudioSectionProps) {
  const [assignmentId, setAssignmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: schedules = [], isLoading } = useGetThemeSchedulesQuery(guid);
  const { data: assignments = [] } = useGetAssignmentsQuery(guid);
  const [saveSchedule, { isLoading: saving }] = useSaveThemeScheduleMutation();
  const [deleteSchedule] = useDeleteThemeScheduleMutation();
  const [checkConflicts, { data: conflicts = [], isLoading: checking }] = useCheckThemeScheduleConflictsMutation();

  const request = useMemo(() => ({
    YOThemeUniqueId: guid,
    ThemeAssignmentId: assignmentId ? Number(assignmentId) : null,
    StartDate: startDate ? new Date(startDate).toISOString() : "",
    EndDate: endDate ? new Date(endDate).toISOString() : null,
  }), [assignmentId, endDate, guid, startDate]);

  const validate = async () => {
    if (!startDate) return [];
    return await checkConflicts(request).unwrap();
  };

  const create = async () => {
    if (!startDate) return;
    try {
      const found = await validate();
      if (found.length) {
        toast.error("Resolve the overlapping schedule before saving");
        return;
      }
      await saveSchedule(request).unwrap();
      setStartDate("");
      setEndDate("");
      toast.success("Theme activation scheduled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Schedule could not be saved");
    }
  };

  return (
    <SectionShell title="Release Scheduling" description="Activate a published theme globally or for an existing assignment during a controlled window.">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">Assignment</span>
            <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400">
              <option value="">Global activation</option>
              {assignments.map((assignment) => <option key={assignment.ThemeAssignmentId} value={assignment.ThemeAssignmentId}>{assignment.TargetType}: {assignment.TargetKey || "default"}</option>)}
            </select>
          </label>
          <DateInput label="Start" value={startDate} onChange={setStartDate} />
          <DateInput label="End (optional)" value={endDate} onChange={setEndDate} />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" disabled={!startDate || checking} onClick={validate} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 disabled:opacity-40">Check conflicts</button>
          <button type="button" disabled={!startDate || saving} onClick={create} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><CalendarClock size={13} /> Schedule</button>
        </div>
        {conflicts.length > 0 && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3"><p className="text-xs font-semibold text-red-700">Overlapping schedule detected</p>{conflicts.map((conflict) => <p key={conflict.ThemeScheduleId} className="mt-1 text-[11px] text-red-600">{conflict.ThemeName}: {new Date(conflict.StartDate).toLocaleString()} – {conflict.EndDate ? new Date(conflict.EndDate).toLocaleString() : "open ended"}. {conflict.Reason}</p>)}</div>}
      </div>

      <div className="space-y-2">
        {isLoading ? <p className="text-xs text-gray-400">Loading…</p> : schedules.length === 0 ? <p className="text-xs text-gray-400">No release schedules for this theme.</p> : schedules.map((schedule) => (
          <div key={schedule.ThemeScheduleId} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 text-xs shadow-sm">
            <CalendarClock size={15} className="text-indigo-500" />
            <div><p className="font-semibold text-gray-700">{schedule.TargetType ? `${schedule.TargetType}: ${schedule.TargetKey || "default"}` : "Global activation"}</p><p className="text-[10px] text-gray-400">{new Date(schedule.StartDate).toLocaleString()} – {schedule.EndDate ? new Date(schedule.EndDate).toLocaleString() : "open ended"}</p></div>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-600">{schedule.Status}</span>
            {(schedule.Status === "scheduled" || schedule.Status === "active") && <button type="button" onClick={() => deleteSchedule(schedule.ThemeScheduleId)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Cancel schedule"><Trash2 size={13} /></button>}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</span><input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400" /></label>;
}
