// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Web.Dto;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    /// <summary>
    /// Manages HTML components including CRUD and catalog category filtering.
    /// </summary>
    public class HtmlComponentService : IHtmlComponentService
    {
        public CrudService<HtmlComponent> HtmlComponentCrudService { get; set; } = new();

        public async Task<IEnumerable<HtmlComponentDetailDto>> GetActivePagedAsync(
            int offset, int limit, string query, string category = null)
        {
            var list = await HtmlComponentCrudService.GetListPagedAsync(
                offset, limit, limit,
                "Where IsActive=@IsActive and IsDeleted=@IsDeleted",
                "Name asc",
                new { IsActive = true, IsDeleted = false }
            );

            var filtered = ApplyFilters(list.AsEnumerable(), query, category);
            return filtered.Select(ToDetailDto);
        }

        public async Task<IEnumerable<HtmlComponentItemDto>> GetAllPagedAsync(
            int offset, int limit, string query, string category = null)
        {
            var list = await HtmlComponentCrudService.GetListPagedAsync(
                offset, limit, limit,
                "Where IsDeleted=@IsDeleted",
                "Name asc",
                new { IsDeleted = false }
            );

            var filtered = ApplyFilters(list.AsEnumerable(), query, category);
            return filtered.Select(ToItemDto);
        }

        private static IEnumerable<HtmlComponent> ApplyFilters(
            IEnumerable<HtmlComponent> source, string query, string category)
        {
            var result = source;

            if (!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim();
                result = result.Where(x =>
                    (x.Name?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (x.DisplayName?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (x.ShortDescription?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (x.CatalogCategory?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                var c = category.Trim();
                result = result.Where(x =>
                    string.Equals(x.CatalogCategory, c, StringComparison.OrdinalIgnoreCase));
            }

            return result;
        }

        public async Task<HtmlComponentDetailDto> GetByIdAsync(int id)
        {
            var entity = await HtmlComponentCrudService.GetAsync(id);
            if (entity == null || entity.IsDeleted)
                throw new Exception("HtmlComponent not found");
            return ToDetailDto(entity);
        }

        public async Task<HtmlComponentDetailDto> SaveAsync(HtmlComponentSaveRequest dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            HtmlComponent entity;

            if (dto.HtmlComponentId > 0)
            {
                entity = await HtmlComponentCrudService.GetAsync(dto.HtmlComponentId);
                if (entity == null || entity.IsDeleted)
                    throw new Exception("HtmlComponent not found");

                entity.Name = dto.Name;
                entity.DisplayName = dto.DisplayName;
                entity.ShortDescription = dto.ShortDescription;
                entity.Icon = dto.Icon;
                entity.PreviewImage = dto.PreviewImage;
                entity.Config = dto.Config;
                entity.ContentStructure = dto.ContentStructure;
                entity.HtmlTemplate = dto.HtmlTemplate;
                entity.StateSchema = dto.StateSchema;
                entity.ApiBindings = dto.ApiBindings;
                entity.EventBindings = dto.EventBindings;
                entity.RuntimeOptions = dto.RuntimeOptions;
                entity.Version = dto.Version;
                entity.IsActive = dto.IsActive;
                entity.CatalogCategory = dto.CatalogCategory ?? entity.CatalogCategory;

                entity.AutoFill();
                await HtmlComponentCrudService.UpdateAsync(entity);
            }
            else
            {
                entity = new HtmlComponent
                {
                    Name = dto.Name,
                    DisplayName = dto.DisplayName,
                    ShortDescription = dto.ShortDescription,
                    Icon = dto.Icon,
                    PreviewImage = dto.PreviewImage,
                    Config = dto.Config,
                    ContentStructure = dto.ContentStructure,
                    HtmlTemplate = dto.HtmlTemplate,
                    StateSchema = dto.StateSchema,
                    ApiBindings = dto.ApiBindings,
                    EventBindings = dto.EventBindings,
                    RuntimeOptions = dto.RuntimeOptions,
                    Version = dto.Version,
                    IsActive = dto.IsActive,
                    IsDeleted = false,
                    CatalogCategory = dto.CatalogCategory
                };

                entity.AutoFill();
                var newId = await HtmlComponentCrudService.InsertAsync<int>(entity);
                entity.HtmlComponentId = newId;
            }

            return ToDetailDto(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await HtmlComponentCrudService.GetAsync(id);
            if (entity == null || entity.IsDeleted) return false;
            await HtmlComponentCrudService.UpdateAsDeleted(id);
            return true;
        }

        public async Task<bool> IsNameUniqueAsync(string name, string oldName, int htmlComponentId = 0)
        {
            if (string.IsNullOrWhiteSpace(name)) return false;

            if (htmlComponentId > 0 && !string.IsNullOrEmpty(oldName) &&
                oldName.Trim().Equals(name.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            var exist = await HtmlComponentCrudService.GetAsync(
                "Where Name=@Name and IsDeleted=@IsDeleted",
                new { IsDeleted = false, Name = name.Trim() });

            return exist == null;
        }

        private static HtmlComponentItemDto ToItemDto(HtmlComponent x) => new HtmlComponentItemDto
        {
            HtmlComponentId = x.HtmlComponentId,
            Name = x.Name,
            DisplayName = x.DisplayName,
            ShortDescription = x.ShortDescription,
            Icon = x.Icon,
            PreviewImage = x.PreviewImage,
            IsActive = x.IsActive,
            CatalogCategory = x.CatalogCategory
        };

        private static HtmlComponentDetailDto ToDetailDto(HtmlComponent x) => new HtmlComponentDetailDto
        {
            HtmlComponentId = x.HtmlComponentId,
            Name = x.Name,
            DisplayName = x.DisplayName,
            ShortDescription = x.ShortDescription,
            Icon = x.Icon,
            PreviewImage = x.PreviewImage,
            IsActive = x.IsActive,
            CatalogCategory = x.CatalogCategory,
            Config = x.Config,
            ContentStructure = x.ContentStructure,
            HtmlTemplate = x.HtmlTemplate,
            StateSchema = x.StateSchema,
            ApiBindings = x.ApiBindings,
            EventBindings = x.EventBindings,
            RuntimeOptions = x.RuntimeOptions,
            Version = x.Version
        };
    }
}
