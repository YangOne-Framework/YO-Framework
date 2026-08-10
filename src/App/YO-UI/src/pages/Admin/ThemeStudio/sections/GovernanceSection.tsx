import { useState } from "react";
import { Check, CircleAlert, HeartPulse, MessageSquare, Reply, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  useAddThemeCommentMutation,
  useGetApprovalsQuery,
  useGetThemeCommentsQuery,
  useGetThemeHealthQuery,
  useResolveThemeCommentMutation,
  useReviewThemeMutation,
} from "../../../../redux/theme/themeStudioAPI";
import type { ThemeStatus } from "../../../../types/yoThemeStudioTypes";
import { SectionShell, type StudioSectionProps } from "../studioShared";

interface GovernanceSectionProps extends StudioSectionProps {
  onStatusChanged: (status: ThemeStatus) => void;
}

export function GovernanceSection({ guid, onStatusChanged }: GovernanceSectionProps) {
  const [approvalType, setApprovalType] = useState("technical");
  const [remarks, setRemarks] = useState("");
  const [section, setSection] = useState("");
  const [propertyPath, setPropertyPath] = useState("");
  const [comment, setComment] = useState("");
  const [includeResolved, setIncludeResolved] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const { data: approvals = [], isLoading: approvalsLoading } = useGetApprovalsQuery(guid);
  const { data: comments = [], isLoading: commentsLoading } = useGetThemeCommentsQuery({ theme: guid, includeResolved });
  const { data: health } = useGetThemeHealthQuery(guid);
  const [reviewTheme, { isLoading: reviewing }] = useReviewThemeMutation();
  const [addComment, { isLoading: addingComment }] = useAddThemeCommentMutation();
  const [resolveComment] = useResolveThemeCommentMutation();

  const review = async (status: "approved" | "rejected" | "changes_requested") => {
    try {
      await reviewTheme({ YOThemeUniqueId: guid, ApprovalType: approvalType, Status: status, Remarks: remarks || undefined }).unwrap();
      onStatusChanged(status === "approved" ? "approved" : "draft");
      setRemarks("");
      toast.success(status === "approved" ? "Theme approved" : status === "rejected" ? "Theme rejected" : "Changes requested");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Review could not be saved");
    }
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment({
        YOThemeUniqueId: guid,
        Section: section || undefined,
        PropertyPath: propertyPath || undefined,
        Comment: comment.trim(),
        ParentCommentId: replyTo,
      }).unwrap();
      setComment("");
      setReplyTo(null);
      toast.success("Comment added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Comment could not be added");
    }
  };

  return (
    <SectionShell title="Review & Governance" description="Approval decisions, review comments and release readiness for this theme.">
      {health && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HealthCard label="Health score" value={`${health.Score}/100`} tone={health.Score >= 80 ? "good" : "warn"} />
          <HealthCard label="Validation" value={`${health.ErrorCount} errors · ${health.WarningCount} warnings`} tone={health.ErrorCount ? "bad" : "good"} />
          <HealthCard label="Dark mode" value={`${Math.round(health.DarkModeCoverage)}%`} tone={health.DarkModeCoverage >= 80 ? "good" : "warn"} />
          <HealthCard label="Components" value={`${Math.round(health.ComponentCoverage)}%`} tone={health.ComponentCoverage >= 80 ? "good" : "warn"} />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block w-44">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">Review discipline</span>
            <select value={approvalType} onChange={(e) => setApprovalType(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400">
              <option value="technical">Technical</option>
              <option value="brand">Brand</option>
              <option value="accessibility">Accessibility</option>
            </select>
          </label>
          <label className="min-w-64 flex-1">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">Decision remarks</span>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional review rationale" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400" />
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={reviewing} onClick={() => review("approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Check size={13} /> Approve</button>
            <button type="button" disabled={reviewing} onClick={() => review("changes_requested")} className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><CircleAlert size={13} /> Request changes</button>
            <button type="button" disabled={reviewing} onClick={() => review("rejected")} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"><X size={13} /> Reject</button>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Decision history</p>
          {approvalsLoading ? <p className="text-xs text-gray-400">Loading…</p> : approvals.length === 0 ? <p className="text-xs text-gray-400">No review decisions yet.</p> : (
            <div className="space-y-2">
              {approvals.map((approval) => (
                <div key={approval.ThemeApprovalId} className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2 text-xs">
                  <span className="rounded-md bg-white px-2 py-0.5 font-semibold text-gray-600">{approval.ApprovalType}</span>
                  <span className={approval.Status === "approved" ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{approval.Status.replace(/_/g, " ")}</span>
                  {approval.Remarks && <span className="text-gray-500">{approval.Remarks}</span>}
                  <span className="ml-auto whitespace-nowrap text-[10px] text-gray-400">{new Date(approval.ReviewedOn ?? approval.AddedOn).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-indigo-500" />
          <h3 className="text-xs font-semibold text-gray-700">Review comments</h3>
          <label className="ml-auto flex items-center gap-2 text-[11px] text-gray-500"><input type="checkbox" checked={includeResolved} onChange={(e) => setIncludeResolved(e.target.checked)} /> Include resolved</label>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section (for example, colors)" className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400" />
          <input value={propertyPath} onChange={(e) => setPropertyPath(e.target.value)} placeholder="Token/property path (optional)" className="rounded-xl border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-indigo-400" />
        </div>
        {replyTo && <p className="mt-2 text-[10px] text-indigo-600">Replying to comment #{replyTo} <button type="button" onClick={() => setReplyTo(null)} className="ml-1 underline">cancel</button></p>}
        <div className="mt-2 flex gap-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Add review feedback…" className="min-w-0 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400" />
          <button type="button" disabled={!comment.trim() || addingComment} onClick={submitComment} className="self-end rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Add</button>
        </div>
        <div className="mt-4 space-y-2">
          {commentsLoading ? <p className="text-xs text-gray-400">Loading…</p> : comments.length === 0 ? <p className="text-xs text-gray-400">No open comments.</p> : comments.map((entry) => (
            <div key={entry.ThemeCommentId} className={`rounded-xl border px-3 py-2 ${entry.IsResolved ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>#{entry.ThemeCommentId}</span>
                {entry.ParentCommentId && <span>reply to #{entry.ParentCommentId}</span>}
                {entry.Section && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-600">{entry.Section}</span>}
                {entry.PropertyPath && <code>{entry.PropertyPath}</code>}
                <span className="ml-auto">{new Date(entry.AddedOn).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs text-gray-700">{entry.Comment}</p>
              {!entry.IsResolved && <div className="mt-2 flex gap-3 text-[10px]"><button type="button" onClick={() => setReplyTo(entry.ThemeCommentId)} className="inline-flex items-center gap-1 text-indigo-600"><Reply size={11} /> Reply</button><button type="button" onClick={() => resolveComment(entry.ThemeCommentId)} className="text-emerald-600">Resolve</button></div>}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function HealthCard({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "bad" }) {
  const tones = { good: "border-emerald-200 bg-emerald-50 text-emerald-700", warn: "border-amber-200 bg-amber-50 text-amber-700", bad: "border-red-200 bg-red-50 text-red-700" };
  return <div className={`rounded-xl border p-3 ${tones[tone]}`}><div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><HeartPulse size={12} /> {label}</div><p className="mt-1 text-sm font-bold">{value}</p></div>;
}
