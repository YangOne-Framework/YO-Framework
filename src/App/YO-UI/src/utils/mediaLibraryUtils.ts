import type { FileTypeInfo } from '../types/mediaLibraryTypes';

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

/**
 * Check if file is an image
 */
export const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];
    const ext = getFileExtension(fileName);
    return imageExtensions.includes(ext);
};

/**
 * Get file type info (icon, color, type name)
 */
export const getFileTypeInfo = (fileName: string): FileTypeInfo => {
    const ext = getFileExtension(fileName);

    const typeMap: Record<string, FileTypeInfo> = {
        // Images
        png: { icon: 'image', color: 'text-purple-500', type: 'PNG Image' },
        jpg: { icon: 'image', color: 'text-purple-500', type: 'JPEG Image' },
        jpeg: { icon: 'image', color: 'text-purple-500', type: 'JPEG Image' },
        gif: { icon: 'image', color: 'text-purple-500', type: 'GIF Image' },
        webp: { icon: 'image', color: 'text-purple-500', type: 'WebP Image' },
        svg: { icon: 'image', color: 'text-purple-500', type: 'SVG Image' },

        // Documents
        pdf: { icon: 'picture_as_pdf', color: 'text-red-500', type: 'PDF Document' },
        doc: { icon: 'description', color: 'text-blue-500', type: 'Word Document' },
        docx: { icon: 'description', color: 'text-blue-500', type: 'Word Document' },
        xls: { icon: 'grid_on', color: 'text-green-600', type: 'Excel Spreadsheet' },
        xlsx: { icon: 'grid_on', color: 'text-green-600', type: 'Excel Spreadsheet' },
        ppt: { icon: 'slideshow', color: 'text-orange-500', type: 'PowerPoint' },
        pptx: { icon: 'slideshow', color: 'text-orange-500', type: 'PowerPoint' },
        txt: { icon: 'article', color: 'text-gray-500', type: 'Text File' },

        // Videos
        mp4: { icon: 'movie', color: 'text-pink-500', type: 'MP4 Video' },
        mov: { icon: 'movie', color: 'text-pink-500', type: 'MOV Video' },
        avi: { icon: 'movie', color: 'text-pink-500', type: 'AVI Video' },
        mkv: { icon: 'movie', color: 'text-pink-500', type: 'MKV Video' },

        // Archives
        zip: { icon: 'archive', color: 'text-yellow-600', type: 'ZIP Archive' },
        rar: { icon: 'archive', color: 'text-yellow-600', type: 'RAR Archive' },
        '7z': { icon: 'archive', color: 'text-yellow-600', type: '7Z Archive' },

        // Code
        js: { icon: 'code', color: 'text-yellow-500', type: 'JavaScript' },
        ts: { icon: 'code', color: 'text-blue-400', type: 'TypeScript' },
        jsx: { icon: 'code', color: 'text-cyan-500', type: 'React JSX' },
        tsx: { icon: 'code', color: 'text-cyan-500', type: 'React TSX' },
        html: { icon: 'code', color: 'text-orange-600', type: 'HTML' },
        css: { icon: 'code', color: 'text-blue-600', type: 'CSS' },
        json: { icon: 'code', color: 'text-green-500', type: 'JSON' },
    };

    return typeMap[ext] || { icon: 'insert_drive_file', color: 'text-gray-400', type: 'File' };
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (size: number): string => {
    if (size === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));

    return Math.round((size / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date to readable format
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Get CDN path for media
 */
export const getMediaPath = (relativePath: string): string => {
    const cdnPath = import.meta.env.VITE_CDN_PATH || '';
    const mediaRoot = '/uploads/media';

    if (relativePath.startsWith('http')) {
        return relativePath;
    }

    return `${cdnPath}${mediaRoot}${relativePath}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const tempInput = document.createElement('input');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            return true;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};

/**
 * Get parent directory path
 */
export const getParentDirectory = (path: string): string => {
    if (path === '/' || !path) return '/';

    // Remove trailing slash if present
    const cleanPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

    // Get parent by removing last segment
    const lastSlashIndex = cleanPath.lastIndexOf('/');

    if (lastSlashIndex === 0) {
        // If last slash is at position 0, parent is root
        return '/';
    }

    return cleanPath.substring(0, lastSlashIndex) || '/';
};

/**
 * Build breadcrumb array from path
 */
export const buildBreadcrumbs = (path: string): Array<{ name: string; path: string }> => {
    if (path === '/') return [{ name: 'Home', path: '/' }];

    const parts = path.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];

    let currentPath = '';
    parts.forEach((part) => {
        currentPath += `/${part}`;
        breadcrumbs.push({ name: part, path: currentPath + '/' });
    });

    return breadcrumbs;
};
