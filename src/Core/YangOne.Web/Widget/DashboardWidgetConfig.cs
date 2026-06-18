// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    /// <summary>
    /// Configuration for a dashboard widget's position and appearance.
    /// </summary>
    public class DashboardWidgetConfig
    {
        public int x { get; set; }
        public int y { get; set; }
        public int width { get; set; }
        public int height { get; set; }
        public string WidgetSystemName { get; set; }
        public string DisplayName { get; set; }
        public IEnumerable<WidgetSetting> Settings { get; set; }

    }
    /// <summary>
    /// View model for dashboard widget configuration including widget instance.
    /// </summary>
    public class DashboardWidgetConfigViewModel
    {
        public int x { get; set; }
        public int y { get; set; }
        public int width { get; set; }
        public int height { get; set; }
        public string WidgetSystemName { get; set; }
        public string DisplayName { get; set; }
        public IEnumerable<WidgetSetting> Settings { get; set; }
        public IWidget Widget { get; set; }

    }
}
