using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel;

public class DeviceRemovalViewModel
{
    [Required]
    public long UserDeviceId { get; set; }
}