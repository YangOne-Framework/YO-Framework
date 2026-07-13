import { JSX, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BsFilterLeft } from "react-icons/bs";
import {
    FaBackwardStep,
    FaChevronLeft,
    FaChevronRight,
    FaForwardStep,
} from "react-icons/fa6";

type PaginationProps = {
    text: string;
    currentPage: number;
    totalPage: number;
    onPageChange?: (page: number) => void;
};

const Pagination = ({
    text,
    currentPage,
    totalPage,
    onPageChange,
}: PaginationProps) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPage <= 5) {
            for (let i = 1; i <= totalPage; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push("...");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPage - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPage - 2) {
                pages.push("...");
            }

            pages.push(totalPage);
        }

        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPage) {
            onPageChange && onPageChange(page);
        }
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-between ">
            <span className="text-base dark:text-gray-300">{text}</span>
            <div className="flex items-center gap-2">
                {totalPage > 3 && (
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="disabled:text-slate-400 border p-2 rounded-md w-8 h-8 flex items-center justify-center cursor-pointer dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <FaBackwardStep />
                    </button>
                )}

                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="disabled:text-slate-400 border p-2 rounded-md w-8 h-8 flex items-center justify-center cursor-pointer dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <FaChevronLeft />
                </button>

                {pageNumbers.map((page, idx) =>
                    typeof page === "number" ? (
                        <button
                            key={idx}
                            onClick={() => handlePageChange(page)}
                            className={`border px-2 py-1 rounded-md w-8 h-8 flex items-center justify-center cursor-pointer dark:border-gray-700 dark:text-gray-300 ${page === currentPage ? "text-primary bg-primary-v6" : "dark:hover:bg-gray-800"
                                }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span
                            key={idx}
                            className="border px-2 py-1 rounded-md w-8 h-8 flex items-center justify-center dark:border-gray-700 dark:text-gray-300"
                        >
                            {page}
                        </span>
                    )
                )}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPage}
                    className="disabled:text-slate-400 border p-2 rounded-md w-8 h-8 flex items-center justify-center cursor-pointer dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <FaChevronRight />
                </button>
                {totalPage > 3 && (
                    <button
                        onClick={() => handlePageChange(totalPage)}
                        disabled={currentPage === totalPage}
                        className="disabled:text-slate-400 border p-2 rounded-md w-8 h-8 flex items-center justify-center cursor-pointer dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <FaForwardStep />
                    </button>
                )}
            </div>
        </div>
    );
};



type Column<T> = {
    key: keyof T | string;
    label: string;
    icon?: boolean;
    customIcon?: JSX.Element;
    render?: (item: T) => ReactNode;
};

type TableTwoProps<T> = {
    isLoading?: boolean,
    columns: Column<T>[];
    data: T[];
    currentPage?: number;
    totalPage?: number;
    text?: string;
    isLine?: boolean;
    isPagination?: boolean;
    minWidth?: number;
    onPageChange?: (page: number) => void;
    onSelectAll?: () => void;
    onSelect?: (item: T) => void;
    onRowClick?: (item: T) => void;
    selectedItems?: Partial<T>[];
    rowIdentifier?: keyof T;
    isShadow?: boolean;
    onHeaderClick?: (label: string) => void;
};

function DataGrid<T extends { [key: string]: any }>({
    isLoading,
    columns,
    data,
    currentPage = 1,
    totalPage = 1,
    text,
    isLine = false,
    isPagination = true,
    minWidth = 1200,
    onPageChange,
    onSelect,
    onRowClick,
    onSelectAll,
    selectedItems = [],
    rowIdentifier,
    isShadow = false,
    onHeaderClick,
}: TableTwoProps<T>) {
    const { t } = useTranslation();
    const displayText = text || t('DataGrid.TotalItems', 'Total items');
    // const selectedIdentifiers = new Set(selectedItems);

    const selectedIdentifiers = new Set(
        selectedItems.map((item: any) => {
            if (typeof item === "object" && item !== null) {
                return item[rowIdentifier];
            }
            return item;
        })
    );

    const allSelected =
        data?.length > 0 &&
        rowIdentifier &&
        data.every((item) => selectedIdentifiers.has(item[rowIdentifier]));

    const someSelected =
        data?.length > 0 &&
        rowIdentifier &&
        data.some((item) => selectedIdentifiers.has(item[rowIdentifier])) &&
        !allSelected;

    return (
        <div className="border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <table
                    className={`min-w-full w-full min-w-[${minWidth}px] rounded-md border-separate border-spacing-y-2`}
                >
                    <thead className="border-gray-100 border-y bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                        <tr className="text-left text-para bg-primary-heading dark:text-gray-300">
                            {columns.map((col, index) => {
                                const isFirst = index === 0;
                                const isLast = index === columns.length - 1;
                                return (
                                    <th
                                        key={String(col.key)}
                                        className={`py-2 min-w-[200px] font-medium ${isFirst ? "pl-3 pr-2 rounded-tl-md" : ""
                                            } ${isLast ? "pr-3 pl-3 rounded-tr-md" : ""} 
                    ${isLine && isLast ? "border-l-2 border-slate-200" : ""}
                    `}
                                        onClick={() => onHeaderClick && onHeaderClick(col.key as string || "")}
                                    >
                                        <div className="flex items-center gap-2">
                                            {rowIdentifier && isFirst && (
                                                <input
                                                    type="checkbox"
                                                    className="form-radio h-4 w-4 accent-primary border"
                                                    onChange={onSelectAll}
                                                    checked={allSelected}
                                                    ref={(el: any) => {
                                                        if (el) el.indeterminate = someSelected;
                                                    }}
                                                />
                                            )}
                                            <span className="dark:text-gray-300">{col.label}</span>
                                            {col?.icon && (
                                                <BsFilterLeft className="text-para/70 dark:text-gray-400" size={18} />
                                            )}
                                            {col?.customIcon && col.customIcon}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading == true && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-4 text-base font-medium dark:text-gray-300"
                                >
                                    {t('DataGrid.Loading')}
                                </td>
                            </tr>
                        )}
                        {isLoading == false && data?.length > 0 && (
                            data.map((item, rowIndex) => {
                                const identifierValue = rowIdentifier
                                    ? item[rowIdentifier]
                                    : undefined;

                                const isSelected =
                                    identifierValue !== undefined &&
                                    selectedIdentifiers.has(identifierValue);

                                return (
                                    <tr
                                        key={rowIndex}
                                        className={`text-base bg-white dark:bg-gray-900 dark:text-gray-300 group ${isShadow && "hover:shadow-lg"
                                            } ${rowIdentifier && "cursor-pointer"}`}
                                        onClick={(e) => {
                                            let target = e.target as HTMLElement;
                                            const interactiveTags = [
                                                "button",
                                                "a",
                                                "input",
                                                "select",
                                                "textarea",
                                                "label",
                                            ];

                                            while (target && target !== e.currentTarget) {
                                                if (
                                                    interactiveTags.includes(target.tagName.toLowerCase())
                                                ) {
                                                    return;
                                                }
                                                target = target.parentElement as HTMLElement;
                                            }

                                            if (
                                                rowIdentifier &&
                                                onSelect &&
                                                (typeof identifierValue === "string" ||
                                                    typeof identifierValue === "number")
                                            ) {
                                                onSelect(item);
                                            }

                                            onRowClick?.(item);
                                        }}
                                    >
                                        {columns.map((col, colIndex) => {
                                            const isFirst = colIndex === 0;
                                            const isLast = colIndex === columns.length - 1;
                                            return (
                                                <td
                                                    key={String(colIndex)}
                                                    className={`py-3 min-w-[200px] dark:text-gray-300 ${isFirst ? "pl-3 rounded-l-md" : ""
                                                        } ${isLast ? "pr-3 pl-3 rounded-r-md" : ""} ${isLine && isLast
                                                            ? "border-l-2 border-slate-200"
                                                            : ""
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {rowIdentifier && isFirst && rowIdentifier && (
                                                            <input
                                                                type="checkbox"
                                                                className="form-radio h-4 w-4   border shrink-0 accent-primary"
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    onSelect?.(item);
                                                                }}
                                                                checked={isSelected}
                                                            />
                                                        )}
                                                        {col.render
                                                            ? col.render(item)
                                                            : (item as any)[col.key]}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}

                        {isLoading == false && data?.length == 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-4 text-base font-medium dark:text-gray-300"
                                >
                                    {t('DataGrid.NoData')}
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>
            {isPagination && (
                <Pagination
                    text={displayText}
                    currentPage={currentPage}
                    totalPage={totalPage}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}

export default DataGrid;
