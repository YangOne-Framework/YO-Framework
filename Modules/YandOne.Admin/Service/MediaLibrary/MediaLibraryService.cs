using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using YandOne.Admin.Service;
using YandOne.Admin.ViewModel;
using YangOne.Extensions;
using YangOne.Storage;

namespace YangOne.Admin.Service
{
    public class MediaLibraryService : IMediaLibraryService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IStorageProvider _storageProvider;
        public string mediaLibraryRootPath = "";

        public MediaLibraryService(IWebHostEnvironment webHostEnvironment, IStorageProvider storageProvider)
        {
            _webHostEnvironment = webHostEnvironment;
            _storageProvider = storageProvider;
            mediaLibraryRootPath = Path.Combine(_webHostEnvironment.WebRootPath, MediaLibConst.MediaLibRootPath);
        }
        public async Task<MediaLibraryStatus> SaveDirecory(DirectoryViewModel model)
        {
            if (!string.IsNullOrEmpty(model.DirPath))
            {
                model.DirPath = model.DirPath.TrimStart('/');
            }
            model.DirName = model.DirName.TrimStart('/');
            string newDirectory = string.IsNullOrEmpty(model.DirPath) ? Path.Combine(mediaLibraryRootPath, model.DirName) : Path.Combine(mediaLibraryRootPath, model.DirPath, model.DirName);

            if (!Directory.Exists(newDirectory))
            {
                if (model.IsRename)
                {
                    string oldDirectory = string.IsNullOrEmpty(model.DirPath) ? Path.Combine(mediaLibraryRootPath, model.OldDirName) : Path.Combine(mediaLibraryRootPath, model.DirPath, model.OldDirName);

                    //rename
                    Directory.Move(oldDirectory, newDirectory);
                    return new MediaLibraryStatus
                    {
                        Success = true
                    };
                }
                else
                {
                    Directory.CreateDirectory(newDirectory);
                    return new MediaLibraryStatus
                    {
                        Success = true
                    };
                }
            }

            return new MediaLibraryStatus
            {
                Success = false,
                Message = "Directory already exists."
            }; ;
        }

        public async Task<MediaLibraryStatus> MoveFileToDirecory(string filePath, string toDirectory)
        {
            var phy_filePath = Path.Combine(mediaLibraryRootPath, filePath);
            string newDirectory = Path.Combine(mediaLibraryRootPath, toDirectory);
            string fileName = Path.GetFileName(phy_filePath);
            if (File.Exists(phy_filePath))
            {
                File.Move(phy_filePath, Path.Combine(newDirectory, fileName), true);
                return new MediaLibraryStatus
                {
                    Success = true
                };
            }
            return new MediaLibraryStatus
            {
                Success = false,
                Message = "Unable to move file."
            }; ;
        }
        public bool IsFileLocked(string filePath, int secondsToWait)
        {
            bool isLocked = true;
            int i = 0;

            while (isLocked && ((i < secondsToWait) || (secondsToWait == 0)))
            {
                try
                {
                    using (File.Open(filePath, FileMode.Open)) { }
                    return false;
                }
                catch (IOException e)
                {
                    var errorCode = Marshal.GetHRForException(e) & ((1 << 16) - 1);
                    isLocked = errorCode == 32 || errorCode == 33;
                    i++;

                    if (secondsToWait != 0)
                        new System.Threading.ManualResetEvent(false).WaitOne(1000);
                }
            }

            return isLocked;
        }
        public async Task<MediaLibraryStatus> RenameFileName(string oldFileName, string newFileName, string dir = "/")
        {
            oldFileName = oldFileName.TrimStart('/');
            var phy_filePath = Path.Combine(mediaLibraryRootPath, oldFileName);
            string currentDirectory = Path.GetDirectoryName(phy_filePath);
            string fullPathOnly = Path.GetFullPath(currentDirectory);

            string newPath = Path.Combine(fullPathOnly, newFileName);
            System.IO.File.Move(phy_filePath, newPath+Path.GetExtension(phy_filePath), true);

            return new MediaLibraryStatus
            {
                Success = true,
                Message = "File has been renamed."
            }; ;


        }

        public async Task<IEnumerable<MediaLibraryItem>> GetItemsByDirectory(string currentDir)
        {
            var mediaLibItems = new List<MediaLibraryItem>();
            var currentPath = "";
            currentDir = currentDir.ToRelativePath();
            if (currentDir == "/")
            {
                currentPath = Path.Combine(mediaLibraryRootPath);
            }
            else
            {
                currentDir = currentDir.TrimStart('/');
                currentPath = Path.Combine(mediaLibraryRootPath, currentDir);
            }
            var fileLists = Directory
                .GetFiles(currentPath, "*", SearchOption.TopDirectoryOnly)
                .Select((x) => new FileInfo(x))
                .ToList();
            var dirInfos = Directory
                .GetDirectories(currentPath, "*", SearchOption.TopDirectoryOnly)
                .Select((x) => new DirectoryInfo(x))
                .ToList();
            foreach (var fileInfo in fileLists)
            {
                mediaLibItems.Add(new MediaLibraryItem
                {
                    IsDirectory = false,
                    CreationTime = fileInfo.CreationTime,
                    RFilePath = fileInfo.FullName.ToRelativePath().Replace(mediaLibraryRootPath.ToRelativePath(), ""),
                    FileName = fileInfo.Name,
                    FileSize = fileInfo.Length.ToFileSize()

                });
            }
            foreach (var dirInfo in dirInfos)
            {
                mediaLibItems.Add(new MediaLibraryItem
                {
                    IsDirectory = true,
                    FileName = dirInfo.Name,
                    RDirectoryPath = dirInfo.FullName.ToRelativePath().Replace(mediaLibraryRootPath.ToRelativePath(), ""),
                    CreationTime = dirInfo.CreationTime,

                });
            }

            return mediaLibItems.OrderBy(x => x.FileName).ToList();
        }

        public async Task<MediaLibraryStatus> SaveFile(IFormFile file, string dir)
        {
            dir = dir.ToRelativePath();
            dir = dir.TrimStart('/');

            var spath = Path.Combine("media", dir);
            await _storageProvider.Save(spath, file);
            return new MediaLibraryStatus
            {
                Success = true,
                Message = "file saved successfully."
            }; ;
        }

        public async Task<IEnumerable<MediaLibraryImage>> GetAllImages(int offset, int limit, string dir)
        {
            var mediaLibItems = new List<MediaLibraryImage>();
            var currentPath = "";
            dir = dir.ToRelativePath();
            if (dir == "/")
            {
                currentPath = Path.Combine(mediaLibraryRootPath);
            }
            else
            {
                dir = dir.TrimStart('/');
                currentPath = Path.Combine(mediaLibraryRootPath, dir);
            }
            var imageLists = Directory
                .GetFiles(currentPath, "*.png", SearchOption.AllDirectories)
                .Union(Directory
                    .GetFiles(currentPath, "*.jpg", SearchOption.AllDirectories))
                .Union(Directory
                    .GetFiles(currentPath, "*.jpeg", SearchOption.AllDirectories))
                .Select((x) => new FileInfo(x))
                .ToList();
            var pagedImages = imageLists.Page(offset, limit);
            foreach (var fileInfo in pagedImages)
            {
                mediaLibItems.Add(new MediaLibraryImage
                {
                    CreationTime = fileInfo.CreationTime,
                    RPath = fileInfo.FullName.ToRelativePath().Replace(mediaLibraryRootPath.ToRelativePath(), ""),
                    FileName = fileInfo.Name,
                    FileSize = fileInfo.Length.ToFileSize()

                });
            }

            return mediaLibItems;
        }
        public async Task<IEnumerable<MediaLibraryImage>> GetAllFiles(int offset, int limit, string dir)
        {
            var mediaLibItems = new List<MediaLibraryImage>();
            var currentPath = "";
            dir = dir.ToRelativePath();
            if (dir == "/")
            {
                currentPath = Path.Combine(mediaLibraryRootPath);
            }
            else
            {
                dir = dir.TrimStart('/');
                currentPath = Path.Combine(mediaLibraryRootPath, dir);
            }
            var imageLists = Directory
                .GetFiles(currentPath, "*.pdf", SearchOption.AllDirectories)
                .Union(Directory
                    .GetFiles(currentPath, "*.docx", SearchOption.AllDirectories))
                .Union(Directory
                    .GetFiles(currentPath, "*.doc", SearchOption.AllDirectories))
                .Union(Directory
                    .GetFiles(currentPath, "*.exls", SearchOption.AllDirectories))
                .Select((x) => new FileInfo(x))
                .ToList();
            var pagedImages = imageLists.Page(offset, limit);
            foreach (var fileInfo in pagedImages)
            {
                mediaLibItems.Add(new MediaLibraryImage
                {
                    CreationTime = fileInfo.CreationTime,
                    RPath = fileInfo.FullName.ToRelativePath().Replace(mediaLibraryRootPath.ToRelativePath(), ""),
                    FileName = fileInfo.Name,
                    FileSize = fileInfo.Length.ToFileSize()

                });
            }

            return mediaLibItems;
        }
        public async Task<IEnumerable<MediaLibraryItem>> GetDirectoriesOnly(string currentDir)
        {
            var mediaLibItems = new List<MediaLibraryItem>();
            var currentPath = "";
            currentDir = currentDir.ToRelativePath();
            if (currentDir == "/")
            {
                currentPath = Path.Combine(mediaLibraryRootPath);
            }
            else
            {
                currentDir = currentDir.TrimStart('/');
                currentPath = Path.Combine(mediaLibraryRootPath, currentDir);
            }
            var dirInfos = Directory
                .GetDirectories(currentPath, "*", SearchOption.TopDirectoryOnly)
                .Select((x) => new DirectoryInfo(x))
                .ToList();

            foreach (var dirInfo in dirInfos)
            {
                mediaLibItems.Add(new MediaLibraryItem
                {
                    IsDirectory = true,
                    FileName = dirInfo.Name,
                    RDirectoryPath = dirInfo.FullName.ToRelativePath().Replace(mediaLibraryRootPath.ToRelativePath(), ""),
                    CreationTime = dirInfo.CreationTime,

                });
            }

            return mediaLibItems.OrderBy(x => x.FileName).ToList();
        }

        public async Task<bool> CopyFilesOrDir(List<MediaLibraryItem> files, string destinationDir)
        {
            if (!string.IsNullOrEmpty(destinationDir))
            {
                destinationDir = destinationDir.TrimStart('/');
            }

            string phyDestinationPath = Path.Combine(mediaLibraryRootPath, destinationDir);


            foreach (var fileOrDir in files)
            {
                if (fileOrDir.IsDirectory)
                {
                    var dirPath = fileOrDir.RDirectoryPath.TrimStart('/');
                    var sourcePath = Path.Combine(mediaLibraryRootPath, dirPath);
                    string[] sfiles = System.IO.Directory.GetFiles(sourcePath);


                    var dirs = System.IO.Directory.GetDirectories(sourcePath);
                    foreach (var dir in dirs)
                    {
                        var directoryName = System.IO.Path.GetDirectoryName(sourcePath);
                        var destDir = System.IO.Path.Combine(phyDestinationPath, directoryName);
                        if (!Directory.Exists(destDir))
                            Directory.CreateDirectory(destinationDir);
                    }
                    // Copy the files and overwrite destination files if they already exist.
                    foreach (string s in sfiles)
                    {
                        // Use static Path methods to extract only the file name from the path.
                        var fileName = System.IO.Path.GetFileName(s);
                        var destFile = System.IO.Path.Combine(phyDestinationPath, fileName);
                        System.IO.File.Copy(s, destFile, true);
                    }
                }
                else
                {
                    var filePath = fileOrDir.RFilePath.TrimStart('/');
                    var sourcePath = Path.Combine(mediaLibraryRootPath, filePath);
                    var fileName = System.IO.Path.GetFileName(sourcePath);
                    var destFile = System.IO.Path.Combine(phyDestinationPath, fileName);
                    if (File.Exists(destFile))
                    {
                        var destFile2 = System.IO.Path.Combine(phyDestinationPath, DateTime.Now.ToString("MM-dd-yyyy-hh-mm") + "_" + fileName);
                        System.IO.File.Copy(sourcePath, destFile2, true);
                    }
                    else
                    {
                        System.IO.File.Copy(sourcePath, destFile, true);
                    }
                }
            }

            return true;
        }
        public async Task<bool> MoveFilesOrDir(List<MediaLibraryItem> files, string destinationDir)
        {
            if (!string.IsNullOrEmpty(destinationDir))
            {
                destinationDir = destinationDir.TrimStart('/');
            }

            string phyDestinationPath = Path.Combine(mediaLibraryRootPath, destinationDir);


            foreach (var fileOrDir in files)
            {
                if (fileOrDir.IsDirectory)
                {

                    var dirPath = fileOrDir.RDirectoryPath.TrimStart('/');
                    var sourcePath = Path.Combine(mediaLibraryRootPath, dirPath);
                    Directory.Move(sourcePath, Path.Combine(phyDestinationPath, fileOrDir.FileName));

                }
                else
                {
                    var filePath = fileOrDir.RFilePath.TrimStart('/');
                    var sourcePath = Path.Combine(mediaLibraryRootPath, filePath);
                    var fileName = System.IO.Path.GetFileName(sourcePath);
                    var destFile = System.IO.Path.Combine(phyDestinationPath, fileName);
                    System.IO.File.Move(sourcePath, destFile, true);
                }
            }

            return true;
        }

        public async Task<bool> DeleteFilesOrDir(List<MediaLibraryItem> files)
        {
            foreach (var fileOrDir in files)
            {
                if (fileOrDir.IsDirectory)
                {

                    var dirPath = fileOrDir.RDirectoryPath.TrimStart('/');
                    var sourcePath = Path.Combine(mediaLibraryRootPath, dirPath);
                    Directory.Delete(sourcePath, true);

                }
                else
                {
                    var filePath = fileOrDir.RFilePath.TrimStart('/');
                    var sourcePath = Path.Combine(mediaLibraryRootPath, filePath);
                    System.IO.File.Delete(sourcePath);
                }
            }

            return true;
        }

        public async Task<IEnumerable<MediaLibraryImage>> GetVideos(int offset, int limit, string dir)
        {
            var mediaLibItems = new List<MediaLibraryImage>();
            var currentPath = "";
            dir = dir.ToRelativePath();
            if (dir == "/")
            {
                currentPath = Path.Combine(mediaLibraryRootPath);
            }
            else
            {
                dir = dir.TrimStart('/');
                currentPath = Path.Combine(mediaLibraryRootPath, dir);
            }
            var imageLists = Directory
                .GetFiles(currentPath, "*.mp4", SearchOption.AllDirectories)

                .Select((x) => new FileInfo(x))
                .ToList();
            var pagedImages = imageLists.Page(offset, limit);
            foreach (var fileInfo in pagedImages)
            {
                mediaLibItems.Add(new MediaLibraryImage
                {
                    CreationTime = fileInfo.CreationTime,
                    RPath = fileInfo.FullName.ToRelativePath().Replace(mediaLibraryRootPath.ToRelativePath(), ""),
                    FileName = fileInfo.Name,
                    FileSize = fileInfo.Length.ToFileSize()

                });
            }

            return mediaLibItems;
        }
    }
}
