// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    /// <summary>
    /// Defines the contract for audit-related operations.
    /// </summary>
    public interface IAuditService
    {
        CrudService<Audit> CrudService { get; set; }
    }
}

