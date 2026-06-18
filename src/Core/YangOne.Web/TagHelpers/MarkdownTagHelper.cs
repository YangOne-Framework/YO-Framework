// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace YangOne.Web.TagHelpers
{

    /// <summary>
    /// Converts Markdown text to HTML.
    /// </summary>
    [HtmlTargetElement("markdown")]
    public class MarkdownTagHelper : TagHelper
    {
        [HtmlAttributeName("text")]
        public string Text { get; set; }

        [HtmlAttributeName("source")]
        public ModelExpression Source { get; set; }
        public override void Process(TagHelperContext context, TagHelperOutput output)
        {

         
            if (Source != null)
            {
                Text = Source.Model.ToString();
            }
            else
            {
                Text = output.GetChildContentAsync().Result.GetContent();
            }

            string result = CommonMark.CommonMarkConverter.Convert(Text);
            output.TagName = "div";
            output.Content.SetHtmlContent(result);
            output.TagMode = TagMode.StartTagAndEndTag;
        }
    }
}
