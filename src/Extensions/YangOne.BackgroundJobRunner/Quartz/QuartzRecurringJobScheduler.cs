// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Quartz;
using Quartz.Impl.Matchers;
using YOJob = YangOne.Job.IJob;

namespace YangOne.BackgroundJobRunner.Quartz
{
    public class QuartzRecurringJobScheduler : YangOne.Job.IRecurringJobScheduler
    {
        private readonly ISchedulerFactory _schedulerFactory;
        private readonly IServiceProvider _serviceProvider;

        public QuartzRecurringJobScheduler(ISchedulerFactory schedulerFactory, IServiceProvider serviceProvider)
        {
            _schedulerFactory = schedulerFactory;
            _serviceProvider = serviceProvider;
        }

        public async Task<string> RegisterAsync(string jobId, Expression<Action> methodCall, string cronExpression)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKey = new JobKey(jobId);
            var jobDetail = JobBuilder.Create<ExpressionJobAdapter>()
                .WithIdentity(jobKey).StoreDurably().Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity($"{jobId}-trigger")
                .WithCronSchedule(cronExpression, c =>
                {
                    c.InTimeZone(TimeZoneInfo.Utc);
                    c.WithMisfireHandlingInstructionDoNothing();
                })
                .ForJob(jobKey).Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobId;
        }

        public async Task<string> RegisterAsync<T>(string jobId, Expression<Action<T>> methodCall, string cronExpression) where T : YOJob
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKey = new JobKey(jobId);
            var jobDetail = JobBuilder.Create<QuartzJobAdapter<T>>()
                .WithIdentity(jobKey).StoreDurably().Build();
            var trigger = TriggerBuilder.Create()
                .WithIdentity($"{jobId}-trigger")
                .WithCronSchedule(cronExpression, c =>
                {
                    c.InTimeZone(TimeZoneInfo.Utc);
                    c.WithMisfireHandlingInstructionDoNothing();
                })
                .ForJob(jobKey).Build();
            await scheduler.ScheduleJob(jobDetail, trigger);
            return jobId;
        }

        public async Task<bool> RemoveAsync(string jobId)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            return await scheduler.DeleteJob(new JobKey(jobId));
        }

        public async Task<bool> TriggerAsync(string jobId)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            await scheduler.TriggerJob(new JobKey(jobId));
            return true;
        }

        public async Task<bool> PauseAsync(string jobId)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            await scheduler.PauseJob(new JobKey(jobId));
            return true;
        }

        public async Task<bool> ResumeAsync(string jobId)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            await scheduler.ResumeJob(new JobKey(jobId));
            return true;
        }

        public async Task<IEnumerable<YangOne.Job.RecurringJobInfo>> GetJobsAsync()
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKeys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());

            var result = new List<YangOne.Job.RecurringJobInfo>();
            foreach (var key in jobKeys)
            {
                var triggers = await scheduler.GetTriggersOfJob(key);
                var cronTrigger = triggers.OfType<ICronTrigger>().FirstOrDefault();
                result.Add(new YangOne.Job.RecurringJobInfo
                {
                    JobId = key.Name,
                    JobName = key.Name,
                    CronExpression = cronTrigger?.CronExpressionString,
                    NextExecution = cronTrigger?.GetNextFireTimeUtc()?.UtcDateTime,
                    LastExecution = cronTrigger?.GetPreviousFireTimeUtc()?.UtcDateTime,
                    Enabled = cronTrigger != null,
                    CreatedAt = DateTime.MinValue
                });
            }

            return result;
        }
    }
}
