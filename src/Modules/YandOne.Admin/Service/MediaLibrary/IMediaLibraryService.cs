// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using YandOne.Admin.ViewModel;

namespace YandOne.Admin.Service
{
    /// <summary>
    /// Represents a interface IMediaLibraryService.
    /// </summary>
    public interface IMediaLibraryService
    {

        Task<MediaLibraryStatus> SaveDirectory(DirectoryViewModel model);
        Task<MediaLibraryStatus> MoveFileToDirectory(string filePath,string toDirectory);
        Task<MediaLibraryStatus> RenameFileName(string oldFileName, string newFileName, string dir="");
        Task<IEnumerable<MediaLibraryItem>> GetItemsByDirectory(string currentDir);
        Task<MediaLibraryStatus> SaveFile(IFormFile file,string dir);


        Task<IEnumerable<MediaLibraryImage>> GetAllImages(int offset, int limit, string dir);
        Task<IEnumerable<MediaLibraryImage>> GetAllFiles(int offset, int limit, string dir);
        Task<IEnumerable<MediaLibraryItem>> GetDirectoriesOnly(string currentDir);
        Task<bool> CopyFilesOrDir(List<MediaLibraryItem> files, string destinationDir);
        Task<bool> MoveFilesOrDir(List<MediaLibraryItem> files, string destinationDir);
        Task<bool> DeleteFilesOrDir(List<MediaLibraryItem> files);
        Task<IEnumerable<MediaLibraryImage>> GetVideos(int offset, int limit, string dir);
    }
}
