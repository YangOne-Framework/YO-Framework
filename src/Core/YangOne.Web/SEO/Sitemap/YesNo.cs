using System.Xml.Serialization;

namespace YangOne.Web
{
    public enum YesNo
    {
        None,

        [XmlEnum("yes")]
        Yes,

        [XmlEnum("no")]
        No
    }
}