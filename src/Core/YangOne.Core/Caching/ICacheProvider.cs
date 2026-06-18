// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Caching
{
    /// <summary>
    /// Provides named cache service instances.
    /// </summary>
    public interface ICacheProvider
    {
        ICacheService Get(string name);
    }
}
