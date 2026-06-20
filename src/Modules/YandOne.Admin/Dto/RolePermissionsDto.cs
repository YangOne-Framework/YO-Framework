// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Identity.Dto;
using YangOne.Web.Model;

namespace YangOne.Admin.Dto;

public class RolePermissionsDto
{
    public RolePermissionsDto() { }
    public RolePermissionsDto(List<UserRolesSelected> roles, IEnumerable<MasterRolePermission> rolePermission)
    {
        Roles = roles;
        RolePermission = rolePermission;
    }
    public List<UserRolesSelected> Roles { get; set; }
    public IEnumerable<MasterRolePermission> RolePermission { get; set; }
}
