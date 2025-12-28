using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model.CountrollerRoute
{
    [Table("AppController")]
    public class AppController
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
