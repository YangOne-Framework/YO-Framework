// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;

namespace YangOne.Web.Theme
{
    public interface IThemeResolver
    {
        string Resolve(ControllerContext controllerContext, string theme);
    }
}
