// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Dto;

namespace YangOne.Web.Service;

/// <summary>
/// Defines the contract for HTML component operations.
/// </summary>
public interface IHtmlComponentService
{
    CrudService<Model.HtmlComponent> HtmlComponentCrudService { get; set; }

    Task<IEnumerable<HtmlComponentDetailDto>> GetActivePagedAsync(int offset, int limit, string query, string category = null);
    Task<IEnumerable<HtmlComponentItemDto>> GetAllPagedAsync(int offset, int limit, string query, string category = null);

    Task<HtmlComponentDetailDto> GetByIdAsync(int id);

    Task<HtmlComponentDetailDto> SaveAsync(HtmlComponentSaveRequest dto);

    Task<bool> DeleteAsync(int id);
    Task<bool> IsNameUniqueAsync(string name, string oldName, int htmlComponentId);
}
