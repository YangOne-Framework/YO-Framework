// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace YangOne.Plugin;

/// <summary>
/// Data transfer object for uploading a new plugin.
/// </summary>
public class NewPluginDto
{
    [Required]
    public IFormFile PluginZipFile { get; set; }

    public string SystemName { get; set; }
}
