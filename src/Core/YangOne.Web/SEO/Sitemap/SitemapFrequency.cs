// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Xml.Serialization;

namespace YangOne.Web
{
    public enum SitemapFrequency
    {
        [XmlEnum("always")]
        Always,

        [XmlEnum("hourly")]
        Hourly,

        [XmlEnum("daily")]
        Daily,

        [XmlEnum("weekly")]
        Weekly,

        [XmlEnum("monthly")]
        Monthly,

        [XmlEnum("yearly")]
        Yearly,

        /// <summary>
        /// The value "never" should be used to describe archived URLs.
        /// </summary>
        [XmlEnum("never")]
        Never
    }
}
