// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using YOJob = YangOne.Job.IJob;

namespace YangOne.BackgroundJobRunner.Quartz
{
    public class QuartzJobAdapter<T> : global::Quartz.IJob where T : YOJob
    {
        private readonly IServiceProvider _serviceProvider;

        public QuartzJobAdapter(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            var job = _serviceProvider.GetRequiredService<T>();
            var jobContext = new YangOne.Job.JobContext
            {
                JobId = context.FireInstanceId,
                JobName = context.JobDetail.Key.Name,
                Parameters = new Dictionary<string, object>(),
                CancellationToken = context.CancellationToken,
                ServiceProvider = _serviceProvider
            };

            foreach (var key in context.MergedJobDataMap.Keys)
                jobContext.Parameters[key] = context.MergedJobDataMap[key];

            var result = await job.ExecuteAsync(jobContext);
            context.Result = result;
        }
    }

    public class ExpressionJobAdapter : global::Quartz.IJob
    {
        public async Task Execute(IJobExecutionContext context)
        {
            await Task.CompletedTask;
        }
    }

    public class InstanceJobAdapter : global::Quartz.IJob
    {
        public async Task Execute(IJobExecutionContext context)
        {
            var job = context.JobDetail.JobDataMap["JobInstance"] as YOJob;
            if (job != null)
            {
                var jobContext = new YangOne.Job.JobContext
                {
                    JobId = context.FireInstanceId,
                    JobName = context.JobDetail.Key.Name,
                    CancellationToken = context.CancellationToken,
                    ServiceProvider = context.Scheduler.Context.Get("ServiceProvider") as IServiceProvider
                };

                var result = await job.ExecuteAsync(jobContext);
                context.Result = result;
            }
        }
    }
}
