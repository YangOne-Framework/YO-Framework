import { useTranslation } from "react-i18next";
import { Modal } from "../../../components/ui/modal";
import { useGetLoginHistoryQuery } from "../../../redux/user/userAPI";

interface LoginHistoryModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
}

const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({ isOpen, user, onClose }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetLoginHistoryQuery(user?.IdentityUserId, { skip: !user || !isOpen });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{t("LoginHistory.Title")}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {t("LoginHistory.Description")} <span className="font-medium text-gray-700 dark:text-gray-300">{user?.FirstName} {user?.LastName}</span>
        </p>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
          </div>
        )}

        {!isLoading && data?.Data?.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">{t("LoginHistory.NoRecords")}</div>
        )}

        {!isLoading && data?.Data?.length > 0 && (
          <div className="max-h-80 overflow-y-auto space-y-3">
            {data.Data.map((log: any, idx: number) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {log.AddedOn ? new Date(log.AddedOn).toLocaleString() : "N/A"}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    log.IsSuccess
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}>
                    {log.IsSuccess ? t("Common.Yes") : t("Common.No")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{t("LoginHistory.IPAddress")}</span>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{log.IpAddress || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{t("LoginHistory.Device")}</span>
                    <p className="font-medium text-gray-700 dark:text-gray-300 truncate" title={log.UserAgent}>
                      {log.UserAgent || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t("Form.Cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginHistoryModal;
