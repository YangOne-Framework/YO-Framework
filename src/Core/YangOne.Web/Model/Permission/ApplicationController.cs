using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web
{
    [Table("ApplicationController")]
    public class ApplicationController
    {
        [Key]
        public int ApplicationControllerId { get; set; }
        public string Name { get; set; }
        [IgnoreAll]
        public int RowTotal { get; set; }
    }
}
