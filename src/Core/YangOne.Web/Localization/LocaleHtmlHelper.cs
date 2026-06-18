// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Localization
{
    /// <summary>
    /// HTML helper extensions for retrieving localized values.
    /// </summary>
    public static class LocaleHtmlHelper
    {


        public static string LocaleValue(this HtmlHelper helper, string key)
        {
            var service=(ILocaleResourceProvider)ContextResolver.Context.RequestServices.GetService<ILocaleResourceProvider>();
            return service.Get(key);
        }
        public static string LocaleValue(this HtmlHelper helper, string key,string culture)
        {
            var service = (ILocaleResourceProvider)ContextResolver.Context.RequestServices.GetService<ILocaleResourceProvider>();
            return service.Get(key, culture);
        }
        public static IEnumerable<LocaleResource> LocaleValuesByGroup(this HtmlHelper helper, string groupName)
        {
            var service = (ILocaleResourceProvider)ContextResolver.Context.RequestServices.GetService<ILocaleResourceProvider>();
            return service.GetByGroup(groupName);
        }
        public static IEnumerable<LocaleResource> LocaleValuesByGroup(this HtmlHelper helper, string groupName, string culture)
        {
            var service = (ILocaleResourceProvider)ContextResolver.Context.RequestServices.GetService<ILocaleResourceProvider>();
            return service.GetByGroup(groupName, culture);
        }
    }
}
