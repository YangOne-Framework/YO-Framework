// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Data.Crud
{
    /// <summary>
    /// Resolves a type's table name for database queries.
    /// </summary>
    public interface ITableNameResolver
    {
        string ResolveTableName(Type type);
    }
}
