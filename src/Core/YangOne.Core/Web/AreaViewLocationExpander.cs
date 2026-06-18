// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc.Razor;

namespace YangOne.Web
{
    /// <summary>
    /// Expands Razor view locations to include area-specific paths.
    /// </summary>
    public class AreaViewLocationExpander : IYangOneViewLocationExpander
    {
        public void PopulateValues(ViewLocationExpanderContext context)
        {
            // nothing here
        }

        public IEnumerable<string> ExpandViewLocations(ViewLocationExpanderContext context, IEnumerable<string> viewLocations)
        {
            var area =
                context.ActionContext.ActionDescriptor.RouteValues.FirstOrDefault(rc => rc.Key == "area");
            var additionalLocations = new LinkedList<string>();
            //TODO:: check for null
            //if (area !=null)
            //{
            additionalLocations.AddLast($"/Views/{area.Key}" + "{1}/{0}.cshtml");
            // }
            return viewLocations.Concat(additionalLocations);
        }
    }
}
