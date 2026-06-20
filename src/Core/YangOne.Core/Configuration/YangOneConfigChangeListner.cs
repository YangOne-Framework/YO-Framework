// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.Extensions.Hosting;

namespace YangOne.Configuration;

/// <summary>
/// Listens for configuration changes and stops the application to reload.
/// </summary>
public class YangOneConfigChangeListener : IConfigChangeListener
{
    private readonly IHostApplicationLifetime _applicationLifetime;

    public YangOneConfigChangeListener(IHostApplicationLifetime applicationLifetime)
    {
        _applicationLifetime = applicationLifetime;
    }
    public async Task<bool> Update()
    {
        _applicationLifetime.StopApplication();
        return true;
    }
}
