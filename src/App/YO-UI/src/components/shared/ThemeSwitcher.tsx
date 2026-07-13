import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { RiMoonFill, RiSunLine } from "react-icons/ri";

const ThemeToggleButton = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-200 dark:bg-zinc-800 text-zinc-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-500 transition-colors"
      aria-label={t('ThemeSwitcher.Light')}
    >
      {theme === "dark" ? <RiSunLine size={20} /> : <RiMoonFill size={20} />}
    </button>
  );
};
export default ThemeToggleButton;