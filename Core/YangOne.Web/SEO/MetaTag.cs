using System.Collections.Concurrent;
using System.Text;

namespace YangOne.Web
{
    public class MetaTag : IMetaTag
    {
        public ConcurrentDictionary<string, string> MetaKeyValues { get; set; }

        public MetaTag(ConcurrentDictionary<string, string> metaKeyValues)
        {
            MetaKeyValues = metaKeyValues;
        }

        public string Generate()
        {
            StringBuilder tagBuilder = new StringBuilder();

            foreach (var keyvalue in MetaKeyValues)
            {
                tagBuilder.AppendFormat("<meta name=\"{0}\" content=\"{1}\" />", keyvalue.Key, keyvalue.Value);

            }
            return tagBuilder.ToString();
        }
    }
}
