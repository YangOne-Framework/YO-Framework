// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    public interface IDashboardWidgetManager
    {
        Task<IEnumerable<DashboardWidgetConfig>> GetDashboardWidgetConfigs(string dashboardName);

        Task<IEnumerable<DashboardWidgetConfig>> GetAllWidgets();

        Task<bool> SaveDashboardWidgets(string dashboardName,
            IEnumerable<DashboardWidgetConfig> widgetConfigs);


        Task<bool> ResetDashboardWidgets(string dashboardName);
    }
}
