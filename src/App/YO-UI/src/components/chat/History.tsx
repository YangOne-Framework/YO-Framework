import { RiArrowLeftSLine, RiChat3Line, RiMenu2Line } from "react-icons/ri";
import { useTranslation } from "react-i18next";

const HistorySidebar = ({ isCollapsed, onToggle }: 
    { isCollapsed: boolean, onToggle: () => void }) => {
    const { t } = useTranslation();
    return (
    <aside className={`hidden lg:flex flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`flex items-center justify-center p-4 border-b border-slate-200 dark:border-zinc-800 h-20`}>
            <button onClick={onToggle} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-slate-300">
                {isCollapsed ? <RiMenu2Line size={24}/> : <RiArrowLeftSLine size={24}/>}
            </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            <a href="#" className={`flex items-center gap-3 p-3 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-slate-300 ${isCollapsed && 'justify-center'}`}>
                <RiChat3Line size={20} />
                {!isCollapsed && <span className="truncate text-sm">{t("Chat.HistoryTitle")}</span>}
                </a>
        </nav>
    </aside>
    );
};
export default HistorySidebar;
