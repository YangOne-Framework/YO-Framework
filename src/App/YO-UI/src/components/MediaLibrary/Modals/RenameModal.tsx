import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from "react-i18next";
import type { MediaLibraryItem } from '../../../types/mediaLibraryTypes';

interface RenameModalProps {
    isOpen: boolean;
    item: MediaLibraryItem | null;
    onClose: () => void;
    onSave: (oldName: string, newName: string, dir: string) => void;
    isLoading?: boolean;
}

const RenameModal: React.FC<RenameModalProps> = ({
    isOpen,
    item,
    onClose,
    onSave,
    isLoading = false,
}) => {
    const { t } = useTranslation();
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setNewName(item.FileName);
            setError('');
        }
    }, [isOpen, item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newName.trim()) {
            setError(t("MediaLibrary.NameRequired"));
            return;
        }

        if (newName.includes('/') || newName.includes('\\')) {
            setError(t("MediaLibrary.NameNoSlash"));
            return;
        }

        if (item) {
            onSave(item.RFilePath, newName.trim(), '/');
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t("MediaLibrary.RenameItem")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("MediaLibrary.CurrentName")}
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400 font-mono text-sm break-all">
                            {item.FileName}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="newName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("MediaLibrary.NewName")}
                        </label>
                        <input
                            type="text"
                            id="newName"
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value);
                                setError('');
                            }}
                            placeholder={t("MediaLibrary.EnterNewName")}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </div>
                </form>

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
                        disabled={isLoading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? t("MediaLibrary.Renaming") : t("MediaLibrary.Rename")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenameModal;
