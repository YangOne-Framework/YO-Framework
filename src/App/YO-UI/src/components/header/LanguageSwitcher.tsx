import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useGetRegionsQuery, useSetLanguageMutation } from "../../redux/setting/localizationAPI";
import { LocaleRegion } from "../../types/settingTypes";

function getFlagEmoji(countryCode: string | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((ch) => 127397 + ch.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const { data: regionsData } = useGetRegionsQuery({ pageNo: 1, rowsPerPage: 50 });
  const [setLanguage] = useSetLanguageMutation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeRegions: LocaleRegion[] = (regionsData?.Data || []).filter(
    (r: LocaleRegion) => r.IsActive
  );

  const currentCulture = i18n.language?.toLowerCase() || "en-us";

  const switchLanguage = async (culture: string) => {
    await setLanguage({ Culture: culture });
    await i18n.changeLanguage(culture.toLowerCase());
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        title={t("LanguageSwitcher.SelectLanguage")}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="text-xs font-medium hidden sm:inline uppercase">
          {currentCulture.split("-")[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark z-50">
          {activeRegions.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {t("Common.Loading")}
            </p>
          )}
          {activeRegions.map((region) => {
            const isCurrent = region.Culture?.toLowerCase() === currentCulture;
            return (
              <button
                key={region.LocaleRegionId}
                onClick={() => switchLanguage(region.Culture)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isCurrent
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 font-medium"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
              >
                <span className="text-base">{getFlagEmoji(region.Flag || region.Culture?.split("-")[1])}</span>
                <span>{region.CountryName || region.Culture}</span>
                {isCurrent && <span className="ml-auto text-xs opacity-60">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
