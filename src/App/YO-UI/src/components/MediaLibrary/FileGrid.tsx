import React from 'react';
import { useTranslation } from "react-i18next";
import type { MediaLibraryItem } from '../../types/mediaLibraryTypes';
import { getFileTypeInfo, isImageFile, getMediaPath, formatDate } from '../../utils/mediaLibraryUtils';
import { Folder } from 'lucide-react';

interface FileGridProps {
    items: MediaLibraryItem[];
    selectedItems: MediaLibraryItem[];
    onItemClick: (item: MediaLibraryItem, isCtrlKey: boolean) => void;
    onItemDoubleClick: (item: MediaLibraryItem) => void;
    onContextMenu?: (e: React.MouseEvent, item: MediaLibraryItem) => void;
}

const FileGrid: React.FC<FileGridProps> = ({
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
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                <Folder className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t("MediaLibrary.NoFiles")}</p>
                <p className="text-sm mt-1">{t("MediaLibrary.NoFilesHint")}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item, index) => (
                <FileCard
                    key={index}
                    item={item}
                    isSelected={isSelected(item)}
                    onClick={(isCtrl) => onItemClick(item, isCtrl)}
                    onDoubleClick={() => onItemDoubleClick(item)}
                    onContextMenu={(e) => onContextMenu?.(e, item)}
                />
            ))}
        </div>
    );
};

// File Card Component
interface FileCardProps {
    item: MediaLibraryItem;
    isSelected: boolean;
    onClick: (isCtrlKey: boolean) => void;
    onDoubleClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

const FileCard: React.FC<FileCardProps> = ({
    item,
    isSelected,
    onClick,
    onDoubleClick,
    onContextMenu,
}) => {
    const fileInfo = getFileTypeInfo(item.FileName);
    const isImage = !item.IsDirectory && isImageFile(item.FileName);
    const imagePath = isImage ? getMediaPath(item.RFilePath) : '';

    return (
        <div
            onClick={(e) => onClick(e.ctrlKey || e.metaKey)}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
            className={`
                group relative rounded-xl overflow-hidden cursor-pointer
                transition-all duration-200 transform hover:scale-105 hover:shadow-xl
                ${isSelected
                    ? 'ring-4 ring-blue-500 shadow-lg scale-105'
                    : 'border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }
            `}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute top-2 left-2 z-10 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )}

            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
                {item.IsDirectory ? (
                    <div className="flex flex-col items-center">
                        <Folder className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                    </div>
                ) : isImage ? (
                    <img
                        src={imagePath}
                        alt={item.FileName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : (
                    <span className={`material-icons text-5xl ${fileInfo.color}`}>
                        {fileInfo.icon}
                    </span>
                )}
                {isImage && (
                    <span className={`material-icons text-5xl ${fileInfo.color} hidden`}>
                        {fileInfo.icon}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className={`
                p-3 bg-white dark:bg-gray-800
                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            `}>
                <p className={`
                    text-sm font-semibold truncate
                    ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}
                `}>
                    {item.FileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.IsDirectory ? 'Folder' : `${fileInfo.type} • ${item.FileSize}`}
                </p>
            </div>
        </div>
    );
};

export default FileGrid;
