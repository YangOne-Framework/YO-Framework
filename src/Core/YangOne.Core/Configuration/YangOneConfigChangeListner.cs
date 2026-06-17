// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.Extensions.Hosting;

namespace YangOne.Configuration;

public class YangOneConfigChangeListner : IConfigChangeListner
{
    private readonly IHostApplicationLifetime _applicationLifetime;

    public YangOneConfigChangeListner(IHostApplicationLifetime applicationLifetime)
    {
        _applicationLifetime = applicationLifetime;
    }
    public async Task<bool> Update()
    {
        _applicationLifetime.StopApplication();
        return true;
    }
}
