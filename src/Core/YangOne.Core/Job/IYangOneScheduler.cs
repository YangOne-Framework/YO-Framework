// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;

namespace YangOne.Job
{
    /// <summary>
    /// Legacy marker extending the current IRecurringJobScheduler.
    /// </summary>
    [Obsolete("Use IRecurringJobScheduler instead. This interface will be removed in a future version.")]
    public interface IYangOneScheduler : IRecurringJobScheduler
    {
    }
}
