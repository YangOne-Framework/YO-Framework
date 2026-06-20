// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace YangOne.Web.Security.API
{
    /// <summary>
    /// Service for managing API security configuration.
    /// </summary>
    public interface IApiConfigService
    {
        Task<ApiConfig> GetConfigAsync();
        Task SaveConfigAsync(ApiConfig config);
    }
}

