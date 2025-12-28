using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using YangOne.BlogEngine.Model;
using YangOne.BlogEngine.ViewModel;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Extensions;
using YangOne.Log;
using YangOne.Web;
using YangOne.Web.Model;

namespace YangOne.BlogEngine.Service
{
    public class BlogService : IBlogService
    {
        private readonly ILogger _logger;
        private readonly ISeoService _seoService;

        public BlogService(ILogger logger,ISeoService seoService)
        {
            _logger = logger;
            _seoService = seoService;
        }
        public CrudService<PostCategory> CategoryService { get; set; } = new CrudService<PostCategory>();
        public CrudService<Post> PostCrudService { get; set; } = new CrudService<Post>();
        public CrudService<PostSetting> SettingCrudService { get; set; } = new CrudService<PostSetting>();

        public async Task<long> SavePost(Post model)
        {

            var dbfactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbfactory.GetConnection())
            {
                await db.OpenAsync();
                using (var tran = db.BeginTransaction())
                {
                    try
                    {
                        if (model.PostId == 0)
                        {
                            var id = await PostCrudService.InsertAsync<long>(db, model, tran, 30);
                            tran.Commit();
                            return id;
                        }
                        else
                        {
                            await PostCrudService.UpdateAsync(db, model, tran, 30);
                            tran.Commit();
                            return model.PostId;
                        }
                    }
                    catch (Exception e)
                    {
                        _logger.Log(LogType.Error, () => e.Message, e);

                        throw e;
                    }
                }

            }


        }


        public async Task<long> SavePost(SavePostViewModel model)
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
                            if (model.PostId == 0)
                            {
                                var seo = model.To<SEO>();
                                seo.Url = model.Url;
                                seo.PageName = model.Title;
                                var post = model.To<Post>();
                                post.AutoFill();
                                var postId = await PostCrudService.InsertAsync<long>(db, post, tran, 30);
                                seo.AutoFill();
                                seo.PageId = (int)postId;
                                seo.Url = model.Url.StartsWith("/") ? model.Url : "/" + model.Url;
                                int seoId = await _seoService.Seo.InsertAsync<int>(db, seo, tran, 30);
                                //return newProductId;
                                model.PostId = postId;
                            }
                            else
                            {
                                var post = model.To<Post>();
                                post.AutoFill();
                                await PostCrudService.UpdateAsync(db, post, tran, 30);
                                var seo = model.To<SEO>();
                                seo.Url = model.Url.StartsWith("/") ? model.Url : "/" + model.Url;
                                seo.LastUrl = model.Url != model.OldUrl ? model.OldUrl : model.Url;
                                seo.AutoFill();
                                seo.PageId = (int)model.PostId;
                                seo.PageName = post.Title;
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
                            throw ex;
                        }
                    }
                    return model.PostId;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<PostWithAuthor>> GetPostWithAuthor(int page,int limit)
        {
            try
            {
               
                var dbfactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbfactory.GetConnection())
                {
                    await db.OpenAsync();
                   
                
                    string sql = @"SELECT COUNT(1) OVER() AS RowTotal,p.Title,p.Image,p.Author,p.Categories,p.Content,p.PostAuthorId,p.PostId,p.Tags,p.ViewCount,p.Url
                        ,p.AddedOn,p.PublishedOn,a.FirstName,a.LastName,a.Bio as Bio,a.Email as AuthorEmail,a.ProfilePicture as AuthorImage,a.IdentityUserId 
                        FROM dbo.Post as p inner join dbo.AppUser as a on p.PostAuthorId = a.IdentityUserId where p.IsActive = @IsActive and p.IsDeleted = @IsDeleted " +
                        "Order By p.AddedOn desc OFFSET @PageNumber - 1 ROWS FETCH NEXT @RowsPerPage ROWS ONLY";

                    IEnumerable<PostWithAuthor> model = await db.QueryAsync<PostWithAuthor>(sql, new { IsActive=true, IsDeleted=false, PageNumber = page, RowsPerPage = limit });    
                
                    return model;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



        public async Task<IEnumerable<PostWithAuthor>> GetPostByAuthor(int page, int limit, string authorName = "")
        {
            try
            {

                var dbfactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbfactory.GetConnection())
                {
                    await db.OpenAsync();


                    string sql = @"SELECT COUNT(1) OVER() AS RowTotal,p.Title,p.Image,p.Author,p.Categories,p.Content,p.PostAuthorId,p.PostId,p.Tags,p.ViewCount,p.Url
                        ,p.AddedOn,p.PublishedOn,a.FirstName,a.LastName,a.Bio as Bio,a.Email as AuthorEmail,a.ProfilePicture as AuthorImage,a.IdentityUserId 
                    FROM dbo.Post as p inner join dbo.AppUser as a on p.PostAuthorId = a.IdentityUserId where p.Author = @AuthorName and p.IsActive = @IsActive and p.IsDeleted = @IsDeleted " +
                        "Order By p.AddedOn desc OFFSET @PageNumber - 1 ROWS FETCH NEXT @RowsPerPage ROWS ONLY";

                    IEnumerable<PostWithAuthor> model = await db.QueryAsync<PostWithAuthor>(sql, new { IsActive = true, IsDeleted = false, AuthorName = authorName, PageNumber = page, RowsPerPage = limit });

                    return model;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<PostWithAuthor>> GetPostByTitle(int page, int limit, string title = "")
        {
            try
            {

                var dbfactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbfactory.GetConnection())
                {
                    await db.OpenAsync();


                    string sql = @"SELECT COUNT(1) OVER() AS RowTotal,p.Title,p.Image,p.Author,p.Categories,p.Content,p.PostAuthorId,p.PostId,p.Tags,p.ViewCount,p.Url
                        ,p.AddedOn,p.PublishedOn,a.FirstName,a.LastName,a.Bio as Bio,a.Email as AuthorEmail,a.ProfilePicture as AuthorImage,a.IdentityUserId 
                    FROM dbo.Post as p inner join dbo.AppUser as a on p.PostAuthorId = a.IdentityUserId where p.Title like @Title and p.IsActive = @IsActive and p.IsDeleted = @IsDeleted " +
                        "Order By p.AddedOn desc OFFSET @PageNumber - 1 ROWS FETCH NEXT @RowsPerPage ROWS ONLY";

                    IEnumerable<PostWithAuthor> model = await db.QueryAsync<PostWithAuthor>(sql, new { IsActive = true, IsDeleted = false, Title = "%"+title+"%", PageNumber = page, RowsPerPage = limit });

                    return model;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<PostWithAuthor>> GetPostByTags(int page, int limit, string tag = "")
        {
            try
            {

                var dbfactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbfactory.GetConnection())
                {
                    await db.OpenAsync();


                    string sql = @"SELECT COUNT(1) OVER() AS RowTotal,p.Title,p.Image,p.Author,p.Categories,p.Content,p.PostAuthorId,p.PostId,p.Tags,p.ViewCount,p.Url
                        ,p.AddedOn,p.PublishedOn,a.FirstName,a.LastName,a.Bio as Bio,a.Email as AuthorEmail,a.ProfilePicture as AuthorImage,a.IdentityUserId 
                    FROM dbo.Post as p inner join dbo.AppUser as a on p.PostAuthorId = a.IdentityUserId where p.Tags like @Tag and p.IsActive = @IsActive and p.IsDeleted = @IsDeleted " +
                        "Order By p.AddedOn desc OFFSET @PageNumber - 1 ROWS FETCH NEXT @RowsPerPage ROWS ONLY";

                    IEnumerable<PostWithAuthor> model = await db.QueryAsync<PostWithAuthor>(sql, new { IsActive = true, IsDeleted = false, Tag = "%"+tag+"%", PageNumber = page, RowsPerPage = limit });

                    return model;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<PostWithAuthor>> GetPopularPosts()
        {
            try
            {

                var dbfactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbfactory.GetConnection())
                {
                    await db.OpenAsync();


                    string sql = @"SELECT TOP 5 p.Title,p.Image,p.Author,p.Categories,p.Content,p.PostAuthorId,p.PostId,p.Tags,p.ViewCount,p.Url
                        ,p.AddedOn,p.PublishedOn,,a.FirstName,a.LastName,a.Bio as Bio,a.Email as AuthorEmail,a.ProfilePicture as AuthorImage,a.IdentityUserId 
                    FROM dbo.Post as p inner join dbo.AppUser as a on p.PostAuthorId = a.IdentityUserId where  p.IsActive = @IsActive and p.IsDeleted = @IsDeleted" +
                        "Order By p.ViewCount desc";

                    IEnumerable<PostWithAuthor> model = await db.QueryAsync<PostWithAuthor>(sql,new{ IsActive = true, IsDeleted = false});

                    return model;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<SavePostViewModel> GetWithSeoAsync(int id)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result =
                    await db.QueryFirstAsync<SavePostViewModel>(
                        "select p.*,s.SEOId,s.MetaDescription,s.MetaTitle,s.Image from dbo.Post as p left join Seo as s on p.PostId=s.PageId and s.SeoType='article' where  p.IsDeleted = @IsDeleted and p.PostId = @PostId",
                        new { IsDeleted = false, PostId = id });
                return result;
            }
        }

        public async  Task<bool> CheckUrlExists(string url)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result = await db.QueryAsync<int>("Select 1 from dbo.Post Where IsActive=@isActive and IsDeleted= @isDeleted and URL='@URL'", new { isActive = true, isDeleted = false, URL = url });
                return result != null && (result.SingleOrDefault() == 1 ? true : false);
            }
        }

        public async Task<IEnumerable<Post>> GetRecentPosts(int offset, int limit)
        {
            
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
             return await db.QueryAsync<Post>("[dbo].[usp_Blog_GetRecentPosts]", new { Offset=offset,Limit= limit },commandType:CommandType.StoredProcedure);
               
            }
        }

        public async Task<SavePostViewModel> GetByUrlWithSeoAsync(string url)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var result =
                    await db.QueryFirstAsync<SavePostViewModel>(
                        "select p.*,s.SEOId,s.MetaDescription,s.MetaTitle,s.Image from dbo.Post as p left join Seo as s on p.PostId=s.PageId and s.SeoType='article' where  p.IsDeleted = @IsDeleted and p.Url = @Url",
                        new { IsDeleted = false, Url = url });
                return result;
            }
        }
    }
}
