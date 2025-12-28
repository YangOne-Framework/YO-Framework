using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using YangOne.BlogEngine.Model;
using YangOne.Data.Crud.Attribute;
using YangOne.Web.Model;

namespace YangOne.BlogEngine.ViewModel
{
    public class PostWithAuthor: Post
    {
       
        public string FullName { get; set; }
        public string AuthorImage { get; set; }
        public string Bio { get; set; }

        public string AuthorEmail { get; set; }
    }

    public class SavePostViewModel : SEO
    {

        public long PostId { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Url { get; set; }
        public string ThumbnailImage { get; set; }
        public string CoverImage { get; set; }
        [Required]
        public string Content { get; set; }
        public string Tags { get; set; }
        public string Categories { get; set; }
      //  [Required]
       // public string Author { get; set; }
      
        public long PostAuthorId { get; set; }
        public int ViewCount { get; set; }
        public DateTime PublishedOn { get; set; } = DateTime.Today;

        [IgnoreAll]
        public  int RowTotal { get; set; }
        [IgnoreAll]
        public IFormFile ThumbnailImageFile { get; set; }
        [IgnoreAll]
        public IFormFile CoverImageFile { get; set; }

        public bool IsNew { get; set; }
        public string OldUrl { get; set; }
        public bool IsVideoContent { get; set; }
        public string VideoLink { get; set; }
        public string RecommendationMetaTags { get; set; }
        public bool IsPublic { get; set; }
    }
}