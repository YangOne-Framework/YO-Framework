using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;
    [Table("ApplicationControllerAction")]
    public class ApplicationControllerAction
    {
        [Key]
        public int ApplicationControllerActionId { get; set; }
        public int ApplicationControllerId { get; set; }
        public string ActionUrl { get; set; }
        public string RouteUrl { get; set; }
        public string FriendlyName { get; set; }
    }

