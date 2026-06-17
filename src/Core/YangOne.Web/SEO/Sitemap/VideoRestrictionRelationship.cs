// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Xml.Serialization;

namespace YangOne.Web
{
    public enum VideoRestrictionRelationship
    {
        [XmlEnum("allow")]
        Allow,

        [XmlEnum("deny")]
        Deny
    }
}
