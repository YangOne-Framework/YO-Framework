// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Concurrent;
using System.Text;

namespace YangOne.Web
{
    /// <summary>
    /// Generates the HTML title tag from key-value pairs.
    /// </summary>
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
