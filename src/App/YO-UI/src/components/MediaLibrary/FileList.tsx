import React from 'react';
import { useTranslation } from "react-i18next";
import type { MediaLibraryItem } from '../../types/mediaLibraryTypes';
import { getFileTypeInfo, formatDate } from '../../utils/mediaLibraryUtils';
import { Folder } from 'lucide-react';

interface FileListProps {
    items: MediaLibraryItem[];
    selectedItems: MediaLibraryItem[];
    onItemClick: (item: MediaLibraryItem, isCtrlKey: boolean) => void;
    onItemDoubleClick: (item: MediaLibraryItem) => void;
    onContextMenu?: (e: React.MouseEvent, item: MediaLibraryItem) => void;
}

const FileList: React.FC<FileListProps> = ({
    items,
    selectedItems,
    onItemClick,
    onItemDoubleClick,
    onContextMenu,
}) => {
    const { t } = useTranslation();
    const isSelected = (item: MediaLibraryItem) => {
        return selectedItems.some((selected) => {
            // For directories, compare RDirectoryPath; for files, compare RFilePath
            if (item.IsDirectory && selected.IsDirectory) {
                return selected.RDirectoryPath === item.RDirectoryPath;
            } else if (!item.IsDirectory && !selected.IsDirectory) {
                return selected.RFilePath === item.RFilePath;
            }
            return false;
        });
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 rounded-xl">
                <Folder className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t("MediaLibrary.NoFiles")}</p>
                <p className="text-sm mt-1">{t("MediaLibrary.NoFilesHint")}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
                            <th className="w-12 px-4 py-3"></th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white w-1/5 hidden md:table-cell">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white w-1/6 hidden lg:table-cell">
                                Size
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white w-1/5 hidden xl:table-cell">
                                Modified
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item, index) => (
                            <FileRow
                                key={index}
                                item={item}
                                isSelected={isSelected(item)}
                                onItemClick={onItemClick}
                                onItemDoubleClick={onItemDoubleClick}
                                onContextMenu={onContextMenu}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// File Row Component
interface FileRowProps {
    item: MediaLibraryItem;
    isSelected: boolean;
    onItemClick: (item: MediaLibraryItem, isCtrlKey: boolean) => void;
    onItemDoubleClick: (item: MediaLibraryItem) => void;
    onContextMenu?: (e: React.MouseEvent, item: MediaLibraryItem) => void;
}

const FileRow: React.FC<FileRowProps> = ({
    item,
    isSelected,
    onItemClick,
    onItemDoubleClick,
    onContextMenu,
}) => {
    const fileInfo = getFileTypeInfo(item.FileName);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onItemClick(item, e.ctrlKey || e.metaKey);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onItemDoubleClick(item);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        onContextMenu?.(e, item);
    };

    return (
        <tr
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            className={`
                cursor-pointer transition-all duration-150
                ${isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
            `}
        >
            {/* Selection Indicator */}
            <td className="px-4 py-3 h-12 align-middle">
                {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </td>

            {/* Name */}
            <td className="px-4 py-3 h-12 align-middle">
                <div className="flex items-center gap-3">
                    {item.IsDirectory ? (
                        <Folder className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500'
                            }`} />
                    ) : (
                        <span className={`material-icons text-xl flex-shrink-0 ${fileInfo.color}`}>
                            {fileInfo.icon}
                        </span>
                    )}
                    <span className={`text-sm font-medium truncate ${isSelected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                        }`}>
                        {item.FileName}
                    </span>
                </div>
            </td>

            {/* Type */}
            <td className="px-4 py-3 h-12 align-middle text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                {item.IsDirectory ? 'Folder' : fileInfo.type}
            </td>

            {/* Size */}
            <td className="px-4 py-3 h-12 align-middle text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                {item.IsDirectory ? '—' : item.FileSize}
            </td>

            {/* Modified */}
            <td className="px-4 py-3 h-12 align-middle text-sm text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                {formatDate(item.CreationTime)}
            </td>
        </tr>
    );
};

export default FileList;
