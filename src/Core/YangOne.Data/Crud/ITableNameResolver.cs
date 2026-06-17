// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Data.Crud
{
    public interface ITableNameResolver
    {
        string ResolveTableName(Type type);
    }
}
