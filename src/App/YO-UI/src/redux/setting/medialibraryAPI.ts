import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import type {
    DirectoryViewModel,
    MediaLibraryItem,
    MediaLibraryStatus,
    RenameFileRequest,
    UploadFileRequest,
    FileTransferRequest,
    DeleteFilesRequest,
} from "../../types/mediaLibraryTypes";

interface ApiResponse<T> {
    Code: number;
    Message: string;
    Data: T;
    Errors: string[];
}

export const mediaLibraryAPI = createApi({
    reducerPath: "mediaLibraryAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["MediaLibrary"],
    endpoints: (builder) => ({
        saveDirectory: builder.mutation<MediaLibraryStatus, DirectoryViewModel>({
            query: (data) => ({
                url: API.MEDIA_LIBRARY.DIRECTORY_SAVE,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<boolean>) => ({
                Success: response.Code === 200,
                Message: response.Message,
            }),
            invalidatesTags: ["MediaLibrary"],
        }),

        renameFile: builder.mutation<MediaLibraryStatus, RenameFileRequest>({
            query: (data) => ({
                url: API.MEDIA_LIBRARY.FILE_RENAME,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<boolean>) => ({
                Success: response.Code === 200,
                Message: response.Message,
            }),
            invalidatesTags: ["MediaLibrary"],
        }),

        getItemsByDirectory: builder.query<MediaLibraryItem[], { currentDir?: string }>({
            query: ({ currentDir = "/" }) => ({
                url: API.MEDIA_LIBRARY.CONTENT_ALL(currentDir),
                method: "GET",
            }),
            transformResponse: (response: ApiResponse<MediaLibraryItem[]>) => response.Data || [],
            providesTags: ["MediaLibrary"],
        }),

        getDirectoriesOnly: builder.query<MediaLibraryItem[], { currentDir?: string }>({
            query: ({ currentDir = "/" }) => ({
                url: API.MEDIA_LIBRARY.DIRECTORY_ALL(currentDir),
                method: "GET",
            }),
            transformResponse: (response: ApiResponse<MediaLibraryItem[]>) => response.Data || [],
            providesTags: ["MediaLibrary"],
        }),

        uploadFile: builder.mutation<MediaLibraryStatus, UploadFileRequest>({
            query: ({ File, Dir }) => {
                const formData = new FormData();
                if (File) formData.append("File", File);
                if (Dir != null) formData.append("Dir", Dir);
                return {
                    url: API.MEDIA_LIBRARY.FILE_UPLOAD,
                    method: "POST",
                    body: formData,
                };
            },
            transformResponse: (response: ApiResponse<boolean>) => ({
                Success: response.Code === 200,
                Message: response.Message,
            }),
            invalidatesTags: ["MediaLibrary"],
        }),

        copyFilesOrDirectories: builder.mutation<MediaLibraryStatus, FileTransferRequest>({
            query: (data) => ({
                url: API.MEDIA_LIBRARY.FILE_COPY,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<boolean>) => ({
                Success: response.Code === 200,
                Message: response.Message,
            }),
            invalidatesTags: ["MediaLibrary"],
        }),

        moveFilesOrDirectories: builder.mutation<MediaLibraryStatus, FileTransferRequest>({
            query: (data) => ({
                url: API.MEDIA_LIBRARY.FILE_MOVE,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<boolean>) => ({
                Success: response.Code === 200,
                Message: response.Message,
            }),
            invalidatesTags: ["MediaLibrary"],
        }),

        deleteFilesOrDirectories: builder.mutation<MediaLibraryStatus, DeleteFilesRequest>({
            query: (data) => ({
                url: API.MEDIA_LIBRARY.FILE_DELETE,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<boolean>) => ({
                Success: response.Code === 200,
                Message: response.Message,
            }),
            invalidatesTags: ["MediaLibrary"],
        }),
    }),
});

export const {
    useSaveDirectoryMutation,
    useRenameFileMutation,
    useGetItemsByDirectoryQuery,
    useGetDirectoriesOnlyQuery,
    useUploadFileMutation,
    useCopyFilesOrDirectoriesMutation,
    useMoveFilesOrDirectoriesMutation,
    useDeleteFilesOrDirectoriesMutation,
} = mediaLibraryAPI;
