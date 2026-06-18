// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Threading.Tasks;

namespace YangOne.Caching
{
    /// <summary>
    /// Defines cache lifecycle initialization and termination operations.
    /// </summary>
    public interface ICacheConfig
    {
        Task Init();
        Task Terminate();
    }
}
