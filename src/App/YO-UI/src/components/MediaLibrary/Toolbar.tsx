import { useTranslation } from 'react-i18next';
import React from 'react';
import {
    Home,
    ArrowUp,
    FolderPlus,
    Upload,
    Copy,
    Scissors,
    Trash2,
    CheckSquare,
    Grid3x3,
    List,
    ClipboardCopy,
} from 'lucide-react';
import { copyToClipboard } from '../../utils/mediaLibraryUtils';
import toaster from '../toster';

interface ToolbarProps {
    viewMode: 'grid' | 'list';
    currentPath: string;
    selectedCount: number;
    totalCount: number;
    onViewChange: (mode: 'grid' | 'list') => void;
    onHome: () => void;
    onUpDirectory: () => void;
    onNewFolder: () => void;
    onUpload: () => void;
    onCopy: () => void;
    onCut: () => void;
    onDelete: () => void;
    onSelectAll: () => void;
    canGoUp: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
    viewMode,
    currentPath,
    selectedCount,
    totalCount,
    onViewChange,
    onHome,
    onUpDirectory,
    onNewFolder,
    onUpload,
    onCopy,
    onCut,
    onDelete,
    onSelectAll,
    canGoUp,
}) => {
    const { t } = useTranslation();
    const allSelected = selectedCount > 0 && selectedCount === totalCount;
    const mediaPath = `/uploads/media${currentPath !== '/' ? currentPath : ''}`;

    const handleCopyPath = async () => {
        const success = await copyToClipboard(mediaPath);
        if (success) {
            toaster.success(t('MediaLibrary.Copy'));
        } else {
            toaster.error(t('MediaLibrary.Copy'));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Left side - View tabs */}
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold shadow-md">
                        {t('MediaLibrary.Contents')}
                    </div>
                </div>

                {/* Right side - Tools */}
                <div className="flex items-center flex-wrap gap-2">
                    {/* Path Display */}
                    <button
                        onClick={handleCopyPath}
                        className="hidden md:flex items-center gap-2 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono text-gray-600 dark:text-gray-400 group"
                        title={t('MediaLibrary.ClickToCopy')}
                    >
                        <span className="max-w-xs truncate">{mediaPath}</span>
                        <ClipboardCopy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Separator */}
                    <div className="hidden md:block w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* Navigation */}
                    <ToolButton
                        icon={<Home className="w-4 h-4" />}
                        label={t('MediaLibrary.Home')}
                        onClick={onHome}
                        title={t('MediaLibrary.Home')}
                    />
                    <ToolButton
                        icon={<ArrowUp className="w-4 h-4" />}
                        label={t('MediaLibrary.Up')}
                        onClick={onUpDirectory}
                        disabled={!canGoUp}
                        title={t('MediaLibrary.Up')}
                    />

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* File Operations */}
                    <ToolButton
                        icon={<Copy className="w-4 h-4" />}
                        label={t('MediaLibrary.Copy')}
                        onClick={onCopy}
                        disabled={selectedCount === 0}
                        title={t('MediaLibrary.Copy')}
                        variant={selectedCount > 0 ? 'primary' : 'default'}
                    />
                    <ToolButton
                        icon={<Scissors className="w-4 h-4" />}
                        label={t('MediaLibrary.Cut')}
                        onClick={onCut}
                        disabled={selectedCount === 0}
                        title={t('MediaLibrary.Cut')}
                        variant={selectedCount > 0 ? 'primary' : 'default'}
                    />
                    <ToolButton
                        icon={<Trash2 className="w-4 h-4" />}
                        label={t('MediaLibrary.Delete')}
                        onClick={onDelete}
                        disabled={selectedCount === 0}
                        title={t('MediaLibrary.Delete')}
                        variant={selectedCount > 0 ? 'danger' : 'default'}
                    />

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* Create Actions */}
                    <ToolButton
                        icon={<FolderPlus className="w-4 h-4" />}
                        label={t('MediaLibrary.NewFolder')}
                        onClick={onNewFolder}
                        title={t('MediaLibrary.NewFolder')}
                        variant="success"
                    />
                    <ToolButton
                        icon={<Upload className="w-4 h-4" />}
                        label={t('MediaLibrary.Upload')}
                        onClick={onUpload}
                        title={t('MediaLibrary.Upload')}
                        variant="success"
                    />

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* Selection */}
                    <ToolButton
                        icon={<CheckSquare className="w-4 h-4" />}
                        label={allSelected ? t('MediaLibrary.DeselectAll') : t('MediaLibrary.SelectAll')}
                        onClick={onSelectAll}
                        title={allSelected ? t('MediaLibrary.DeselectAll') : t('MediaLibrary.SelectAll')}
                        active={allSelected}
                    />

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* View Mode */}
                    <ToolButton
                        icon={<Grid3x3 className="w-4 h-4" />}
                        label={t('MediaLibrary.Grid')}
                        onClick={() => onViewChange('grid')}
                        active={viewMode === 'grid'}
                        title={t('MediaLibrary.Grid')}
                    />
                    <ToolButton
                        icon={<List className="w-4 h-4" />}
                        label={t('MediaLibrary.List')}
                        onClick={() => onViewChange('list')}
                        active={viewMode === 'list'}
                        title={t('MediaLibrary.List')}
                    />
                </div>
            </div>
        </div>
    );
};

// Tool Button Component
interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    title?: string;
    variant?: 'default' | 'primary' | 'success' | 'danger';
}

const ToolButton: React.FC<ToolButtonProps> = ({
    icon,
    label,
    onClick,
    disabled = false,
    active = false,
    title,
    variant = 'default',
}) => {
    const variantClasses = {
        default: active
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
            : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
        primary:
            'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
        success:
            'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30',
        danger:
            'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
                transition-all duration-200 transform active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${variantClasses[variant]}
            `}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

export default Toolbar;
