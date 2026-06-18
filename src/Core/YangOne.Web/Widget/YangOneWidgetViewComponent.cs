// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    /// <summary>
    /// Base view component for widgets.
    /// </summary>
    public abstract class YangOneWidgetViewComponent<T> : YangOneViewComponent where T : IWidget, new()
    {

        public override bool IsVisibleOnUI { get; } = false;

    }
}
