// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Data
{
    /// <summary>
    /// Defines SQL template properties for a specific database dialect.
    /// </summary>
    public interface ISQLTemplate
    {
        string Select { get; }
        string IdentitySql { get;  }
        string PaginatedSql { get; }
        string Encapsulation { get; }
    }
}
