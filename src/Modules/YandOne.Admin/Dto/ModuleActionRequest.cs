using Microsoft.AspNetCore.Http;
using YandOne.Admin.ViewModel;

namespace YangOne.Admin.Dto;

public class ModuleActionRequest
{
    public string ModuleName { get; set; } = string.Empty;
}

public class LocalizationImportRequest
{
    public IFormFile? ImportFile { get; set; }
}

public class SetDefaultLocaleRequest
{
    public int LocaleRegionId { get; set; }
    public string Culture { get; set; } = string.Empty;
}

public class SetLanguageRequest
{
    public string Culture { get; set; } = string.Empty;
}


public class RenameFileRequest
{
    public string OldFileName { get; set; } = string.Empty;
    public string NewFileName { get; set; } = string.Empty;
    public string? Dir { get; set; }
}

public class UploadFileRequest
{
    public IFormFile? File { get; set; }
    public string? Dir { get; set; }
}

public class FileTransferRequest
{
    public List<MediaLibraryItem> Files { get; set; } = new();
    public string DestinationDir { get; set; } = string.Empty;
}

public class DeleteFilesRequest
{
    public List<MediaLibraryItem> Files { get; set; } = new();
}