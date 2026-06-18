// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Xml.Serialization;

namespace YangOne.Web
{
    /// <summary>
    /// Represents a ternary Yes/No/None value used in sitemap XML serialization.
    /// </summary>
    public enum YesNo
    {
        None,

        [XmlEnum("yes")]
        Yes,

        [XmlEnum("no")]
        No
    }
}
