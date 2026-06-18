// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Services
{
    /// <summary>
    /// Defines the contract for file storage and management operations.
    /// </summary>
    public interface IFileService
    {
        string Save(IFormFile file);
        string Save(string dirPath,IFormFile file);
        string CheckOrCreateDirectory(string path);
        void Delete(string dirPath, string filePath);
    }
}
