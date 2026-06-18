// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data.Crud;

namespace YangOne.Data
{
    /// <summary>
    /// PostgreSQL-specific query builder implementation.
    /// </summary>
    public sealed class NpgSqlQueryBuilder : QueryBuilder
    {
        public NpgSqlQueryBuilder(ISQLTemplate template, ITableNameResolver tblresolver, IColumnNameResolver colresolver)
            : base(template, tblresolver, colresolver)
        {
        }
        public NpgSqlQueryBuilder(ISQLTemplate template)
            : base(template)
        {
        }
    }
}
