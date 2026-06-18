// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;

namespace YangOne.Identity.Service
{ 
    /// <summary>
    /// Defines the contract for role identity services.
    /// </summary>
    public interface IIdentityRoleService
    {
        CrudService<IdentityRole> RoleService { get; set; }

        Task<IEnumerable<IdentityRole>> GetUserRolesAsync(long identityUserId);
        Task<bool> CheckNameExist(string roleName);
        Task<List<int>> GetRoleIds(string[] roleNames);
        Task<List<BasicUserDetails>> GetUserByRolesName(string rolename);
    }
}
