using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;
    [Table("SMSGatewaySetting")]
    public class SMSGatewaySetting
    {
        [Key]
        public int SMSGatewaySettingId { get; set; }
        public int SMSGatewayId { get; set; }
        [Required]
        public string GatewayKey { get; set; }
        [Required]
        public string GatewayValue { get; set; }
    }

