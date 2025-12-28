using YangOne.Data;
using YangOne.Web.Dto;
using YangOne.Web.Model;

namespace YangOne.Web.Service;

public interface IHtmlComponentService
{
    CrudService<HtmlComponent> HtmlComponentCrudService { get; set; }

    Task<IEnumerable<HtmlComponentDetailDto>> GetActivePagedAsync(int offset, int limit, string query);
    Task<IEnumerable<HtmlComponentItemDto>> GetAllPagedAsync(int offset, int limit, string query);

    Task<HtmlComponentDetailDto> GetByIdAsync(int id);

    Task<HtmlComponentDetailDto> SaveAsync(HtmlComponentSaveRequest dto);

    Task<bool> DeleteAsync(int id);
    Task<bool> IsNameUniqueAsync(string name, string oldName, int htmlComponentId);

}