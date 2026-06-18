// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Layout
{
    /// <summary>
    /// Renders layout content to a string representation.
    /// </summary>
    public interface ILayoutRenderer
    {
        string Render(LayoutContent layoutContent , LayoutGridSystem gridSystem);
    }
}
