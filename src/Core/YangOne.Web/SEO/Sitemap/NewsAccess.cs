// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Xml.Serialization;

namespace YangOne.Web
{
    /// <summary>
    /// Specifies the access level for news articles in the sitemap.
    /// </summary>
    public enum NewsAccess
    {
        [XmlEnum]
        Subscription,

        [XmlEnum]
        Registration
    }
}
