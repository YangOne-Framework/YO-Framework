using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using YangOne.Data.Crud.Attribute;

namespace YangOne.BlogEngine.Model
{
    [Table("Post")]
    public class Post:BaseProps
    {
        [Key]
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

        [IgnoreUpdate]
        public long PostAuthorId { get; set; }
        public int ViewCount { get; set; }
        public DateTime PublishedOn { get; set; }
        public bool IsVideoContent { get; set; }
        public string VideoLink { get; set; }
        public string RecommendationMetaTags { get; set; }
        public bool IsPublic { get; set; }
       
        [IgnoreAll]
        public IFormFile ThumbnailImageFile { get; set; }
        [IgnoreAll]
        public IFormFile CoverImageFile { get; set; }
        [IgnoreAll]
        public string Author { get; set; }
    }
}