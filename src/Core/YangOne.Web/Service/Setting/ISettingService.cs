// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    /// <summary>
    /// Defines the contract for application setting operations.
    /// </summary>
    public interface ISettingService
    {
        CrudService<Setting> CrudService { get; set; }
        Task<Setting> GetSetting();
        Task<Setting> SaveSetting(Setting setting);
        Task<Setting> SaveSetting(Setting setting, long userId);
    }
}
