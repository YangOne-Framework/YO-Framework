using YangOne.Data;
using YangOne.Web.Layout;

namespace YangOne.Web;

public interface IPageService
{
    CrudService<Page> CrudService { get; set; }

    // Legacy page methods
    Task<bool> CheckPageExist(string url);
    Task<bool> Save(PageViewModel model);
    Task<PageViewModel> Get(int pageId);
    string GetPageNamespaces(bool includeMasterLayout);
    Task<bool> SavePageLayout(LayoutContent content);
    Task<bool> DeletePageAsync(long pageId);
    Task<bool> MakeLandingPage(long pageId);

    // CMS Studio page methods
    Task<CmsPageResult> GetBySlug(string slug, string status = "published");
    Task<CmsPageResult> GetByPageUniqueId(string pageUniqueId);
    Task<CmsPageListResult> GetAllActive(int offset = 1, int limit = 20, string status = "all", string search = "", string culture = "");
    Task<CmsPageResult> Save(CmsPageSaveRequest request);
    Task<CmsPageResult> Publish(string pageUniqueId);
    Task<bool> Delete(string pageUniqueId);
    Task<bool> CheckSlugExist(string slug, string excludePageUniqueId = null);
}

public class CmsPageResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public Page Data { get; set; }
    public string Action { get; set; }
}

public class CmsPageListResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public IEnumerable<Page> Data { get; set; }
    public int RowTotal { get; set; }
}

public class CmsPageSaveRequest
{
    public string PageId { get; set; }
    public string Title { get; set; }
    public string Slug { get; set; }
    public string Status { get; set; }
    public string MasterLayoutId { get; set; }
    public string MasterLayoutConfig { get; set; }
    public string SeoSettings { get; set; }
    public string PageSettings { get; set; }
    public string Sections { get; set; }
    public string Components { get; set; }
    public int Version { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string Culture { get; set; }
    public string TemplateType { get; set; }
    public long? YOThemeId { get; set; }
}
