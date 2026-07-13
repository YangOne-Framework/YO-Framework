import React, { useState, useEffect } from 'react';
import { X, Folder, ChevronRight } from 'lucide-react';
import { useTranslation } from "react-i18next";
import type { MediaLibraryItem, OperationMode } from '../../../types/mediaLibraryTypes';

interface CopyMoveModalProps {
    isOpen: boolean;
    mode: OperationMode;
    selectedItems: MediaLibraryItem[];
    directories: MediaLibraryItem[];
    currentDirectory: string;
    onClose: () => void;
    onConfirm: (destinationDir: string) => void;
    onNavigate: (path: string) => void;
    isLoading?: boolean;
}

const CopyMoveModal: React.FC<CopyMoveModalProps> = ({
    isOpen,
    mode,
    selectedItems,
    directories,
    currentDirectory,
    onClose,
    onConfirm,
    onNavigate,
    isLoading = false,
}) => {
    const { t } = useTranslation();
    const [selectedDestination, setSelectedDestination] = useState<string>('/');

    useEffect(() => {
        if (isOpen) {
            setSelectedDestination(currentDirectory);
        }
    }, [isOpen, currentDirectory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(selectedDestination);
    };

    const handleDirectoryClick = (dir: MediaLibraryItem) => {
        setSelectedDestination(dir.RDirectoryPath);
    };

    const handleDirectoryDoubleClick = (dir: MediaLibraryItem) => {
        onNavigate(dir.RDirectoryPath);
    };

    if (!isOpen) return null;

    const title = mode === 'copy' ? t("MediaLibrary.CopyTo") : t("MediaLibrary.MoveTo");
    const actionText = mode === 'copy' ? t("MediaLibrary.CopyHere") : t("MediaLibrary.MoveHere");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t("MediaLibrary.ItemsSelected", { count: selectedItems.length })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Current Path */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("MediaLibrary.CurrentLocation")}
                        </label>
                        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 font-mono text-sm flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            {currentDirectory}
                        </div>
                    </div>

                    {/* Directory List */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("MediaLibrary.SelectDestination")}
                        </label>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                            {directories.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>{t("MediaLibrary.NoFolders")}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {directories.map((dir, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleDirectoryClick(dir)}
                                            onDoubleClick={() => handleDirectoryDoubleClick(dir)}
                                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedDestination === dir.RDirectoryPath
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                                                    : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Folder className={`w-5 h-5 ${selectedDestination === dir.RDirectoryPath
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                    }`} />
                                                <span className={`text-sm font-medium ${selectedDestination === dir.RDirectoryPath
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {dir.FileName}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {t("MediaLibrary.FolderNavHint")}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {t("Form.Cancel")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedDestination}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (mode === 'copy' ? t("MediaLibrary.Copying") : t("MediaLibrary.Moving")) : actionText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CopyMoveModal;
