import { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { RiResetLeftLine } from "react-icons/ri";
export const formatDateUS = (date: Date | string) => {
  let dateObj: Date;
  if (typeof date === "string") {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date";
    }
    dateObj = parsedDate;
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
export interface IFilterList {
  key: string;
  value: string;
  type?: "text" | "date";
}
const GridFilter = ({
  children,
  placeholder = "Search...",
  onResetClicked,
  onSearchClicked,
  onApplyClicked,
  filterList,
  removeFilter,
}: {
  children?: ReactNode;
  placeholder?: string;
  onApplyClicked?: () => void;
  onResetClicked?: () => void;
  onSearchClicked?: (data: string) => void;
  filterList?: IFilterList[];
  removeFilter?: (key: string) => void;
}) => {
  const { t } = useTranslation();
  const [isFilterOn, setIsFilterOn] = useState(false);
  const [search, setSearch] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    onResetClicked && onResetClicked();
    setIsFilterOn(false);
  };

  const handleApply = () => {
    setIsFilterOn(false);
    onApplyClicked && onApplyClicked();
  };

  const handleSearchClicked = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchClicked && onSearchClicked(search);
  };

  const handleRemoveFilter = (item: string) => {
    removeFilter && removeFilter(item);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOn(false);
      }
    }

    if (isFilterOn) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOn]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearchClicked} className="flex md:min-w-[25rem]">
          <input
            type="search"
            name="query"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
          <button className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
            {t('GridFilter.Search')}
          </button>
        </form>
        {children && (
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOn(true)}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              <MdOutlineFilterAlt size={20} />{" "}
              <span className="max-md:hidden">{t('GridFilter.Filter')}</span>
            </button>

            {isFilterOn && (
              <div className="bg-white dark:bg-gray-800 border rounded-md border-gray-300 dark:border-gray-700 flex flex-col gap-2 z-10 fixed bottom-0 left-0 w-full md:absolute md:top-12 md:right-0 md:w-[30rem] md:bottom-auto md:left-auto">
                <div className="flex items-center justify-between px-2 border-b border-gray-300 dark:border-gray-700">
                  <div className="flex items-center gap-2 font-medium p-2 dark:text-gray-200">
                    <MdOutlineFilterAlt size={20} />
                    {t('GridFilter.Filter')}
                  </div>
                  <button
                    onClick={() => setIsFilterOn(false)}
                    className="cursor-pointer dark:text-gray-400"
                  >
                    <IoMdClose className="text-base" size={20} />
                  </button>
                </div>
                <div className="p-2 px-4 flex flex-col gap-3">{children}</div>

                <div className="border-t border-gray-300 dark:border-gray-700 px-2 py-2 flex items-center justify-end gap-4">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                    onClick={handleReset}
                    type="button">
                    {t('GridFilter.ResetAll')}
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600" onClick={handleApply} type="button">
                    {t('GridFilter.Apply')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {filterList && filterList.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filterList.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-base bg-primary-v6 rounded-md p-2 text-sm font-medium capitalize"
            >
              <span>
                {item?.type && item?.type === "date"
                  ? formatDateUS(item?.value)
                  : item?.value}
              </span>
              <button
                onClick={() => handleRemoveFilter(item?.key)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
              >
                <IoClose size={17} />
              </button>
            </div>
          ))}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-primary bg-primary-v6 rounded-md p-2 text-sm font-medium capitalize cursor-pointer w-fit"
          >
            <RiResetLeftLine size={17} />
            <span>{t('GridFilter.ResetFilter')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GridFilter;
