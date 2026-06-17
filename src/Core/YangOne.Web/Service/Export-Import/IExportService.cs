// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Service
{
    public interface IExportService
    {
        Task<HttpResponseMessage> Export<T>(List<T> dataSources, string fileName, string sheetName);
    }
}
