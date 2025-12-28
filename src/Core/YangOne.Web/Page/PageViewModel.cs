using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Web.Model;

namespace YangOne.Web
{
    [Table("Page")]
    public class PageViewModel : SEO
    {
        public new long PageId { get; set; }
        [Required(ErrorMessage ="Page.Name.Required")]
        public string Name { get; set; }
        public new string Url { get; set; }
        public string Content { get; set; }
        public bool UseMasterLayout { get; set; }
        public bool IsPublished { get; set; }
        public bool IsNew { get; set; }
        public string OldUrl { get; set; }
        public bool IsBackend { get; set; }
        public bool IsSystem { get; set; }

    }
}