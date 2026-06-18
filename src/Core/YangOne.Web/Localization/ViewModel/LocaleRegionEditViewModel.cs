// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Localization
{
    /// <summary>
    /// View model for editing a locale region and its resources.
    /// </summary>
    public class LocaleRegionEditViewModel : LocaleRegion
    {
        public List<EditLocaleResource> Resources { get; set; }

    }
}
