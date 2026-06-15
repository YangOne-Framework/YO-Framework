using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;
    [Table("AppControllerUrl")]
    public class AppControllerUrl
    {
        [Key]
        public int Id { get; set; }
        public int ControllerId { get; set; }
        public string ActionUrl { get; set; }
        public string RouteUrl { get; set; }
        public string FriendlyUrl { get; set; }
    }

