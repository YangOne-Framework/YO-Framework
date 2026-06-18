// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Threading;
using System.Threading.Tasks;
using Quartz;
using YangOne.Job;

namespace YangOne.BackgroundJobRunner.Quartz
{
    /// <summary>
    /// Quartz.NET implementation of IJobEngine for scheduler lifecycle management.
    /// </summary>
    public class QuartzJobEngine : IJobEngine
    {
        private readonly ISchedulerFactory _schedulerFactory;
        private IScheduler _scheduler;

        public QuartzJobEngine(ISchedulerFactory schedulerFactory)
        {
            _schedulerFactory = schedulerFactory;
        }

        public bool IsRunning { get; private set; }

        public async Task StartAsync(CancellationToken cancellationToken = default)
        {
            if (IsRunning) return;
            _scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
            if (!_scheduler.IsStarted)
            {
                await _scheduler.Start(cancellationToken);
            }
            IsRunning = true;
        }

        public async Task StopAsync(CancellationToken cancellationToken = default)
        {
            if (!IsRunning || _scheduler == null) return;
            await _scheduler.Shutdown(true, cancellationToken);
            _scheduler = null;
            IsRunning = false;
        }
    }
}
