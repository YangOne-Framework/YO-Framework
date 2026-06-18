// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web.Model;

namespace YandOne.Admin.ViewModel
{
    /// <summary>
    /// Represents a class MenuPermissionViewModel.
    /// </summary>
    public class MenuPermissionViewModel : MenuPermission{

        public string RoleName { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }

    }
}

