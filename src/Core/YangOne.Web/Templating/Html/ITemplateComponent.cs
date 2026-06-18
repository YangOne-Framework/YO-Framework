// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Templating
{
    /// <summary>
    /// Defines a template component with configurable settings.
    /// </summary>
    public interface ITemplateComponent
    {
        ITemplateSettings TemplateSettings { get; set; }
    }
}
