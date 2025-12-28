using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.BlogEngine.Model
{
    [Table("PostSetting")]
    public class PostSetting
    {
        [Key]
        public int PostSettingId { get; set; }
        public int RecentPostPerPage { get; set; }
        public int RecentPostPerRow { get; set; }
        public bool UseNextPrev { get; set; }//next prev or pagination
        public bool ShowDescriptionInRecentPost { get; set; }
        public int ShowDescriptionInLine { get; set; }

    }
}