using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YandOne.Admin.Service;
using YandOne.Admin.ViewModel;
using YangOne.Admin.Dto;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;

namespace YandOne.Admin.API;

[Route("api/v1/media-library")]
public class MediaLibraryApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IMediaLibraryService _mediaLibraryService;

    public MediaLibraryApiController(
        ILogger logger,
        IMediaLibraryService mediaLibraryService)
    {
        _logger = logger;
        _mediaLibraryService = mediaLibraryService;
    }

    
    [HttpPost("directory/save")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveDirectory([FromBody] DirectoryViewModel model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var status = await _mediaLibraryService.SaveDirecory(model);
            return SuccessResponse(status.Message ?? "Success", status.Success);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    
    [HttpPost("file/rename")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> RenameFile([FromBody] RenameFileRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (string.IsNullOrWhiteSpace(request.OldFileName) || string.IsNullOrWhiteSpace(request.NewFileName))
                return ErrorResponse(400, "OldFileName and NewFileName are required.");

            var status = await _mediaLibraryService.RenameFileName(
                request.OldFileName,
                request.NewFileName,
                request.Dir ?? string.Empty);

            if (!status.Success)
                return ErrorResponse(500, status.Message ?? "Rename failed.");

            return SuccessResponse(status.Message ?? "Renamed successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpGet("content/all")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetItemsByDirectory([FromQuery] string currentDir = "/")
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var items = await _mediaLibraryService.GetItemsByDirectory(currentDir);
            return SuccessResponse("Success", items);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpGet("directory/all")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetDirectoriesOnly([FromQuery] string currentDir = "/")
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var items = await _mediaLibraryService.GetDirectoriesOnly(currentDir);
            return SuccessResponse("Success", items);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    
    [HttpPost("file/upload")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    [RequestSizeLimit(long.MaxValue)]
    public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (request.File == null || request.File.Length == 0)
                return ErrorResponse(400, "File is required.");

            var status = await _mediaLibraryService.SaveFile(request.File, request.Dir ?? string.Empty);

            if (!status.Success)
                return ErrorResponse(500, status.Message ?? "Upload failed.");

            return SuccessResponse(status.Message ?? "Uploaded successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpPost("file/copy")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> CopyFilesOrDirectories([FromBody] FileTransferRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (request.Files == null || request.Files.Count == 0)
                return ErrorResponse(400, "Files list is required.");

            if (string.IsNullOrWhiteSpace(request.DestinationDir))
                return ErrorResponse(400, "DestinationDir is required.");

            var status = await _mediaLibraryService.CopyFilesOrDir(request.Files, request.DestinationDir);
            return SuccessResponse("File copied successfully!", status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpPost("file/move")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> MoveFilesOrDirectories([FromBody] FileTransferRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (request.Files == null || request.Files.Count == 0)
                return ErrorResponse(400, "Files list is required.");

            if (string.IsNullOrWhiteSpace(request.DestinationDir))
                return ErrorResponse(400, "DestinationDir is required.");

            var status = await _mediaLibraryService.MoveFilesOrDir(request.Files, request.DestinationDir);
            return SuccessResponse("File moved successfully!", status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpPost("file/delete")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteFilesOrDirectories([FromBody] DeleteFilesRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (request.Files == null || request.Files.Count == 0)
                return ErrorResponse(400, "Files list is required.");

            var status = await _mediaLibraryService.DeleteFilesOrDir(request.Files);
            return SuccessResponse("File deleted successfully!", status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}