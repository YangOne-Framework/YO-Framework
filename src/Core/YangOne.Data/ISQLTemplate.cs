// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Data
{
    public interface ISQLTemplate
    {
        string Select { get; }
        string IdentitySql { get;  }
        string PaginatedSql { get; }
        string Encapsulation { get; }
    }
}
