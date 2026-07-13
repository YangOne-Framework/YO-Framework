// TypeScript types matching C# DTOs for Media Library

export interface DirectoryViewModel {
    DirName: string;
    IsRename: boolean;
    DirPath: string;
    OldDirName?: string;
}

export interface MediaLibraryStatus {
    Success: boolean;
    Message: string;
}

export interface MediaLibraryItem {
    IsDirectory: boolean;
    FileName: string;
    RDirectoryPath: string;
    RFilePath: string;
    CreationTime: string; // DateTime as ISO string
    FileSize: string;
}

export interface MediaLibraryImage {
    FileName: string;
    RPath: string;
    CreationTime: string; // DateTime as ISO string
    FileSize: string;
}

export interface RenameFileRequest {
    OldFileName: string;
    NewFileName: string;
    Dir?: string | null;
}

export interface UploadFileRequest {
    File?: File | null;
    Dir?: string | null;
}

export interface FileTransferRequest {
    Files: MediaLibraryItem[];
    DestinationDir: string;
}

export interface DeleteFilesRequest {
    Files: MediaLibraryItem[];
}

// UI State Types
export type ViewMode = 'grid' | 'list';
export type OperationMode = 'copy' | 'move';

export interface MediaLibraryState {
    currentDirectory: string;
    viewMode: ViewMode;
    selectedItems: MediaLibraryItem[];
    operationMode: OperationMode | null;
}

// Modal State Types
export interface NewFolderModalState {
    isOpen: boolean;
}

export interface UploadModalState {
    isOpen: boolean;
    useChunkUpload: boolean;
}

export interface CopyMoveModalState {
    isOpen: boolean;
    mode: OperationMode;
}

export interface RenameModalState {
    isOpen: boolean;
    item: MediaLibraryItem | null;
}

// Utility types
export interface FileTypeInfo {
    icon: string;
    color: string;
    type: string;
}
