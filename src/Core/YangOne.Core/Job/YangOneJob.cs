// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Linq.Expressions;

namespace YangOne.Job
{
    public class YangOneJob
    {
        public string JobName { get; set; }
        public Expression<Action> Job { get; set; }
        public string Cron { get; set; }
        public TimeSpan ScheduledTimeSpan { get; set; }
    }
}
