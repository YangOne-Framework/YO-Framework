// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data.Crud;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Defines a service for running database scripts.
    /// </summary>
    public interface IScriptRunner
    {
        Task<bool> Run(string[] scripts);
        Task<bool> Run(Dialect dialect, string connectionString, string[] scripts);
        Task<bool> CheckConnection(Dialect dialect, string connectionString);
    }
}
