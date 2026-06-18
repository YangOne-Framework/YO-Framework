// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Service
{
    /// <summary>
    /// Defines the contract for data import operations.
    /// </summary>
    public interface IImportService
    {
        List<T> Import<T>(IFormFile file);
        List<T> Import<T>(string filePath);
    }
}

    
