using System.Collections.Concurrent;
using System.Text;

namespace YangOne.Web
{
    public class TitleTag : IMetaTag
    {
        public ConcurrentDictionary<string, string> MetaKeyValues { get; set; }

        public TitleTag(ConcurrentDictionary<string, string> metaKeyValues)
        {
            MetaKeyValues = metaKeyValues;
        }

        public string Generate()
        {
            StringBuilder tagBuilder = new StringBuilder();

            foreach (var keyvalue in MetaKeyValues)
            {
                tagBuilder.AppendFormat("<title >{0}</title>", keyvalue.Value);

            }
            return tagBuilder.ToString();
        }

    }
}