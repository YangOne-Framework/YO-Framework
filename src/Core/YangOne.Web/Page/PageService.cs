using System;
using System.Data.Common;
using Dapper;
using YangOne.Web.Layout;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using YangOne.Caching;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Extensions;
using YangOne.Web.Model;

namespace YangOne.Web;

public class PageService : IPageService
{
    private readonly IWebHostEnvironment _hostingEnvironment;
    private readonly ILayoutRenderer _layoutRenderer;
    private readonly ISeoService _seoService;
    private readonly ICacheService _cacheService;

    public PageService(IWebHostEnvironment hostingEnvironment, ILayoutRenderer layoutRenderer, ISeoService seoService
        , ICacheService cacheService)
    {
        _hostingEnvironment = hostingEnvironment;
        _layoutRenderer = layoutRenderer;
        _seoService = seoService;
        _cacheService = cacheService;
    }
    public CrudService<Page> CrudService { get; set; } = new CrudService<Page>();

    // ========== Legacy Page Methods ==========

    public async Task<bool> CheckPageExist(string url)
    {
        var dbFactory = DbFactoryProvider.GetFactory();
        using (var db = (DbConnection)dbFactory.GetConnection())
        {
            await db.OpenAsync();
            var result = await db.QueryAsync<int>("Select 1 from Page Where IsActive=@isActive and IsDeleted= @isDeleted and URL=@URL", new { isActive = true, isDeleted = false, URL = url });
            return result != null && (result.SingleOrDefault() == 1 ? true : false);
        }
    }

    public string GetPageNamespaces(bool includeMasterLayout)
    {
        string viewImportsPath = Path.Combine(_hostingEnvironment.ContentRootPath, "Views\\_ViewImports.cshtml");
        string viewStartPath = Path.Combine(_hostingEnvironment.ContentRootPath, "Views\\_ViewStart.cshtml");

        if (File.Exists(viewImportsPath))
        {
            string fileContent = File.ReadAllText(viewImportsPath);
            if (includeMasterLayout)
            {
                if (File.Exists(viewStartPath))
                {
                    fileContent += "\n";
                    fileContent += File.ReadAllText(viewStartPath);
                }
            }
            return fileContent;
        }
        return "";
    }

    public async Task<PageViewModel> Get(int pageId)
    {
        var dbFactory = DbFactoryProvider.GetFactory();
        using (var db = (DbConnection)dbFactory.GetConnection())
        {
            await db.OpenAsync();
            var result =
                await db.QueryFirstAsync<PageViewModel>(
                    "select p.PageId,p.Name,p.Url,p.UseMasterLayout,p.IsBackend,p.IsActive,p.IsPublished,s.SEOId,s.MetaDescription,s.MetaTitle,s.Image from Page as p left join Seo as s on p.PageId=s.PageId and s.SeoType='page' where  p.IsDeleted = @IsDeleted and p.PageId = @PageId",
                    new { IsDeleted = false, PageId = pageId });
            return result;
        }
    }

    public async Task<bool> Save(PageViewModel model)
    {
        try
        {
            var dbfactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbfactory.GetConnection())
            {
                await db.OpenAsync();
                using (var tran = db.BeginTransaction())
                {
                    try
                    {
                        if (model.PageId == 0)
                        {
                            var seo = model.To<SEO>();
                            seo.Url = model.Url;
                            seo.PageName = model.Name;
                            var page = new Page()
                            {
                                PageId = model.PageId,
                                Name = model.Name,
                                Url = model.Url,
                                IsActive = model.IsActive,
                                IsPublished = model.IsPublished,
                                UseMasterLayout = model.UseMasterLayout
                            };
                            page.AutoFill();
                            int pageId = await CrudService.InsertAsync<int>(db, page, tran, 30);
                            seo.AutoFill();
                            seo.PageId = pageId;
                            seo.Url = model.Url.StartsWith("/") ? model.Url : "/" + model.Url;
                            int seoId = await _seoService.Seo.InsertAsync<int>(db, seo, tran, 30);
                            model.PageId = pageId;
                        }
                        else
                        {
                            var page = new Page()
                            {
                                PageId = model.PageId,
                                Name = model.Name,
                                Url = model.Url,
                                IsActive = model.IsActive,
                                IsPublished = model.IsPublished,
                                UseMasterLayout = model.UseMasterLayout
                            };
                            page.AutoFill();
                            await CrudService.UpdateAsync(db, page, tran, 30);
                            var seo = model.To<SEO>();
                            seo.Url = model.Url.StartsWith("/") ? model.Url : "/" + model.Url;
                            seo.LastUrl = model.Url != model.OldUrl ? model.OldUrl : model.Url;
                            seo.AutoFill();
                            seo.PageId = (int)model.PageId;
                            seo.PageName = page.Name;
                            if (seo.SEOId == 0)
                                await _seoService.Seo.InsertAsync<int>(db, seo, tran, 30);
                            else
                                await _seoService.Seo.UpdateAsync(db, seo, tran, 30);
                        }

                        tran.Commit();
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        throw;
                    }
                }
                return true;
            }
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<bool> SavePageLayout(LayoutContent content)
    {
        var renderedContent = _layoutRenderer.Render(content, LayoutGridSystem.BootStrap);
        var jsonContent = JsonConvert.SerializeObject(content);

        var dbFactory = DbFactoryProvider.GetFactory();
        using (var db = (DbConnection)dbFactory.GetConnection())
        {
            await db.OpenAsync();
            var result =
                await db.ExecuteAsync(
                    "Update Page Set Content=@Content,ContentConfig=@ContentConfig Where PageId=@PageId",
                    new { Content = renderedContent, ContentConfig = jsonContent, PageId = content.PageId });
            return true;
        }
    }

    public async Task<bool> DeletePageAsync(long pageId)
    {
        var page = await CrudService.GetAsync(pageId);
        if (page.Url.ToLower() == "landing")
        {
            throw new Exception("unable to use this url.enter another url.");
        }
        var dbFactory = DbFactoryProvider.GetFactory();
        using (var db = (DbConnection)dbFactory.GetConnection())
        {
            await db.OpenAsync();
            var result = await db.ExecuteAsync("Update Page Set IsDeleted=@IsDeleted, IsActive=@IsActive Where PageId=@PageId", new { IsActive = false, IsDeleted = true, PageId = pageId });
            var seoresult = await db.ExecuteAsync("Update Seo Set IsDeleted=@IsDeleted, IsActive=@IsActive Where  Url=@Url", new { IsActive = false, IsDeleted = true, Url = page.Url });
            return true;
        }
    }

    public async Task<bool> MakeLandingPage(long pageId)
    {
        var page = await CrudService.GetAsync(pageId);
        var dbFactory = DbFactoryProvider.GetFactory();
        using (var db = (DbConnection)dbFactory.GetConnection())
        {
            await db.OpenAsync();
            var result = await db.ExecuteAsync(" Update Page set Url=@RandomUrl Where Url='landing'; " +
                                               " Update Page set Url='landing',IsDeleted=false, IsActive=true,Ispublished=Ispublished " +
                                               " Where PageId=@PageId", new
                                               {
                                                   RandomUrl = "landing-" + new Random().Next(5000, 99999),
                                                   IsDeleted = false,
                                                   Ispublished = true,
                                                   PageId = pageId
                                               });
            return true;
        }
    }

    // ========== CMS Studio Page Methods ==========

    public async Task<CmsPageResult> GetBySlug(string slug, string status = "published")
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var data = await db.QueryFirstOrDefaultAsync<Page>(
                    "usp_YOPage_GetBySlug",
                    new { Slug = slug, Status = status },
                    commandType: System.Data.CommandType.StoredProcedure);

                return new CmsPageResult
                {
                    Success = data != null,
                    Message = data != null ? "Page found" : "Page not found",
                    Data = data
                };
            }
        }
        catch (Exception ex)
        {
            return new CmsPageResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<CmsPageResult> GetByPageUniqueId(string pageUniqueId)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var data = await db.QueryFirstOrDefaultAsync<Page>(
                    "usp_YOPage_GetByPageId",
                    new { PageUniqueId = pageUniqueId },
                    commandType: System.Data.CommandType.StoredProcedure);

                return new CmsPageResult
                {
                    Success = data != null,
                    Message = data != null ? "Page found" : "Page not found",
                    Data = data
                };
            }
        }
        catch (Exception ex)
        {
            return new CmsPageResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<CmsPageListResult> GetAllActive(int offset = 1, int limit = 20, string status = "all", string search = "", string culture = "")
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var data = (await db.QueryAsync<Page>(
                    "usp_YOPage_GetAllActive",
                    new { Offset = offset, Limit = limit, Status = status, Search = search, Culture = culture },
                    commandType: System.Data.CommandType.StoredProcedure)).ToList();

                var rowTotal = data.FirstOrDefault()?.RowTotal ?? 0;

                return new CmsPageListResult
                {
                    Success = true,
                    Message = "Success",
                    Data = data,
                    RowTotal = rowTotal
                };
            }
        }
        catch (Exception ex)
        {
            return new CmsPageListResult { Success = false, Message = ex.Message, Data = Enumerable.Empty<Page>() };
        }
    }

    public async Task<CmsPageResult> Save(CmsPageSaveRequest request)
    {
        try
        {
            var pageUniqueId = string.IsNullOrEmpty(request.PageId)
                ? Guid.NewGuid().ToString()
                : request.PageId;

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                // Only build ContentConfigDraft when actual content fields are provided
                var hasContent = request.Sections != null || request.Components != null
                    || request.MasterLayoutConfig != null || request.SeoSettings != null
                    || request.PageSettings != null;

                var contentConfigDraftJson = hasContent ? JsonConvert.SerializeObject(new
                {
                    masterLayoutConfig = DeserializeJson<object>(request.MasterLayoutConfig),
                    seo = DeserializeJson<object>(request.SeoSettings),
                    pageSettings = DeserializeJson<object>(request.PageSettings),
                    sections = DeserializeJson<object>(request.Sections),
                    components = DeserializeJson<object>(request.Components)
                }) : null;

                var result = await db.QueryFirstAsync(
                    "usp_YOPage_Save",
                    new
                    {
                        PageUniqueId = pageUniqueId,
                        Name = request.Title,
                        Slug = request.Slug,
                        Url = "/" + request.Slug.TrimStart('/'),
                        Status = request.Status ?? "draft",
                        PageType = "cms",
                        MasterLayoutId = request.MasterLayoutId,
                        ContentConfig = contentConfigDraftJson ?? "{}",
                        ContentConfigDraft = contentConfigDraftJson,
                        Version = request.Version,
                        PublishedAt = request.PublishedAt,
                        Culture = request.Culture ?? "en-US",
                        TemplateType = request.TemplateType ?? "page",
                        YOThemeId = request.YOThemeId,
                        UpdatedBy = 0
                    },
                    commandType: System.Data.CommandType.StoredProcedure);

                string action = result.Action;
                long pageId = Convert.ToInt64(result.PageId);

                var page = await CrudService.GetAsync(pageId);

                return new CmsPageResult
                {
                    Success = true,
                    Message = action == "inserted" ? "Page created" : "Page updated",
                    Data = page,
                    Action = action
                };
            }
        }
        catch (Exception ex)
        {
            return new CmsPageResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<CmsPageResult> Publish(string pageUniqueId)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result = await db.QueryFirstAsync(
                    "usp_YOPage_Publish",
                    new { PageUniqueId = pageUniqueId, UpdatedBy = 0 },
                    commandType: System.Data.CommandType.StoredProcedure);

                if (result.Action == "not_found")
                    return new CmsPageResult { Success = false, Message = "Page not found" };

                var page = await CrudService.GetAsync((long)result.PageId);
                return new CmsPageResult { Success = true, Message = "Page published", Data = page, Action = "published" };
            }
        }
        catch (Exception ex)
        {
            return new CmsPageResult { Success = false, Message = ex.Message };
        }
    }

    public async Task<bool> Delete(string pageUniqueId)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result = await db.QueryFirstAsync(
                    "usp_YOPage_Delete",
                    new { PageUniqueId = pageUniqueId, DeletedBy = 0 },
                    commandType: System.Data.CommandType.StoredProcedure);
                return result.Action == "deleted";
            }
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> CheckSlugExist(string slug, string excludePageUniqueId = null)
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var sql = "SELECT 1 FROM dbo.Page WHERE Slug = @Slug AND IsDeleted = 0";
                if (!string.IsNullOrEmpty(excludePageUniqueId))
                    sql += " AND PageUniqueId != @ExcludePageUniqueId";
                var result = await db.QueryAsync<int>(sql, new { Slug = slug, ExcludePageUniqueId = excludePageUniqueId });
                return result.Any();
            }
        }
        catch
        {
            return false;
        }
    }

    private static T DeserializeJson<T>(string json) where T : new()
    {
        if (string.IsNullOrEmpty(json)) return new T();
        try { return JsonConvert.DeserializeObject<T>(json); }
        catch { return new T(); }
    }
}
