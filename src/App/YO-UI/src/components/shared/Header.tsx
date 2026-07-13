import { useTranslation } from "react-i18next";
import ThemeToggleButton from "./ThemeSwitcher";

const Header = () => {
  const { t } = useTranslation();
  return (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center">
          <a href="/"><span className="text-xl font-semibold text-zinc-900 dark:text-slate-100">{t("Shared.BrandName")}</span></a>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white transition-colors tracking-wide">{t("Shared.Features")}</a>
          <a href="#demo" className="text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white transition-colors tracking-wide">{t("Shared.Demo")}</a>
          <a href="/chat" className="text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white transition-colors tracking-wide">{t("Shared.SeeApps")}</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="#" className="bg-red-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors">
           {t("Shared.ContactUs")}
          </a>
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  </header>
  );
};

export default Header;