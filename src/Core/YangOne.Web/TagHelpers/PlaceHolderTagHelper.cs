// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace YangOne.Web.TagHelpers
{
    [HtmlTargetElement("placeholder")]
    public class PlaceHolderTagHelper : TagHelper
    {

        [HtmlAttributeName("name")]
        public string Name { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var childContent = await output.GetChildContentAsync();
            //var modalContext = (ModalContext)context.Items[typeof(ModalTagHelper)];
            //modalContext.Body = childContent;
            //output.SuppressOutput();
            //LOAD view components here
            output.TagName = "div";
            output.Attributes.Add("class", "row");
            // Component.InvokeAsync("Simple", new { number = 5 })
            output.Content.SetHtmlContent(childContent);
            output.TagMode = TagMode.StartTagAndEndTag;
        }
    }
}
