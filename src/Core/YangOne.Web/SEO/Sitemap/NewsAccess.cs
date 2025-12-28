using System.Xml.Serialization;

namespace YangOne.Web
{
    public enum NewsAccess
    {
        [XmlEnum]
        Subscription,

        [XmlEnum]
        Registration
    }
}