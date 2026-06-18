// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web.Layout;

namespace YangOne.Web
{
    /// <summary>
    /// View model that combines page data with its associated layout content.
    /// </summary>
    public class PageConfigViewModel: Page
    {
        public LayoutContent Layout{ get; set; }
    }
}
