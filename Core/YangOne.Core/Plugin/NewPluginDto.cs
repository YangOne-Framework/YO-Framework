using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace YangOne.Plugin;

public class NewPluginDto
{
    [Required]
    public IFormFile PluginZipFile { get; set; }

    public string SystemName { get; set; }
}