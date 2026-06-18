// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;

namespace YangOne.Data.Crud
{
    /// <summary>
    /// Resolves a property's column name for database queries.
    /// </summary>
    public interface IColumnNameResolver
    {
        string ResolveColumnName(PropertyInfo propertyInfo);
    }
}
