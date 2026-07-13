import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toaster from '../../../components/toster';
import Toolbar from '../../../components/MediaLibrary/Toolbar';
import FileGrid from '../../../components/MediaLibrary/FileGrid';
import FileList from '../../../components/MediaLibrary/FileList';
import NewFolderModal from '../../../components/MediaLibrary/Modals/NewFolderModal';
import RenameModal from '../../../components/MediaLibrary/Modals/RenameModal';
import UploadModal from '../../../components/MediaLibrary/Modals/UploadModal';
import CopyMoveModal from '../../../components/MediaLibrary/Modals/CopyMoveModal';
import {
    useGetItemsByDirectoryQuery,
    useGetDirectoriesOnlyQuery,
    useSaveDirectoryMutation,
    useRenameFileMutation,
    useUploadFileMutation,
    useCopyFilesOrDirectoriesMutation,
    useMoveFilesOrDirectoriesMutation,
    useDeleteFilesOrDirectoriesMutation,
} from '../../../redux/setting/medialibraryAPI';
import type {
    MediaLibraryItem,
    ViewMode,
    OperationMode,
    DirectoryViewModel,
} from '../../../types/mediaLibraryTypes';
import { buildBreadcrumbs, getParentDirectory, getMediaPath, copyToClipboard } from '../../../utils/mediaLibraryUtils';

const MediaLibraryPage: React.FC = () => {
    const { t } = useTranslation();
    // State
    const [currentDirectory, setCurrentDirectory] = useState<string>('/');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedItems, setSelectedItems] = useState<MediaLibraryItem[]>([]);
    const [operationMode, setOperationMode] = useState<OperationMode | null>(null);

    // Modal States
    const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [copyMoveModalOpen, setCopyMoveModalOpen] = useState(false);
    const [itemToRename, setItemToRename] = useState<MediaLibraryItem | null>(null);

    // Queries
    const { data: items = [], isLoading, refetch } = useGetItemsByDirectoryQuery({
        currentDir: currentDirectory,
    });
    const { data: directories = [] } = useGetDirectoriesOnlyQuery({
        currentDir: currentDirectory,
    });

    // Mutations
    const [saveDirectory, { isLoading: isSavingDirectory }] = useSaveDirectoryMutation();
    const [renameFile, { isLoading: isRenamingFile }] = useRenameFileMutation();
    const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
    const [copyFiles, { isLoading: isCopyingFiles }] = useCopyFilesOrDirectoriesMutation();
    const [moveFiles, { isLoading: isMovingFiles }] = useMoveFilesOrDirectoriesMutation();
    const [deleteFiles, { isLoading: isDeletingFiles }] = useDeleteFilesOrDirectoriesMutation();

    // Clear selection when directory changes
    useEffect(() => {
        setSelectedItems([]);
    }, [currentDirectory]);

    // Handlers
    const handleItemClick = (item: MediaLibraryItem, isCtrlKey: boolean) => {
        if (isCtrlKey) {
            // Toggle selection
            const isAlreadySelected = selectedItems.some(
                (selected) => selected.RFilePath === item.RFilePath
            );
            if (isAlreadySelected) {
                setSelectedItems(selectedItems.filter((i) => i.RFilePath !== item.RFilePath));
            } else {
                setSelectedItems([...selectedItems, item]);
            }
        } else {
            // Single select
            setSelectedItems([item]);
        }
    };

    const handleItemDoubleClick = (item: MediaLibraryItem) => {
        if (item.IsDirectory) {
            setCurrentDirectory(item.RDirectoryPath);
        } else {
            // Open file in new tab
            const url = getMediaPath(item.RFilePath);
            window.open(url, '_blank');
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === items.length && items.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems([...items]);
        }
    };

    const handleHome = () => {
        setCurrentDirectory('/');
    };

    const handleUpDirectory = () => {
        const parent = getParentDirectory(currentDirectory);
        setCurrentDirectory(parent);
    };

    const handleNewFolder = () => {
        setNewFolderModalOpen(true);
    };

    const handleSaveNewFolder = async (data: DirectoryViewModel) => {
        try {
            const result = await saveDirectory(data).unwrap();
            if (result.Success) {
                toaster.success(result.Message || t('MediaLibrary.FolderCreated'));
                setNewFolderModalOpen(false);
                refetch();
            } else {
                toaster.error(result.Message || t('MediaLibrary.FolderCreateFailed'));
            }
        } catch (error: any) {
            const errorMessage = error?.data?.Message || error?.message || t('MediaLibrary.FolderCreateError');
            toaster.error(errorMessage);
            console.error('Save folder error:', error);
        }
    };

    const handleUpload = () => {
        setUploadModalOpen(true);
    };

    const handleFileUpload = async (file: File, dir: string) => {
        try {
            const result = await uploadFile({ File: file, Dir: dir }).unwrap();
            if (result.Success) {
                toaster.success(result.Message || t('MediaLibrary.FileUploaded'));
                setUploadModalOpen(false);
                refetch();
            } else {
                toaster.error(result.Message || t('MediaLibrary.FileUploadFailed'));
            }
        } catch (error: any) {
            const errorMessage = error?.data?.Message || error?.message || t('MediaLibrary.FileUploadError');
            toaster.error(errorMessage);
            console.error('Upload error:', error);
        }
    };

    const handleCopy = () => {
        if (selectedItems.length === 0) {
            toaster.error(t('MediaLibrary.SelectItemsCopy'));
            return;
        }
        setOperationMode('copy');
        setCopyMoveModalOpen(true);
    };

    const handleCut = () => {
        if (selectedItems.length === 0) {
            toaster.error(t('MediaLibrary.SelectItemsCut'));
            return;
        }
        setOperationMode('move');
        setCopyMoveModalOpen(true);
    };

    const handleCopyMoveConfirm = async (destinationDir: string) => {
        try {
            if (operationMode === 'copy') {
                const result = await copyFiles({
                    Files: selectedItems,
                    DestinationDir: destinationDir,
                }).unwrap();
                if (result.Success) {
                    toaster.success(result.Message || t('MediaLibrary.FilesCopied'));
                    setCopyMoveModalOpen(false);
                    setSelectedItems([]);
                    refetch();
                } else {
                    toaster.error(result.Message || t('MediaLibrary.FilesCopyFailed'));
                }
            } else if (operationMode === 'move') {
                const result = await moveFiles({
                    Files: selectedItems,
                    DestinationDir: destinationDir,
                }).unwrap();
                if (result.Success) {
                    toaster.success(result.Message || t('MediaLibrary.FilesMoved'));
                    setCopyMoveModalOpen(false);
                    setSelectedItems([]);
                    refetch();
                } else {
                    toaster.error(result.Message || t('MediaLibrary.FilesMoveFailed'));
                }
            }
        } catch (error: any) {
            const errorMessage = error?.data?.Message || error?.message || t('MediaLibrary.OperationError');
            toaster.error(errorMessage);
            console.error('Copy/Move error:', error);
        }
    };

    const handleDelete = () => {
        if (selectedItems.length === 0) {
            toaster.error(t('MediaLibrary.SelectItemsDelete'));
            return;
        }

        const confirmed = window.confirm(
            t('MediaLibrary.DeleteConfirm', { count: selectedItems.length })
        );

        if (confirmed) {
            performDelete();
        }
    };

    const performDelete = async () => {
        try {
            const result = await deleteFiles({ Files: selectedItems }).unwrap();
            if (result.Success) {
                toaster.success(result.Message || t('MediaLibrary.ItemsDeleted'));
                setSelectedItems([]);
                refetch();
            } else {
                toaster.error(result.Message || t('MediaLibrary.ItemsDeleteFailed'));
            }
        } catch (error: any) {
            const errorMessage = error?.data?.Message || error?.message || t('MediaLibrary.ItemsDeleteError');
            toaster.error(errorMessage);
            console.error('Delete error:', error);
        }
    };

    const handleRename = (item: MediaLibraryItem) => {
        setItemToRename(item);
        setRenameModalOpen(true);
    };

    const handleSaveRename = async (oldName: string, newName: string, dir: string) => {
        try {
            const result = await renameFile({
                OldFileName: oldName,
                NewFileName: newName,
                Dir: dir,
            }).unwrap();
            if (result.Success) {
                toaster.success(result.Message || t('MediaLibrary.ItemRenamed'));
                setRenameModalOpen(false);
                setItemToRename(null);
                refetch();
            } else {
                toaster.error(result.Message || t('MediaLibrary.ItemRenameFailed'));
            }
        } catch (error: any) {
            const errorMessage = error?.data?.Message || error?.message || t('MediaLibrary.ItemRenameError');
            toaster.error(errorMessage);
            console.error('Rename error:', error);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, item: MediaLibraryItem) => {
        e.preventDefault();
        // For now, just select the item
        setSelectedItems([item]);
        // TODO: Implement context menu
    };

    const handleCopyMoveNavigate = (path: string) => {
        // This would refetch directories for the new path
        // Since we're using the query, we'll need to handle this differently
        // For now, we'll just update a local state or use a separate query
    };

    const breadcrumbs = buildBreadcrumbs(currentDirectory);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Page Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t('MediaLibrary.Title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('MediaLibrary.Description')}
                    </p>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mt-4 text-sm overflow-x-auto pb-2">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <button
                                    onClick={() => setCurrentDirectory(crumb.path)}
                                    className={`
px - 3 py - 1.5 rounded - lg transition - colors whitespace - nowrap
                                        ${index === breadcrumbs.length - 1
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }
`}
                                >
                                    {crumb.name}
                                </button>
                                {index < breadcrumbs.length - 1 && (
                                    <span className="text-gray-400">/</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <Toolbar
                    viewMode={viewMode}
                    currentPath={currentDirectory}
                    selectedCount={selectedItems.length}
                    totalCount={items.length}
                    onViewChange={setViewMode}
                    onHome={handleHome}
                    onUpDirectory={handleUpDirectory}
                    onNewFolder={handleNewFolder}
                    onUpload={handleUpload}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    onDelete={handleDelete}
                    onSelectAll={handleSelectAll}
                    canGoUp={currentDirectory !== '/'}
                />

                {/* Selected Items Path Display */}
                {selectedItems.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                {t('MediaLibrary.SelectedItems')} ({selectedItems.length})
                            </h3>
                            <button
                                onClick={() => setSelectedItems([])}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {t('MediaLibrary.ClearSelection')}
                            </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedItems.map((item, index) => {
                                const itemPath = item.IsDirectory
                                    ? `/uploads/media${item.RDirectoryPath}`
                                    : `/uploads/media${item.RFilePath}`;

                                return (
                                    <button
                                        key={index}
                                        onClick={async () => {
                                            const success = await copyToClipboard(itemPath);
                                            if (success) {
                                                toaster.success(t('MediaLibrary.PathCopied') + `: ${itemPath}`);
                                            } else {
                                                toaster.error(t('MediaLibrary.PathCopyFailed'));
                                            }
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors group"
                                    >
                                        <svg
                                            className="w-4 h-4 text-blue-500 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                            />
                                        </svg>
                                        <span className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate flex-1 text-left">
                                            {itemPath}
                                        </span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            {t('MediaLibrary.ClickToCopy')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* File Space */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 min-h-96 relative">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        </div>
                    ) : viewMode === 'grid' ? (
                        <FileGrid
                            items={items}
                            selectedItems={selectedItems}
                            onItemClick={handleItemClick}
                            onItemDoubleClick={handleItemDoubleClick}
                            onContextMenu={handleContextMenu}
                        />
                    ) : (
                        <FileList
                            items={items}
                            selectedItems={selectedItems}
                            onItemClick={handleItemClick}
                            onItemDoubleClick={handleItemDoubleClick}
                            onContextMenu={handleContextMenu}
                        />
                    )}
                </div>

                {/* Bottom Info */}
                {items.length > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        {selectedItems.length > 0
                            ? `${selectedItems.length} ${t('MediaLibrary.ItemsSelected')}`
                            : `${items.length} ${t('MediaLibrary.Items')}`}
                    </div>
                )}
            </div>

            {/* Modals */}
            <NewFolderModal
                isOpen={newFolderModalOpen}
                currentDirectory={currentDirectory}
                onClose={() => setNewFolderModalOpen(false)}
                onSave={handleSaveNewFolder}
                isLoading={isSavingDirectory}
            />

            <RenameModal
                isOpen={renameModalOpen}
                item={itemToRename}
                onClose={() => {
                    setRenameModalOpen(false);
                    setItemToRename(null);
                }}
                onSave={handleSaveRename}
                isLoading={isRenamingFile}
            />

            <UploadModal
                isOpen={uploadModalOpen}
                currentDirectory={currentDirectory}
                onClose={() => setUploadModalOpen(false)}
                onUpload={handleFileUpload}
                isLoading={isUploadingFile}
            />

            <CopyMoveModal
                isOpen={copyMoveModalOpen}
                mode={operationMode || 'copy'}
                selectedItems={selectedItems}
                directories={directories}
                currentDirectory={currentDirectory}
                onClose={() => {
                    setCopyMoveModalOpen(false);
                    setOperationMode(null);
                }}
                onConfirm={handleCopyMoveConfirm}
                onNavigate={handleCopyMoveNavigate}
                isLoading={isCopyingFiles || isMovingFiles}
            />
        </div>
    );
};

export default MediaLibraryPage;
