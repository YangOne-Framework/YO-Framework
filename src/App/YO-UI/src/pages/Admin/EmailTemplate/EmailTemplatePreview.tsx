import { Modal } from "../../../components/ui/modal";
import { MdClose } from "react-icons/md";
import { stripYoWrappers } from "./EmailTemplateBuilder";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  name: string;
  html: string;
}

const EmailTemplatePreview = ({ isOpen, onClose, subject, name, html }: Props) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="!max-w-4xl !p-0 !overflow-hidden" showCloseButton={false}>
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t("EmailTemplatePreview.Subject")} <span className="font-medium text-gray-700 dark:text-gray-300">{subject}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-700 text-gray-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <MdClose size={20} />
        </button>
      </div>
      <div className="p-6">
        {html ? (
          <div
            className="prose prose-sm max-w-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
            dangerouslySetInnerHTML={{ __html: stripYoWrappers(html) }}
          />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            {t("EmailTemplatePreview.NoContent")}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmailTemplatePreview;
