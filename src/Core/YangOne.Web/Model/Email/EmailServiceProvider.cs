using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Model;
    [Table("EmailServiceProvider")]
    public class EmailServiceProvider
    {
        [Key]
        public int EmailServiceProviderId { get; set; }
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public string Image { get; set; }

        public bool IsDefault { get; set; }

        public bool IsActive { get; set; }
        [AutoFill(AutoFillProperty.CurrentDate)]
        public DateTime AddedOn { get; set; }
        [AutoFill(AutoFillProperty.CurrentUserId)]
        public long AddedBy { get; set; }
        [IgnoreAll]
        public int RowTotal { get; set; }

        [IgnoreAll] public IFormFile ImageFile { get; set; }

        [IgnoreAll] public List<EmailServiceProviderSetting> EmailServiceProviderSettings { get; set; } = new();
    }
