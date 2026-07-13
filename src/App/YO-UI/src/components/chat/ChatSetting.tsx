import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";
import { BaseEndpoints } from "../../config/BaseEndpoints";

const SettingsPanel = ({ isVisible, onClose, assistant }:
    { isVisible: boolean, onClose: () => void, assistant: any }) => {
    const { t } = useTranslation();

    return (
        <>
            <div onClick={onClose} className={`fixed inset-0 bg-black/30 z-30 transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
            <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-zinc-900 shadow-lg z-40 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800">
                    <h2 className="font-semibold text-lg text-zinc-900 dark:text-slate-100">{t("Chat.Info")}</h2>
                    <button onClick={onClose} className="p-1 text-zinc-500 dark:text-slate-400 hover:text-red-500">
                        <RiCloseLine size={24} /></button>
                </div>
                <div className="p-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <img src={BaseEndpoints.base+ assistant?.ImageUrl} alt={assistant?.Name} />
                    </div>
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-zinc-700 dark:text-slate-300 mb-2">
                            {t("Chat.Name")}</label>
                        <p>{assistant?.Name || t("Common.NA")}</p>
                        {/* <select id="model" className="w-full p-2 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                            <option>{t("Chat.GPT4Default")}</option>
                            <option>{t("Chat.Claude3Opus")}</option>
                        </select> */}
                    </div>
                    <div>
                        <label htmlFor="model"
                            className="block text-sm font-medium text-zinc-700 dark:text-slate-300 mb-2">
                            {t("Chat.Description")}</label>
                        <p>{assistant?.Description || t("Common.NA")}</p>

                    </div>
                    <div>
                        <label htmlFor="model"
                            className="block text-sm font-medium text-zinc-700 dark:text-slate-300 mb-2">
                            {t("Chat.Website")}</label>
                        <p>{assistant?.Website || t("Common.NA")}</p>

                    </div>
                    {/* <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-700 dark:text-slate-300">Enable Voice Output</span>
                        <label htmlFor="voice-toggle" className="flex items-center cursor-pointer">
                            <div className="relative"><input type="checkbox" id="voice-toggle" className="sr-only" />
                                <div className="block bg-slate-200 dark:bg-zinc-700 w-12 h-6 rounded-full">
                                </div>
                                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform">
                                </div>
                            </div>
                        </label>
                    </div> */}
                </div>
            </div>
        </>
    );
};
export default SettingsPanel;