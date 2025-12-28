using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model
{
    [Table("SeoSetting")]
    public class SEOSetting
    {
        [Key]
        public int SEOSettingId { get; set; }
    }
}