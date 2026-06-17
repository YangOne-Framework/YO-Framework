// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Templating
{
    public interface ITemplateDataSource
    {
        TemplateTypes Type { get; }
        string Key { get; }
        Task RenderSource();
        Task RenderSource(Dictionary<string,object> parameters);
    }
}
