// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using CommonMark;

namespace YangOne.Web.Extensions
{
   
    /// <summary>
    /// Extension methods for converting Markdown content to HTML.
    /// </summary>
    public static class MarkdownHelper
    {
        public static string ToHtml(this string content)
        {
            var markdown = content;
            var html = CommonMarkConverter.Convert(markdown);
            return html ?? "";
        }
    }
}
