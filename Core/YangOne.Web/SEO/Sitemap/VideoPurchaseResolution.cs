using System.Xml.Serialization;

namespace YangOne.Web
{
    public enum VideoPurchaseResolution
    {
        None,
        
        [XmlEnum("hd")]
        Hd,

        [XmlEnum("sd")]
        Sd
    }
}