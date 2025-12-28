using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Model
{
    [Table("AuditLog")]
    public class Audit
    {
        [Key]
        public long AuditId { get; set; }
        public string Url { get; set; }
        public string Action { get; set; }
        public int Duration { get; set; }
        public string UserName { get; set; }
        public string Role { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public string RequestObject { get; set; }
        [IgnoreInsert]
        public DateTime AddedOn { get; set; }
        [IgnoreAll]
        public int RowTotal { get; set; }


    }
}
