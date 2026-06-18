// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    /// <summary>
    /// Provides audit logging functionality by managing audit records.
    /// </summary>
    public class AuditService : IAuditService
    {
        public CrudService<Audit> CrudService { get; set; }=new CrudService<Audit>();
    }
}
