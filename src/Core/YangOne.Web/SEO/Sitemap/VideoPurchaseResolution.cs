// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Xml.Serialization;

namespace YangOne.Web
{
    /// <summary>
    /// Specifies the resolution option for a video in the sitemap.
    /// </summary>
    public enum VideoPurchaseResolution
    {
        None,
        
        [XmlEnum("hd")]
        Hd,

        [XmlEnum("sd")]
        Sd
    }
}
