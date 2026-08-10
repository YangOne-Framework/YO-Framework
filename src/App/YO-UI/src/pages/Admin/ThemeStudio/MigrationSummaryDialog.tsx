import { ArrowRight, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { Modal } from "../../../components/ui/modal";
import type { MigrationSummary } from "../../../types/yoThemeStudioTypes";

/**
 * Migration summary dialog (blueprint §14) — shown when a legacy flat-token
 * theme is opened in the studio and converted to the three-level architecture.
 */
export function MigrationSummaryDialog({
  summary,
  onClose,
}: {
  summary: MigrationSummary;
  onClose: () => void;
}) {
  return (
    <Modal isOpen onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ArrowRight size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Theme migrated to the new token architecture</h3>
            <p className="text-xs text-gray-500">
              {summary.recognizedTokens} legacy tokens were converted into the three-level structure. Nothing was lost.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 text-xs">
          <SummaryRow
            icon={<CheckCircle2 size={13} className="text-emerald-500" />}
            label="Primitive tokens generated"
            value={`${summary.generatedPrimitives.length}`}
            detail={summary.generatedPrimitives.slice(0, 6).join(", ") + (summary.generatedPrimitives.length > 6 ? "…" : "")}
          />
          <SummaryRow
            icon={<CheckCircle2 size={13} className="text-emerald-500" />}
            label="Semantic mappings"
            value={`${summary.generatedSemanticMappings.length}`}
            detail={summary.generatedSemanticMappings.slice(0, 4).join(", ") + (summary.generatedSemanticMappings.length > 4 ? "…" : "")}
          />
          <SummaryRow
            icon={<CheckCircle2 size={13} className="text-emerald-500" />}
            label="Component tokens"
            value={`${summary.componentMappings.length}`}
          />
          {summary.missingDarkModeValues.length > 0 && (
            <SummaryRow
              icon={<AlertTriangle size={13} className="text-amber-500" />}
              label="Missing dark-mode values"
              value={`${summary.missingDarkModeValues.length}`}
              detail="Use “Fill dark values” in the Colors section to derive them automatically."
            />
          )}
          {summary.unknownFieldsPreserved.length > 0 && (
            <SummaryRow
              icon={<Info size={13} className="text-blue-500" />}
              label="Unknown fields preserved"
              value={`${summary.unknownFieldsPreserved.length}`}
              detail={summary.unknownFieldsPreserved.join(", ")}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          Continue editing
        </button>
      </div>
    </Modal>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-gray-200/70 bg-white px-3 py-2.5">
      <span className="pt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">{value}</span>
        </div>
        {detail && <p className="mt-0.5 text-[11px] text-gray-400">{detail}</p>}
      </div>
    </div>
  );
}
