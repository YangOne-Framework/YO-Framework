// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Templating

{
    /// <summary>
    /// Defines configurable settings for a template.
    /// </summary>
    public interface ITemplateSettings
    {
        IEnumerable<TemplateSetting> Settings { get; set; }
    }
}
