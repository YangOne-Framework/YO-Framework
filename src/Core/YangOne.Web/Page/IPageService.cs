using YangOne.Data;
using YangOne.Web.Layout;

namespace YangOne.Web
{
    public interface IPageService
    {
        CrudService<Page> CrudService { get; set; }
        Task<bool> CheckPageExist(string url);
        Task<bool> Save(PageViewModel model);
        Task<PageViewModel> Get(int pageId);
        string GetPageNamespaces(bool includeMasterLayout);
        Task<bool> SavePageLayout(LayoutContent content);
        Task<bool> DeletePageAsync(long pageId);
        Task<bool> MakeLandingPage(long pageId);
    }
}