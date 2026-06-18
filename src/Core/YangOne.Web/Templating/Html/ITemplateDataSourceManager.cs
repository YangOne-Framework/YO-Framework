// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Templating
{
    /// <summary>
    /// Manages template data sources and provides lookup by type and key.
    /// </summary>
    public interface ITemplateDataSourceManager
    {
        void GetAllTemplateDataSource();

        IEnumerable<ITemplateDataSource> GetTemplateDataSource(TemplateTypes type);
        ITemplateDataSource FindByKey(TemplateTypes type, string key);
        Task<object> FetchTemplateData<T>(string key);
        Dictionary<string, object> GetDataMembers(TemplateTypes type, string key);

    }
}
