// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Theme
{
    public interface IThemeManager
    {
        Task<bool> Install(ThemeInfo theme);
        Task<bool> Uninstall(ThemeInfo theme);
        Task<bool> SetDefault(ThemeInfo theme);
         Task<ThemeInfo> GetThemeInfo(string themeName);
        Task<IEnumerable<ThemeInfo>> GetThemes(string query, int page, int limit);
        Task<ThemeStatus> UnzipAndInstall(IFormFile modelThemeZip);
    }
}
