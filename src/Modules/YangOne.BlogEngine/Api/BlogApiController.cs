using Microsoft.AspNetCore.Mvc;
using System.Runtime.Intrinsics.Arm;
using YangOne.BlogEngine.Model;
using YangOne.BlogEngine.Service;
using YangOne.BlogEngine.ViewModel;
using YangOne.Data.Extension;
using YangOne.Log;
using YangOne.Web.API;

namespace YangOne.BlogEngine.Api
{
    [Route("api/v1/post")]
    public class BlogApiController : BaseApiController
    {
        private readonly IBlogService _blogService;
        public ILogger Logger { get; }

        public BlogApiController(IBlogService blogService, ILogger logger)
        {
            _blogService = blogService;

            Logger = logger;
        }
        [HttpGet]
        [Route("all")]
        public async Task<dynamic> GetAllPosts(int offset = 1, int limit = 10,string query="")
        {
            try
            {
                var posts =  await _blogService.PostCrudService.GetListPagedAsync(
                    offset,
                    limit,
                    limit,
                    "Where IsDeleted=@IsDeleted and Title like @Title",
                    "AddedOn desc",
                    new { IsDeleted = false, Title = "%" + query + "%" });
                return SuccessResponse("Saved successfully", posts);
            }
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }
        [HttpGet]
        [Route("latest")]
        public async Task<dynamic> GetLatestPosts(int offset = 1,int limit=12)
        {
            try
            {
               // var setting = await _blogService.SettingCrudService.GetAsync(1);
                //int postsperpage = setting == null ? 10 : setting.RecentPostPerPage;
                var posts = await _blogService.GetRecentPosts(offset, limit);
                return SuccessResponse("Saved successfully", posts);
			}
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }
        [HttpGet]
        [Route("detail/{url}")]
        public async Task<dynamic> GetDetailByUrl(string url)
        {
            try
            {
                var detail = await _blogService.GetByUrlWithSeoAsync(url);
               // var detail = await _blogService.PostCrudService.GetAsync("Where Url=@Url and IsActive=@IsActive", new {IsActive=true,Url = url});
				return SuccessResponse("Fetched successfully", detail);

            }
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }
        [HttpGet]
        [Route("setting")]
        public async Task<dynamic> GetSettings()
        {
            try
            {
                var setting = await _blogService.SettingCrudService.GetAsync(1);
                return SuccessResponse("Fetched successfully", setting);
				
            }
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }
        [HttpGet]
        [Route("related/all")]
        public async Task<dynamic> GetRelatedPosts(int page = 1, int limit = 10,int postId=0)
        {
            try
            {
                var categories = await _blogService.CategoryService.GetListPagedAsync(page, limit, 1, "Where IsActive=@IsActive and IsDeleted=@IsDeleted", "Name asc", new { IsActive = true, IsDeleted=false });
				return SuccessResponse("Fetched successfully", categories);
			}
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }

        [HttpGet]
        [Route("category/all")]
        public async Task<dynamic> GetAllCategory(int page = 1,int limit=10)
        {
            try
            {
               var categories= await _blogService.CategoryService.GetListPagedAsync(page, limit, 1, "Where IsActive=@IsActive", "Name asc",new{ IsActive =true});
             
                return SuccessResponse("Fetched successfully", categories);
			}
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }


        [HttpPost]
        [Route("category/save")]
        public async Task<dynamic> SaveCategoty(PostCategory model)
        {
            try
            {

                model.AutoFill();
                if (model.PostCategoryId == 0)
                {
                    var id = await _blogService.CategoryService.InsertAsync<int>(model);
                    model.PostCategoryId = id;
                }
                else
                {
                    await _blogService.CategoryService.UpdateAsync(model);
                }
                return SuccessResponse("Saved successfully", model);
			}
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }

        [HttpPost]
        [Route("save")]
        public async Task<dynamic> SavePost(SavePostViewModel model)
        {
            try
            {
                model.AutoFill();
                model.PublishedOn = DateTime.Now;
                model.AddedOn = DateTime.Now;
                var id = await _blogService.SavePost(model);
                model.PostId = id;
                return SuccessResponse("Saved successfully", model);
			}
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }


        [HttpPost]
        [Route("setting/save")]
        public async Task<dynamic> SaveSetting(PostSetting model)
        {
            try
            {

                model.AutoFill();
                var id = await _blogService.SettingCrudService.UpdateAsync(model);
                return SuccessResponse("Saved successfully", model);
			}
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }

        [HttpGet]
        [Route("popular")]
        public async Task<dynamic> GetPopularPosts()
        {
            try
            {
                // var model = await BlogService.PostCrudService.QueryListAsync("select TOP 5 * from [dbo].[Post] order by ViewCount desc");

                var model = await _blogService.GetPopularPosts();
                return HttpResponse(200, "", model);
                return SuccessResponse("Fetched successfully", model);
			}
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }

        [HttpGet]
        [Route("byid")]
        public async Task<dynamic> GetPostById(int id )
        {
            try
            {
                
                var model = await _blogService.GetWithSeoAsync(id);
                return SuccessResponse("Fetched successfully", model);
            }
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }

        [HttpDelete]
        [Route("delete/{id}")]
        public async Task<dynamic> DeletePost(int id)
        {
            try
            {
                var model = await _blogService.PostCrudService.DeleteAsync(id);
                return SuccessResponse("Saved successfully", model);
            }
            catch (Exception e)
            {
                Logger.Log(LogType.Error, () => e.Message, e);
                return HttpResponse(500, e.Message);
            }

        }
    }
}