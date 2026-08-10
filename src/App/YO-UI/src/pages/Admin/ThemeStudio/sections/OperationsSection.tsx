import { useState } from "react";
import { Activity, Beaker, Blocks, CheckCircle2, Play, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  useBulkEditThemeTokensMutation,
  useDeleteThemeFixtureMutation,
  useDeleteThemeIntegrationMutation,
  useGetThemeAnalyticsQuery,
  useGetThemeExperimentsQuery,
  useGetThemeFixturesQuery,
  useGetThemeIntegrationsQuery,
  useGetThemeReadinessQuery,
  useSaveThemeExperimentMutation,
  useSaveThemeFixtureMutation,
  useSaveThemeIntegrationMutation,
  useSetThemeExperimentStatusMutation,
} from "../../../../redux/theme/themeStudioAPI";
import type { ThemeExperiment, ThemeIntegration } from "../../../../types/yoThemeStudioTypes";
import { Accordion, SectionShell, type StudioSectionProps } from "../studioShared";

const scenarios = ["normal", "empty", "loading", "error", "long-content", "rtl"];
const integrationTypes: ThemeIntegration["IntegrationType"][] = ["figma", "storybook", "ci", "ai", "marketplace", "analytics"];

export function OperationsSection({ guid }: StudioSectionProps) {
  const { data: readiness } = useGetThemeReadinessQuery(guid);
  const { data: analytics } = useGetThemeAnalyticsQuery(guid);
  const { data: experiments = [] } = useGetThemeExperimentsQuery();
  const { data: fixtures = [] } = useGetThemeFixturesQuery(undefined);
  const { data: integrations = [] } = useGetThemeIntegrationsQuery(guid);
  const [saveExperiment] = useSaveThemeExperimentMutation();
  const [setExperimentStatus] = useSetThemeExperimentStatusMutation();
  const [saveFixture] = useSaveThemeFixtureMutation();
  const [deleteFixture] = useDeleteThemeFixtureMutation();
  const [saveIntegration] = useSaveThemeIntegrationMutation();
  const [deleteIntegration] = useDeleteThemeIntegrationMutation();
  const [bulkEdit] = useBulkEditThemeTokensMutation();

  const [experiment, setExperiment] = useState({ Name: "", TargetType: "route", TargetKey: "", SuccessMetric: "conversion", ConfigurationJson: '{"variants":[]}' });
  const [fixture, setFixture] = useState({ ApplicationKey: "default", Name: "", Scenario: "normal", FixtureJson: "{}" });
  const [integration, setIntegration] = useState<{ IntegrationType: ThemeIntegration["IntegrationType"]; ExternalReference: string; ConfigurationJson: string }>({ IntegrationType: "figma", ExternalReference: "", ConfigurationJson: "{}" });
  const [bulkText, setBulkText] = useState("");

  const run = async (action: () => Promise<unknown>, message: string) => {
    try { await action(); toast.success(message); } catch (error) { toast.error(error instanceof Error ? error.message : "Operation failed"); }
  };

  const saveBulk = () => {
    const values: Record<string, string> = {};
    for (const line of bulkText.split("\n").filter(Boolean)) {
      const separator = line.indexOf("=");
      if (separator < 1) { toast.error(`Invalid bulk edit line: ${line}`); return; }
      values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
    run(() => bulkEdit({ YOThemeUniqueId: guid, Values: values }).unwrap(), "Bulk token changes saved");
  };

  return (
    <SectionShell title="Operations & Ecosystem" description="Release readiness, experiments, real-content fixtures, analytics, provider configuration and controlled bulk changes.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Readiness" value={readiness ? `${readiness.Score}/100` : "—"} good={readiness?.Ready} />
        <Metric label="Analytics events" value={String(analytics?.TotalEvents ?? 0)} />
        <Metric label="Running experiments" value={String(analytics?.ActiveExperiments ?? 0)} />
        <Metric label="Active fixtures" value={String(readiness?.ActiveFixtureCount ?? 0)} />
      </div>

      <Accordion title="Publishing readiness" badge={readiness?.Ready ? "Ready" : `${readiness?.Blockers.length ?? 0} blockers`}>
        {!readiness ? <p className="text-xs text-gray-400">Loading…</p> : <div className="grid gap-3 md:grid-cols-2"><IssueList title="Blockers" items={readiness.Blockers} empty="No publishing blockers" danger /><IssueList title="Warnings" items={readiness.Warnings} empty="No release warnings" /></div>}
      </Accordion>

      <Accordion title="A/B experiments" badge={String(experiments.length)} defaultOpen={false}>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          <Input value={experiment.Name} onChange={(Name) => setExperiment({ ...experiment, Name })} placeholder="Experiment name" />
          <Input value={experiment.TargetType} onChange={(TargetType) => setExperiment({ ...experiment, TargetType })} placeholder="route" />
          <Input value={experiment.TargetKey} onChange={(TargetKey) => setExperiment({ ...experiment, TargetKey })} placeholder="/checkout" />
          <Input value={experiment.SuccessMetric} onChange={(SuccessMetric) => setExperiment({ ...experiment, SuccessMetric })} placeholder="conversion" />
          <button type="button" disabled={!experiment.Name} onClick={() => run(() => saveExperiment({ ...experiment, Status: "draft" }).unwrap(), "Experiment created")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"><Plus size={12} /> Add</button>
        </div>
        <textarea value={experiment.ConfigurationJson} onChange={(e) => setExperiment({ ...experiment, ConfigurationJson: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-gray-200 p-2 font-mono text-[11px]" />
        <div className="mt-3 space-y-2">{experiments.map((item) => <ExperimentRow key={item.ThemeExperimentId} item={item} setStatus={(status) => run(() => setExperimentStatus({ id: item.ThemeExperimentId, status }).unwrap(), `Experiment ${status}`)} />)}</div>
      </Accordion>

      <Accordion title="Real-content fixtures" badge={String(fixtures.length)} defaultOpen={false}>
        <div className="grid gap-2 md:grid-cols-4">
          <Input value={fixture.ApplicationKey} onChange={(ApplicationKey) => setFixture({ ...fixture, ApplicationKey })} placeholder="application" />
          <Input value={fixture.Name} onChange={(Name) => setFixture({ ...fixture, Name })} placeholder="Fixture name" />
          <select value={fixture.Scenario} onChange={(e) => setFixture({ ...fixture, Scenario: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">{scenarios.map((scenario) => <option key={scenario}>{scenario}</option>)}</select>
          <button type="button" disabled={!fixture.Name} onClick={() => run(() => saveFixture({ ...fixture, IsActive: true }).unwrap(), "Fixture saved")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"><Plus size={12} /> Add</button>
        </div>
        <textarea value={fixture.FixtureJson} onChange={(e) => setFixture({ ...fixture, FixtureJson: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-gray-200 p-2 font-mono text-[11px]" />
        <div className="mt-3 space-y-2">{fixtures.map((item) => <div key={item.ThemeFixtureId} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600"><Blocks size={13} className="text-indigo-500" /><span className="font-semibold">{item.Name}</span><code>{item.ApplicationKey}</code><span>{item.Scenario}</span><button type="button" onClick={() => deleteFixture(item.ThemeFixtureId)} className="ml-auto text-red-500"><Trash2 size={12} /></button></div>)}</div>
      </Accordion>

      <Accordion title="External provider boundaries" badge={String(integrations.length)} defaultOpen={false}>
        <p className="mb-3 text-[11px] text-gray-400">Stores non-secret provider references and JSON settings. OAuth tokens, API keys, webhooks and hosted services must be configured server-side before sync actions are implemented.</p>
        <div className="grid gap-2 md:grid-cols-4">
          <select value={integration.IntegrationType} onChange={(e) => setIntegration({ ...integration, IntegrationType: e.target.value as ThemeIntegration["IntegrationType"] })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">{integrationTypes.map((type) => <option key={type}>{type}</option>)}</select>
          <Input value={integration.ExternalReference} onChange={(ExternalReference) => setIntegration({ ...integration, ExternalReference })} placeholder="External file/project reference" />
          <Input value={integration.ConfigurationJson} onChange={(ConfigurationJson) => setIntegration({ ...integration, ConfigurationJson })} placeholder="{}" />
          <button type="button" onClick={() => run(() => saveIntegration({ YOThemeUniqueId: guid, ...integration, IsEnabled: true }).unwrap(), "Integration configured")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"><Settings2 size={12} /> Configure</button>
        </div>
        <div className="mt-3 space-y-2">{integrations.map((item) => <div key={item.ThemeIntegrationId} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600"><Settings2 size={13} className="text-indigo-500" /><span className="font-semibold">{item.IntegrationType}</span><code>{item.ExternalReference || "not linked"}</code><span>{item.IsEnabled ? "enabled" : "disabled"}</span><button type="button" onClick={() => deleteIntegration(item.ThemeIntegrationId)} className="ml-auto text-red-500"><Trash2 size={12} /></button></div>)}</div>
      </Accordion>

      <Accordion title="Safe bulk token edit" defaultOpen={false}>
        <p className="text-[11px] text-gray-400">One existing token path per line. Only primitive, semantic and component token values are accepted; references are replaced by explicit values.</p>
        <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={5} placeholder={"tokens.primitive.color.brand.primary=#2563eb\ntokens.semantic.color.action.primary=#2563eb"} className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-mono text-[11px]" />
        <button type="button" disabled={!bulkText.trim()} onClick={saveBulk} className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"><Activity size={12} /> Apply atomically</button>
      </Accordion>
    </SectionShell>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) { return <div className={`rounded-xl border p-3 ${good ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}><p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-lg font-bold text-gray-700">{value}</p></div>; }
function IssueList({ title, items, empty, danger }: { title: string; items: string[]; empty: string; danger?: boolean }) { return <div><p className="mb-2 text-xs font-semibold text-gray-600">{title}</p>{items.length ? items.map((item) => <p key={item} className={`mb-1 rounded-lg px-2 py-1.5 text-[11px] ${danger ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{item}</p>) : <p className="flex items-center gap-1 text-[11px] text-emerald-600"><CheckCircle2 size={12} /> {empty}</p>}</div>; }
function Input({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />; }
function ExperimentRow({ item, setStatus }: { item: ThemeExperiment; setStatus: (status: ThemeExperiment["Status"]) => void }) { return <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600"><Beaker size={13} className="text-indigo-500" /><span className="font-semibold">{item.Name}</span><code>{item.TargetType}:{item.TargetKey || "all"}</code><span className="uppercase">{item.Status}</span><div className="ml-auto flex gap-2">{item.Status !== "running" && <button type="button" onClick={() => setStatus("running")} className="text-emerald-600"><Play size={12} /></button>}{item.Status === "running" && <button type="button" onClick={() => setStatus("stopped")} className="text-amber-600">Stop</button>}</div></div>; }
