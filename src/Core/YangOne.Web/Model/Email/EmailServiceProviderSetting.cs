using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;
    [Table("EmailServiceProviderSetting")]
    public class EmailServiceProviderSetting
    {
        [Key]
        public int EmailServiceProviderSettingId { get; set; }
        public int EmailServiceProviderId { get; set; }
        [Required]
        public string ProviderKey { get; set; }
        [Required]
        public string ProviderValue { get; set; }
    }
    public class EmailServiceProviderSettingViewModel
    {
        public string SystemName { get; set; }
    }
