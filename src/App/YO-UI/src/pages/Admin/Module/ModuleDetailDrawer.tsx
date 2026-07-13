import { useState } from "react";
import { MdUpdate, MdUndo, MdDeleteOutline, MdPlayArrow, MdStop, MdRefresh, MdFiberManualRecord, MdClose, MdInfoOutline, MdHistory, MdCheckCircle, MdErrorOutline, MdWarningAmber, MdCode, MdCalendarToday, MdFolderOpen, MdExtension } from "react-icons/md";
import { Modal } from "../../../components/ui/modal";
import { ModuleInfo, ModuleOperationJournal } from "../../../types/moduleTypes";
import { useLazyGetModuleJournalQuery, usePingModuleMutation } from "../../../redux/setting/moduleAPI";

interface ModuleDetailDrawerProps {
  module: ModuleInfo | null;
  onClose: () => void;
  onAction: (action: string, module: ModuleInfo, extra?: any) => void;
}

const lifecyleBadge = (state: string) => {
  const s = state?.toLowerCase() || "";
  let colorClass = "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300";
  if (s === "enabled")
    colorClass = "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  else if (s === "disabled" || s === "installeddisabled")
    colorClass = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  else if (s === "failed")
    colorClass = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === "enabled" ? "bg-green-500" : s === "disabled" || s === "installeddisabled" ? "bg-gray-400" : s === "failed" ? "bg-red-500" : "bg-brand-500"}`} />
      {state || "N/A"}
    </span>
  );
};

const runtimeBadge = (state: string) => {
  const s = state?.toLowerCase() || "";
  let colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  if (s === "loaded")
    colorClass = "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  else if (s === "stopped" || s === "notloaded")
    colorClass = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  else if (s === "faulted")
    colorClass = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === "loaded" ? "bg-green-500" : s === "stopped" || s === "notloaded" ? "bg-gray-400" : s === "faulted" ? "bg-red-500" : "bg-blue-500"}`} />
      {state || "N/A"}
    </span>
  );
};

const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
      <Icon size={15} className="text-gray-500 dark:text-gray-400" />
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">{title}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const DetailRow = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className={`flex justify-between items-start gap-4 py-1.5 text-sm ${className}`}>
    <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    <span className="text-gray-800 dark:text-white/90 font-medium text-right break-words max-w-[60%]">{value || "-"}</span>
  </div>
);

const ModuleDetailDrawer = ({ module, onClose, onAction }: ModuleDetailDrawerProps) => {
  const [activeSection, setActiveSection] = useState<"info" | "journal">("info");
  const [getJournal, { data: journalData, isLoading: journalLoading }] = useLazyGetModuleJournalQuery();
  const [pingModule, { isLoading: pingLoading }] = usePingModuleMutation();
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);

  const isOpen = !!module;
  if (!module) return null;

  const journal: ModuleOperationJournal[] = journalData?.Data || journalData || [];
  const manifest = (() => {
    try {
      return module.ManifestJson ? JSON.parse(module.ManifestJson) : null;
    } catch {
      return null;
    }
  })();

  const state = module.LifecycleState?.toLowerCase() || "";
  const isPackage = !module.IsBuiltIn;
  const isInstalled = module.IsInstalled;
  const isEnabled = state === "enabled";
  const isDisabled = state === "disabled" || state === "installeddisabled";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                {module.DisplayName || module.Name}
              </h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${module.IsBuiltIn ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
                <MdExtension size={12} />
                {module.IsBuiltIn ? "Built-in" : "Package"}
              </span>
            </div>
            {module.Description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{module.Description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {lifecyleBadge(module.LifecycleState)}
              {runtimeBadge(module.RuntimeState)}
              {module.IsRestartRequired && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                  <MdWarningAmber size={12} />
                  Restart Required
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <MdClose size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveSection("info")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === "info"
                ? "text-primary border-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-transparent"
            }`}
          >
            <MdInfoOutline size={16} />
            Info
          </button>
          <button
            onClick={() => {
              setActiveSection("journal");
              getJournal({ moduleName: module.Name, count: 20 });
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === "journal"
                ? "text-primary border-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-transparent"
            }`}
          >
            <MdHistory size={16} />
            Operation Journal
          </button>
        </div>

        <div className="max-h-[28rem] overflow-y-auto">
          {activeSection === "info" && (
            <div className="space-y-5 pt-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {isDisabled && isInstalled && (
                    <button onClick={() => { onAction("enable", module); onClose(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 transition-colors">
                      <MdPlayArrow size={16} /> Enable
                    </button>
                  )}
                  {isEnabled && (
                    <button onClick={() => { onAction("disable", module); onClose(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors">
                      <MdStop size={16} /> Disable
                    </button>
                  )}
                  {isInstalled && (
                    <button onClick={async () => {
                        setPingResult(null);
                        try {
                          const res = await pingModule({ moduleName: module.ModuleKey || module.Name }).unwrap();
                          setPingResult({ success: true, message: res?.Data?.Message || "Module is healthy." });
                        } catch (err: any) {
                          setPingResult({ success: false, message: err?.data?.Message || "Ping failed." });
                        }
                      }}
                      disabled={pingLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-strokedark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                      <MdFiberManualRecord size={14} className={pingLoading ? "animate-pulse text-green-500" : ""} />
                      {pingLoading ? "Pinging..." : "Ping"}
                    </button>
                  )}
                  {isEnabled && module.StagedVersion && (
                    <button onClick={() => { onAction("upgrade", module, { version: module.StagedVersion }); onClose(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors">
                      <MdUpdate size={16} /> Upgrade
                    </button>
                  )}
                  {isInstalled && (
                    <button onClick={() => { onAction("rollback", module); onClose(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-yellow-500 hover:bg-yellow-600 transition-colors">
                      <MdUndo size={16} /> Rollback
                    </button>
                  )}
                  {isPackage && isInstalled && (
                    <button onClick={() => { onAction("uninstall", module, { purgeData: false }); onClose(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors">
                      <MdDeleteOutline size={16} /> Uninstall
                    </button>
                  )}
                </div>
                {pingResult && (
                  <div className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${pingResult.success ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}>
                    {pingResult.success ? <MdCheckCircle size={16} /> : <MdErrorOutline size={16} />}
                    {pingResult.message}
                  </div>
                )}
              </div>

                <SectionCard title="General" icon={MdInfoOutline}>
                <DetailRow label="Module Key" value={module.ModuleKey || module.Name} />
                <DetailRow label="Display Name" value={module.DisplayName} />
                <DetailRow label="Author" value={module.Author} />
                <DetailRow label="Type" value={module.IsBuiltIn ? "Built-in" : "Package"} />
                <DetailRow label="Installed" value={module.IsInstalled ? "Yes" : "No"} />
                <DetailRow label="Active" value={module.IsActive ? "Yes" : "No"} />
              </SectionCard>

              <SectionCard title="Versions" icon={MdCode}>
                <DetailRow label="Version" value={module.Version} />
                <DetailRow label="Active Version" value={module.ActiveVersion} />
                <DetailRow label="Staged Version" value={module.StagedVersion} />
                {manifest && <DetailRow label="CMS Min Version" value={manifest.CmsMinimumVersion} />}
                {manifest && <DetailRow label="CMS Max Version" value={manifest.CmsMaximumVersion} />}
              </SectionCard>

              <SectionCard title="Operations" icon={MdRefresh}>
                <DetailRow label="Last Operation" value={module.LastOperation} />
                <DetailRow label="Last Error" value={module.LastError} />
                <DetailRow label="Restart Required" value={module.IsRestartRequired ? "Yes" : "No"} />
              </SectionCard>

              <SectionCard title="Dates" icon={MdCalendarToday}>
                <DetailRow label="Added On" value={module.AddedOn ? new Date(module.AddedOn).toLocaleString() : "-"} />
                <DetailRow label="Updated On" value={module.UpdatedOn ? new Date(module.UpdatedOn).toLocaleString() : "-"} />
              </SectionCard>

              <SectionCard title="Paths" icon={MdFolderOpen}>
                <DetailRow label="Package Path" value={module.PackagePath} />
                {manifest && <DetailRow label="Entry Assembly" value={manifest.EntryAssembly} />}
                {manifest && <DetailRow label="API Route Prefix" value={manifest.ApiRoutePrefix} />}
                {manifest && <DetailRow label="React Entry" value={manifest.ReactEntryPoint} />}
              </SectionCard>

              {manifest?.Dependencies?.length > 0 && (
                <SectionCard title="Dependencies" icon={MdCode}>
                  {manifest.Dependencies.map((dep: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-800 dark:text-white/90 font-medium">{dep.ModuleId}</span>
                      <span className="text-gray-500 text-xs">
                        {dep.MinimumVersion || "any"} - {dep.MaximumVersion || "any"}
                        <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${dep.Required ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300" : "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {dep.Required ? "Required" : "Optional"}
                        </span>
                      </span>
                    </div>
                  ))}
                </SectionCard>
              )}

              {manifest?.Menus?.length > 0 && (
                <SectionCard title="Menu Entries" icon={MdInfoOutline}>
                  {manifest.Menus.map((menu: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-800 dark:text-white/90">{menu.Title}</span>
                      <span className="text-gray-500 text-xs font-mono">{menu.Url}</span>
                    </div>
                  ))}
                </SectionCard>
              )}

              {manifest?.Permissions?.length > 0 && (
                <SectionCard title="Permissions" icon={MdWarningAmber}>
                  <div className="flex flex-wrap gap-1.5">
                    {manifest.Permissions.map((p: string, i: number) => (
                      <span key={i} className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {activeSection === "journal" && (
            <div className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Recent Operations</p>
                <button onClick={() => getJournal({ moduleName: module.Name, count: 20 })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-strokedark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <MdRefresh size={14} /> Refresh
                </button>
              </div>
              {journalLoading && (
                <div className="flex items-center justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                </div>
              )}
              {!journalLoading && journal.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <MdHistory size={32} className="mb-2" />
                  <span className="text-sm">No journal entries found</span>
                </div>
              )}
              {!journalLoading && journal.length > 0 && (
                <div className="space-y-3">
                  {journal.map((entry) => {
                    const status = entry.OperationStatus?.toLowerCase() || "";
                    const StatusIcon = status === "succeeded" ? MdCheckCircle : status === "failed" ? MdErrorOutline : MdWarningAmber;
                    const badgeClass = status === "succeeded"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : status === "failed"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
                    return (
                      <div key={entry.ModuleOperationJournalId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <StatusIcon size={14} className={status === "succeeded" ? "text-green-600" : status === "failed" ? "text-red-600" : "text-yellow-600"} />
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                              {entry.OperationType}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {entry.StartedOn ? new Date(entry.StartedOn).toLocaleString() : ""}
                          </span>
                        </div>
                        <div className="px-4 py-3 space-y-1.5">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{entry.Message}</p>
                          {entry.ErrorJson && (
                            <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 rounded px-2 py-1" title={entry.ErrorJson}>
                              <MdErrorOutline size={12} />
                              {entry.ErrorJson}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                            <span className="inline-flex items-center gap-1">
                              <MdCheckCircle size={11} /> {entry.OperationStatus}
                            </span>
                            <span>v{entry.ModuleVersion}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-5">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModuleDetailDrawer;
