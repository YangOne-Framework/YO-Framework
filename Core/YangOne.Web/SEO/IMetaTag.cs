using System.Collections.Concurrent;
namespace YangOne.Web
{
    public interface IMetaTag
    {
        ConcurrentDictionary<string, string> MetaKeyValues { get; set; }

        string Generate();

    }
}