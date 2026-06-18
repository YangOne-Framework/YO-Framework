// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Localization
{
    /// <summary>
    /// Defines operations for retrieving localized string resources.
    /// </summary>
    public interface ILocaleResourceProvider
    {
        void LookUpGroupAt(string groupName);
        void ResetLookUpGroup();
        string Get(string key);
        string Get(string key, string culture);
        IEnumerable<LocaleResource> GetByGroup(string groupName);
        IEnumerable<LocaleResource> GetByGroup(string groupName, string culture);
    }
}
