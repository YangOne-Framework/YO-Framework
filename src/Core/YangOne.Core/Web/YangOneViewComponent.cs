// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;

namespace YangOne.Web;

/// <summary>
/// Base class for YangOne view components with display metadata.
/// </summary>
public abstract class YangOneViewComponent : ViewComponent
{

    public abstract string DisplayName { get; }

    public abstract bool IsVisibleOnUI { get; }

}
