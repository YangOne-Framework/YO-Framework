// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Job
{
    /// <summary>
    /// Combined interface for fire-and-forget execution, recurring scheduling, engine lifecycle, and monitoring.
    /// </summary>
    public interface IJobManager : IJobRunner, IRecurringJobScheduler, IJobEngine, IJobMonitor
    {
    }
}
