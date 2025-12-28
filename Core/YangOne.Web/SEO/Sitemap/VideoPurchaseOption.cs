using System.Xml.Serialization;

namespace YangOne.Web
{
    public enum VideoPurchaseOption
    {
        None,
        
        [XmlEnum("rent")]
        Rent,

        [XmlEnum("own")]
        Own
    }
}