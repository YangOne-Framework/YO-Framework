// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    public interface IWidget
    {
        string SystemName { get; }
        string Description { get; set; }
        string Author { get; set; }
        IEnumerable<WidgetSetting> Settings { get; set; }
        //Task<IHtmlContent> Render();
        Type WidgetViewComponent { get; set; }
    }
}

