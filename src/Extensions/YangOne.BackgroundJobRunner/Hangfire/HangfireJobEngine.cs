// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using YangOne.Job;

namespace YangOne.BackgroundJobRunner.Hangfire
{
    /// <summary>
    /// Hangfire implementation of IJobEngine for lifecycle management.
    /// </summary>
    public class HangfireJobEngine : IJobEngine
    {
        private BackgroundJobServer _server;
        private readonly BackgroundJobServerOptions _options;

        public HangfireJobEngine()
        {
            _options = new BackgroundJobServerOptions
            {
                WorkerCount = Environment.ProcessorCount * 2,
                SchedulePollingInterval = TimeSpan.FromSeconds(15)
            };
            IsRunning = false;
        }

        public bool IsRunning { get; private set; }

        public Task StartAsync(CancellationToken cancellationToken = default)
        {
            if (IsRunning) return Task.CompletedTask;
            _server = new BackgroundJobServer(_options);
            IsRunning = true;
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken = default)
        {
            if (!IsRunning) return Task.CompletedTask;
            _server?.SendStop();
            _server?.Dispose();
            _server = null;
            IsRunning = false;
            return Task.CompletedTask;
        }
    }
}
