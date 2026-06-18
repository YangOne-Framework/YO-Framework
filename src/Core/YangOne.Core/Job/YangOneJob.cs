// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Threading;

namespace YangOne.Job
{
    public class JobContext
    {
        public string JobId { get; set; }
        public string JobName { get; set; }
        public IDictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
        public CancellationToken CancellationToken { get; set; }
        public IServiceProvider ServiceProvider { get; set; }
    }

    public class JobResult
    {
        public bool Succeeded { get; set; }
        public string JobId { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public TimeSpan? Duration => CompletedAt.HasValue ? CompletedAt.Value - StartedAt : null;
    }

    public class RecurringJobInfo
    {
        public string JobId { get; set; }
        public string JobName { get; set; }
        public string CronExpression { get; set; }
        public DateTime? NextExecution { get; set; }
        public DateTime? LastExecution { get; set; }
        public bool Enabled { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class JobInfo
    {
        public string JobId { get; set; }
        public string MethodName { get; set; }
        public object[] Arguments { get; set; }
    }

    public class SucceededJobInfo : JobInfo
    {
        public long? TotalDuration { get; set; }
        public DateTime? SucceededAt { get; set; }
    }

    public class FailedJobInfo : JobInfo
    {
        public DateTime? FailedAt { get; set; }
        public string Reason { get; set; }
    }

    public class PagedResult<T>
    {
        public long? TotalCount { get; set; }
        public IEnumerable<T> Items { get; set; }
    }

    public class WorkerInfo
    {
        public string Name { get; set; }
        public int WorkersCount { get; set; }
        public string[] Queues { get; set; }
        public string Status { get; set; }
        public DateTime? StartedAt { get; set; }
    }

    public class WorkerStatusOverview
    {
        public int TotalServers { get; set; }
        public int TotalWorkers { get; set; }
        public int ActiveJobs { get; set; }
        public IEnumerable<WorkerInfo> Workers { get; set; }
    }

    public class JobStats
    {
        public int Servers { get; set; }
        public int Queues { get; set; }
        public long Succeeded { get; set; }
        public long Failed { get; set; }
        public int Processing { get; set; }
        public int Enqueued { get; set; }
        public int Scheduled { get; set; }
        public long Deleted { get; set; }
        public int Recurring { get; set; }
    }
}
