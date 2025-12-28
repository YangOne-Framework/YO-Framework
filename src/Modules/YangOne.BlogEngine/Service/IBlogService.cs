using System.Threading.Tasks;
using System.Collections.Generic;
using YangOne.BlogEngine.Model;
using YangOne.BlogEngine.ViewModel;
using YangOne.Data;
using System.Collections;

namespace YangOne.BlogEngine.Service
{
    public interface IBlogService
    {
        CrudService<PostCategory> CategoryService { get; set; }
        CrudService<Post> PostCrudService { get; set; }
        CrudService<PostSetting> SettingCrudService { get; set; }

        Task<long> SavePost(SavePostViewModel model);

        Task<IEnumerable<PostWithAuthor>> GetPostWithAuthor(int page,int limit);
        Task<IEnumerable<PostWithAuthor>> GetPostByAuthor(int page, int limit, string authorName = ""); 
        Task<IEnumerable<PostWithAuthor>> GetPostByTitle(int page, int limit, string title = "");
        Task<IEnumerable<PostWithAuthor>> GetPostByTags(int page, int limit, string tags = "");

        Task<IEnumerable<PostWithAuthor>> GetPopularPosts();
        Task<SavePostViewModel> GetWithSeoAsync(int id);
        Task<bool> CheckUrlExists(string url);
        Task<IEnumerable<Post>> GetRecentPosts(int offset, int limit);
        Task<SavePostViewModel> GetByUrlWithSeoAsync(string url);
    }
}