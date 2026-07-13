import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileUp, AlertCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface UploadModalProps {
    isOpen: boolean;
    currentDirectory: string;
    onClose: () => void;
    onUpload: (file: File, dir: string) => void;
    isLoading?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    currentDirectory,
    onClose,
    onUpload,
    isLoading = false,
}) => {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [useChunkUpload, setUseChunkUpload] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setUseChunkUpload(false);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Suggest chunk upload for files > 20MB
            if (file.size > 20 * 1024 * 1024) {
                setUseChunkUpload(true);
            }
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.size > 20 * 1024 * 1024) {
                setUseChunkUpload(true);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onUpload(selectedFile, currentDirectory);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t("MediaLibrary.UploadFile")}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            to {currentDirectory}
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
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Drag & Drop Zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${dragActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />

                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white" />
                            </div>

                            {selectedFile ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                        <FileUp className="w-5 h-5" />
                                        <span className="font-medium">{t("MediaLibrary.FileSelected")}</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {t("MediaLibrary.ChooseDifferentFile")}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("MediaLibrary.DropFileHint")}{' '}
                                        <label
                                            htmlFor="file-upload"
                                            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                        >
                                            browse
                                        </label>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("MediaLibrary.SingleFileSupport")}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chunk Upload Warning */}
                    {selectedFile && selectedFile.size > 20 * 1024 * 1024 && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    {t("MediaLibrary.LargeFileDetected")}
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    {t("MediaLibrary.LargeFileMessage")}
                                </p>
                            </div>
                        </div>
                    )}
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
                        disabled={!selectedFile || isLoading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        {isLoading ? t("MediaLibrary.Uploading") : t("MediaLibrary.UploadFile")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
