// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Security
{
    /// <summary>
    /// View model for displaying route collection information.
    /// </summary>
    public class RouteCollectionViewModel
    {
        public string Action { get; set; }
        public string Controller { get; set; }
        public string Area { get; set; }
        public string Name { get; set; }
        public string Template { get; set; }
    }
}

