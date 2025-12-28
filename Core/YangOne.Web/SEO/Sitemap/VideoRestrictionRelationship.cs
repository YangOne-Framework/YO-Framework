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