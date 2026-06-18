// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Data;
using YangOne.Data.Crud;
using YangOne.Log;

namespace YangOne.Data
{
    /// <summary>
    /// Defines a factory for creating database connections and providing dialect-specific query building.
    /// </summary>
    public interface IDatabaseFactory : IDisposable
    {
        IDbConnection Db { get; }
        Dialect Dialect { get; }
        QueryBuilder QueryBuilder { get; }
        IDbConnection GetConnection();
        ILogger DbLogger { get; set; }
     }
}
