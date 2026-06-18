// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using YOJob = YangOne.Job.IJob;

namespace YangOne.BackgroundJobRunner.Quartz
{
    public class QuartzJobRunner : YangOne.Job.IJobRunner
    {
        private readonly ISchedulerFactory _schedulerFactory;
        private readonly IServiceProvider _serviceProvider;

        public QuartzJobRunner(ISchedulerFactory schedulerFactory, IServiceProvider serviceProvider)
        {
            _schedulerFactory = schedulerFactory;
            _serviceProvider = serviceProvider;
        }

        public async Task<string> EnqueueAsync(Expression<Action> methodCall)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobDetail = JobBuilder.Create<ExpressionJobAdapter>()
                .WithIdentity(Guid.NewGuid().ToString()).Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity(Guid.NewGuid().ToString()).StartNow().Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobDetail.Key.Name;
        }

        public async Task<string> EnqueueAsync<T>(Expression<Action<T>> methodCall) where T : YOJob
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobDetail = JobBuilder.Create<QuartzJobAdapter<T>>()
                .WithIdentity(Guid.NewGuid().ToString()).Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity(Guid.NewGuid().ToString()).StartNow().Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobDetail.Key.Name;
        }

        public async Task<string> EnqueueAsync(YOJob job)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobDetail = JobBuilder.Create<InstanceJobAdapter>()
                .WithIdentity(Guid.NewGuid().ToString()).Build();
            jobDetail.JobDataMap.Put("JobInstance", job);
            var trigger = TriggerBuilder.Create()
                .WithIdentity(Guid.NewGuid().ToString()).StartNow().Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobDetail.Key.Name;
        }

        public async Task<string> ScheduleAsync(Expression<Action> methodCall, TimeSpan delay)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobDetail = JobBuilder.Create<ExpressionJobAdapter>()
                .WithIdentity(Guid.NewGuid().ToString()).Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity(Guid.NewGuid().ToString())
                .StartAt(DateTimeOffset.UtcNow.Add(delay)).Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobDetail.Key.Name;
        }

        public async Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, TimeSpan delay) where T : YOJob
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobDetail = JobBuilder.Create<QuartzJobAdapter<T>>()
                .WithIdentity(Guid.NewGuid().ToString()).Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity(Guid.NewGuid().ToString())
                .StartAt(DateTimeOffset.UtcNow.Add(delay)).Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobDetail.Key.Name;
        }

        public async Task<string> ScheduleAsync(Expression<Action> methodCall, DateTimeOffset runAt)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobDetail = JobBuilder.Create<ExpressionJobAdapter>()
                .WithIdentity(Guid.NewGuid().ToString()).Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity(Guid.NewGuid().ToString()).StartAt(runAt).Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobDetail.Key.Name;
        }

        public async Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, DateTimeOffset runAt) where T : YOJob
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobDetail = JobBuilder.Create<QuartzJobAdapter<T>>()
                .WithIdentity(Guid.NewGuid().ToString()).Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity(Guid.NewGuid().ToString()).StartAt(runAt).Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobDetail.Key.Name;
        }

        public Task<string> ContinueWithAsync(string parentJobId, Expression<Action> methodCall)
        {
            throw new NotSupportedException(
                "Quartz does not support continuations. Use trigger dependencies instead.");
        }

        public async Task<bool> DeleteAsync(string jobId)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            return await scheduler.DeleteJob(new JobKey(jobId));
        }

        public async Task<YangOne.Job.JobResult> GetJobStatusAsync(string jobId)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKey = new JobKey(jobId);
            var executing = await scheduler.GetCurrentlyExecutingJobs();
            var isExecuting = executing.Any(j => j.JobDetail.Key == jobKey);

            return new YangOne.Job.JobResult
            {
                JobId = jobId,
                StartedAt = DateTime.UtcNow,
                Succeeded = !isExecuting,
                CompletedAt = isExecuting ? null : DateTime.UtcNow
            };
        }
    }
}
