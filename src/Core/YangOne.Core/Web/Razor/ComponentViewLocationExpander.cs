// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc.Razor;

namespace YangOne.Web
{
    /// <summary>
    /// Expands Razor view locations to support component views.
    /// </summary>
    public class ComponentViewLocationExpander : IYangOneViewLocationExpander
    {
        private const string _componentKey = "component";

        public IEnumerable<string> ExpandViewLocations(ViewLocationExpanderContext context, IEnumerable<string> viewLocations)
        {
            
            var componentViewLocation = new string[]
            {
                "{0}.cshtml"
                       
            };
            viewLocations = componentViewLocation.Concat(viewLocations);
            return viewLocations;
           
        }

        public void PopulateValues(ViewLocationExpanderContext context)
        {
        }
    }
}
