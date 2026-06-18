// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Threading;
using System.Threading.Tasks;

namespace YangOne.Job
{
    /// <summary>
    /// Manages the background job engine lifecycle.
    /// </summary>
    public interface IJobEngine
    {
        /// <summary>Starts the background job engine.</summary>
        Task StartAsync(CancellationToken cancellationToken = default);

        /// <summary>Stops the background job engine gracefully.</summary>
        Task StopAsync(CancellationToken cancellationToken = default);

        /// <summary>Whether the engine is currently running.</summary>
        bool IsRunning { get; }
    }
}
