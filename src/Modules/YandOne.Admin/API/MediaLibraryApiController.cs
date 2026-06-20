// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
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
/// <summary>
/// Represents a class MediaLibraryApiController.
/// </summary>
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
    public async Task<ActionResult<ApiResponse<bool>>> SaveDirectory([FromBody] DirectoryViewModel model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<bool>(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            var status = await _mediaLibraryService.SaveDirecory(model);
            return SuccessResponse(status.Message ?? "Success", status.Success);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    
    [HttpPost("file/rename")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> RenameFile([FromBody] RenameFileRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<bool>(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            if (string.IsNullOrWhiteSpace(request.OldFileName) || string.IsNullOrWhiteSpace(request.NewFileName))
                return ErrorResponse<bool>(400, "OldFileName and NewFileName are required.");

            var status = await _mediaLibraryService.RenameFileName(
                request.OldFileName,
                request.NewFileName,
                request.Dir ?? string.Empty);

            if (!status.Success)
                return ErrorResponse<bool>(500, status.Message ?? "Rename failed.");

            return SuccessResponse(status.Message ?? "Renamed successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    
    [HttpGet("content/all")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> GetItemsByDirectory([FromQuery] string currentDir = "/")
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<object>();

            var items = await _mediaLibraryService.GetItemsByDirectory(currentDir);
            return SuccessResponse("Success", (object)items);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    
    [HttpGet("directory/all")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> GetDirectoriesOnly([FromQuery] string currentDir = "/")
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<object>();

            var items = await _mediaLibraryService.GetDirectoriesOnly(currentDir);
            return SuccessResponse("Success", (object)items);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    
    [HttpPost("file/upload")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    [RequestSizeLimit(long.MaxValue)]
    public async Task<ActionResult<ApiResponse<bool>>> UploadFile([FromForm] UploadFileRequest request)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            if (request.File == null || request.File.Length == 0)
                return ErrorResponse<bool>(400, "File is required.");

            var status = await _mediaLibraryService.SaveFile(request.File, request.Dir ?? string.Empty);

            if (!status.Success)
                return ErrorResponse<bool>(500, status.Message ?? "Upload failed.");

            return SuccessResponse(status.Message ?? "Uploaded successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    
    [HttpPost("file/copy")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> CopyFilesOrDirectories([FromBody] FileTransferRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<object>(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<object>();

            if (request.Files == null || request.Files.Count == 0)
                return ErrorResponse<object>(400, "Files list is required.");

            if (string.IsNullOrWhiteSpace(request.DestinationDir))
                return ErrorResponse<object>(400, "DestinationDir is required.");

            var status = await _mediaLibraryService.CopyFilesOrDir(request.Files, request.DestinationDir);
            return SuccessResponse("File copied successfully!", (object)status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    
    [HttpPost("file/move")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> MoveFilesOrDirectories([FromBody] FileTransferRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<object>(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<object>();

            if (request.Files == null || request.Files.Count == 0)
                return ErrorResponse<object>(400, "Files list is required.");

            if (string.IsNullOrWhiteSpace(request.DestinationDir))
                return ErrorResponse<object>(400, "DestinationDir is required.");

            var status = await _mediaLibraryService.MoveFilesOrDir(request.Files, request.DestinationDir);
            return SuccessResponse("File moved successfully!", (object)status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    
    [HttpPost("file/delete")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteFilesOrDirectories([FromBody] DeleteFilesRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<object>(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<object>();

            if (request.Files == null || request.Files.Count == 0)
                return ErrorResponse<object>(400, "Files list is required.");

            var status = await _mediaLibraryService.DeleteFilesOrDir(request.Files);
            return SuccessResponse("File deleted successfully!", (object)status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }
}
