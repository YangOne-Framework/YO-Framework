using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Web.Dto;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    public class HtmlComponentService: IHtmlComponentService
    {
        public CrudService<HtmlComponent> HtmlComponentCrudService { get; set; } = new();
        public async Task<IEnumerable<HtmlComponentDetailDto>> GetActivePagedAsync(int offset, int limit, string query)
        {
            var list = await HtmlComponentCrudService.GetListPagedAsync(
                offset,
                limit,
                limit,
                "Where IsActive=@IsActive and IsDeleted=@IsDeleted",
                "Name asc",
                new { IsActive = true, IsDeleted = false }
            );

            return list.Select(ToDetailDto);
        }

        public async Task<IEnumerable<HtmlComponentItemDto>> GetAllPagedAsync(int offset, int limit, string query)
        {
            var list = await HtmlComponentCrudService.GetListPagedAsync(
                offset,
                limit,
                limit,
                "Where IsDeleted=@IsDeleted",
                "Name asc",
                new { IsDeleted = false }
            );

            return list.Select(ToItemDto);
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
                    IsDeleted = false
                };

                entity.AutoFill();
                var newId = await HtmlComponentCrudService.InsertAsync<int>(entity);
                entity.HtmlComponentId = newId;
            }

            return ToDetailDto(entity);
        }

      

        private static HtmlComponentItemDto ToItemDto(HtmlComponent x) => new HtmlComponentItemDto
        {
            HtmlComponentId = x.HtmlComponentId,
            Name = x.Name,
            DisplayName = x.DisplayName,
            ShortDescription = x.ShortDescription,
            Icon = x.Icon,
            PreviewImage = x.PreviewImage,
            IsActive = x.IsActive
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
            Config = x.Config,
            ContentStructure = x.ContentStructure,
            HtmlTemplate = x.HtmlTemplate,
            StateSchema = x.StateSchema,
            ApiBindings = x.ApiBindings,
            EventBindings = x.EventBindings,
            RuntimeOptions = x.RuntimeOptions,
            Version = x.Version
        };
        public async Task<bool> DeleteAsync(int id)
        {
            await HtmlComponentCrudService.UpdateAsDeleted(id);
            return true;
        }
        public async Task<bool> IsNameUniqueAsync(string name,string oldName, int htmlComponentId =0)
        {
            if (string.IsNullOrWhiteSpace(name))
                return false;

            var normalized = name.Trim();

            if (htmlComponentId > 0)
            {
                if (!string.IsNullOrEmpty(oldName))
                {
                    if (oldName.Trim() == name.Trim())
                    {
                        return true;
                    }
                    else
                    {
                        var exist = await HtmlComponentCrudService.GetAsync("Where Name=@Name and IsDeleted=@IsDeleted", new { IsDeleted = false, Name = name });
                        if (exist == null)
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }
                    }
                }
                else
                {
                   var exist=await  HtmlComponentCrudService.GetAsync("Where Name=@Name and IsDeleted=@IsDeleted", new { IsDeleted=false,Name = name });
                   if (exist == null)
                   {
                       return true;
                   }
                   else
                   {
                       return false;
                   }
                }
            }
            else
            {
                var exist = await HtmlComponentCrudService.GetAsync("Where Name=@Name and IsDeleted=@IsDeleted", new { IsDeleted = false, Name = name });
                if (exist == null)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
                
        }

    }
}
