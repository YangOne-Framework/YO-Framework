using CommonMark;

namespace YangOne.Web.Extensions
{
   
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