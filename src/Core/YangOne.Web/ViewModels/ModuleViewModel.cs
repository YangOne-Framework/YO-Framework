// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data.Crud.Attribute;
using YangOne.Identity.Model;
using YangOne.Web.Module;

namespace YangOne.Web.ViewModels
{
    /// <summary>
    /// View model for displaying module information.
    /// </summary>
    public class ModuleViewModel
    {
        public string ModuleName { get; set; }
        public bool HasSetting { get; set; }
        public List<ModuleComponentDescription> ModuleComponents { get; set; }=new List<ModuleComponentDescription>();
    }

    /// <summary>
    /// View model for editing a role.
    /// </summary>
    public class RoleEditViewModel : IdentityRole
    {
        [IgnoreAll]
        public string OldName { get; set; }
    }



}
